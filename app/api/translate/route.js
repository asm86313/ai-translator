import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Redis } from '@upstash/redis'
import { createServiceClient } from '@/lib/supabase/service'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

let redis = null
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    }
} catch (e) {}

const LANG_NAMES = {
    ko: '한국어', en: 'English', 'zh-Hans': '中文(简体)',
    ja: '日本語', vi: 'Tiếng Việt', th: 'ภาษาไทย',
}

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

function makeHash(targetLang, text) {
    return crypto.createHash('md5').update(`${targetLang}:${text}`).digest('hex')
}

function extractDomain(request) {
    const src = request.headers.get('origin') || request.headers.get('referer') || ''
    try { return new URL(src).hostname } catch { return null }
}

async function getDomainConfig(domain) {
    if (!domain) return null
    if (['localhost', '127.0.0.1'].includes(domain) || /^192\.168\./.test(domain)) {
        return { allowed: true, engine: 'claude' }
    }
    try {
        const db = createServiceClient()
        const { data } = await db.from('allowed_domains')
            .select('id, engine')
            .eq('domain', domain)
            .eq('active', true)
            .single()
        if (!data) return null
        return { allowed: true, engine: data.engine || 'claude' }
    } catch { return null }
}

async function translateWithClaude(prompt) {
    const response = await anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        output_config: {
            format: {
                type: 'json_schema',
                schema: {
                    type: 'object',
                    properties: { results: { type: 'array', items: { type: 'string' } } },
                    required: ['results'],
                    additionalProperties: false,
                },
            },
        },
    })
    const textBlock = response.content.find(b => b.type === 'text')
    return JSON.parse(textBlock.text).results
}

async function translateWithGemini(prompt) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: { responseMimeType: 'application/json' },
    })
    const result = await model.generateContent(prompt)
    const parsed = JSON.parse(result.response.text())
    return parsed.results || parsed.translations || Object.values(parsed)
}

async function getCache(hash) {
    if (!redis) return null
    try { return await redis.get(`ait:${hash}`) } catch { return null }
}

async function setCache(hash, value) {
    if (!redis) return
    try { await redis.set(`ait:${hash}`, value, { ex: 60 * 60 * 24 * 30 }) } catch {}
}

async function saveToSupabase(items, targetLang, sourceLang, translations, domain) {
    try {
        const db = createServiceClient()
        const records = items.map((item, i) => ({
            hash: makeHash(targetLang, item.text),
            source_lang: sourceLang,
            target_lang: targetLang,
            source_text: item.text,
            translated_text: translations[i] ?? item.text,
            domain: domain || null,
            is_override: false,
            updated_at: new Date().toISOString(),
        }))
        await db.from('translations').upsert(records, { onConflict: 'hash', ignoreDuplicates: true })
    } catch {}
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: CORS })
}

export async function POST(request) {
    try {
        const domain = extractDomain(request)
        const config = await getDomainConfig(domain)

        if (!config) {
            return NextResponse.json({ error: 'Domain not allowed' }, { status: 403, headers: CORS })
        }

        const { texts, target_lang, source_lang = 'ko' } = await request.json()

        if (!texts?.length || !target_lang) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: CORS })
        }

        if (target_lang === source_lang) {
            return NextResponse.json({ translated_texts: texts.map(t => ({ ...t, text: t.text })) }, { headers: CORS })
        }

        // 1. 캐시 확인
        const results = new Array(texts.length)
        const toTranslate = []

        await Promise.all(texts.map(async (item, i) => {
            const hash = makeHash(target_lang, item.text)
            const cached = await getCache(hash)
            if (cached) {
                results[i] = { index: item.index, text: cached }
            } else {
                toTranslate.push({ ...item, resultIndex: i })
            }
        }))

        // 2. 번역 엔진 호출
        if (toTranslate.length > 0) {
            const targetName = LANG_NAMES[target_lang] || target_lang
            const sourceName = LANG_NAMES[source_lang] || source_lang
            const textList = toTranslate.map((t, i) => `[${i}] ${t.text}`).join('\n')

            const prompt = `Translate the following texts from ${sourceName} to ${targetName}.

Rules:
- Keep __TAG_N__ and __NUM_N__ placeholders exactly as-is
- Only translate visible text content
- Return ONLY a JSON object: { "results": ["translation0", "translation1", ...] }

Texts:
${textList}`

            const translations = config.engine === 'gemini'
                ? await translateWithGemini(prompt)
                : await translateWithClaude(prompt)

            await Promise.all(toTranslate.map(async (item, i) => {
                const translatedText = translations[i] ?? item.text
                results[item.resultIndex] = { index: item.index, text: translatedText }
                await setCache(makeHash(target_lang, item.text), translatedText)
            }))

            await saveToSupabase(toTranslate, target_lang, source_lang, translations, domain)
        }

        return NextResponse.json({ translated_texts: results.filter(Boolean) }, { headers: CORS })
    } catch (error) {
        console.error('[Translate API]', error)
        return NextResponse.json({ error: 'Translation failed' }, { status: 500, headers: CORS })
    }
}
