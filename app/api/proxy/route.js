import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

let redis = null
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    }
} catch (e) {}

// 원본 HTML 캐시 (1시간) - 동일 DOM 보장 → 번역 캐시 재사용 가능
async function getCachedHtml(key) {
    if (!redis) return null
    try { return await redis.get(key) } catch { return null }
}

async function setCachedHtml(key, html) {
    if (!redis) return
    try { await redis.set(key, html, { ex: 60 * 60 }) } catch {}
}

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const targetUrl = searchParams.get('url')
    const lang = searchParams.get('lang') || 'ko'
    const engine = searchParams.get('engine') || 'claude'

    if (!targetUrl) {
        return new NextResponse('<p>URL이 필요합니다.</p>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
    }

    try {
        // 1. Redis에서 원본 HTML 조회
        const cacheKey = `proxy:${crypto.createHash('md5').update(targetUrl).digest('hex')}`
        let rawHtml = await getCachedHtml(cacheKey)

        if (rawHtml) {
            console.log(`[Proxy] HTML 캐시 히트: ${targetUrl}`)
        } else {
            // 2. 캐시 없으면 실제 fetch
            console.log(`[Proxy] HTML 원본 fetch: ${targetUrl}`)
            const res = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0',
                },
                redirect: 'follow',
            })

            if (!res.ok) {
                return new NextResponse(errorPage(`페이지를 가져올 수 없습니다. (${res.status})`), {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                })
            }

            rawHtml = await res.text()
            await setCachedHtml(cacheKey, rawHtml)
        }

        // 3. 위젯 주입 (lang/engine은 매번 동적으로)
        const urlObj = new URL(targetUrl)
        const baseHref = `${urlObj.protocol}//${urlObj.host}`

        const injection = `
<base href="${baseHref}">
<div id="ait-target" style="position:fixed;top:12px;right:16px;z-index:99999;font-family:sans-serif;"></div>
<script>
if ('${lang}' !== 'ko') {
    localStorage.setItem('ait_lang', '${lang}')
} else {
    localStorage.removeItem('ait_lang')
}
localStorage.setItem('ait_engine', '${engine}')
window.aitConfig = {
    apiUrl: '${origin}/api/translate',
    sourceLang: 'ko',
    targetElementId: 'ait-target',
    showEngineSelector: false,
}
</script>
<script src="${origin}/widget/ai-translator.js"></script>
`
        let html = rawHtml.includes('</body>')
            ? rawHtml.replace(/<\/body>/i, `${injection}</body>`)
            : rawHtml + injection

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
    } catch (error) {
        return new NextResponse(errorPage(`오류: ${error.message}`), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
    }
}

function errorPage(message) {
    return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;color:#e2e8f0;background:#0f1117;">
        <h2>⚠️ ${message}</h2>
        <p>일부 사이트는 외부 접근을 차단합니다.</p>
    </body></html>`
}
