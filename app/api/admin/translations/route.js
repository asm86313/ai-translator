import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

let redis = null
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    }
} catch (e) {}

async function verifyAuth() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function GET(request) {
    if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const targetLang = searchParams.get('target_lang')
    const domain = searchParams.get('domain')
    const domainsOnly = searchParams.get('domains_only')
    const offset = parseInt(searchParams.get('offset') ?? '0')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const db = createServiceClient()

    // 도메인 목록만 요청하는 경우
    if (domainsOnly) {
        const { data } = await db.from('translations').select('domain').not('domain', 'is', null)
        const unique = [...new Set((data ?? []).map(r => r.domain))].sort()
        return NextResponse.json(unique)
    }

    let q = db.from('translations').select('*').order('updated_at', { ascending: false }).range(offset, offset + limit - 1)
    if (targetLang) q = q.eq('target_lang', targetLang)
    if (domain) q = q.eq('domain', domain)
    const { data } = await q
    return NextResponse.json(data ?? [])
}

export async function PATCH(request) {
    if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, hash, target_lang, translated_text } = await request.json()
    const db = createServiceClient()

    await db.from('translations')
        .update({ translated_text, is_override: true, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (redis && hash) {
        try { await redis.set(`ait:${hash}`, translated_text, { ex: 60 * 60 * 24 * 30 }) } catch {}
    }

    return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
    if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const hash = searchParams.get('hash')
    const db = createServiceClient()

    await db.from('translations').delete().eq('id', id)

    if (redis && hash) {
        try { await redis.del(`ait:${hash}`) } catch {}
    }

    return NextResponse.json({ ok: true })
}
