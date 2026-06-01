import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

function extractDomain(request) {
    const src = request.headers.get('origin') || request.headers.get('referer') || ''
    try { return new URL(src).hostname } catch { return null }
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: CORS })
}

export async function GET(request) {
    const domain = extractDomain(request)
    const isLocal = domain && (['localhost', '127.0.0.1'].includes(domain) || /^192\.168\./.test(domain))

    try {
        if (domain) {
            const db = createServiceClient()
            const { data } = await db.from('allowed_domains')
                .select('allowed_engines')
                .eq('domain', domain)
                .eq('active', true)
                .single()
            if (data) {
                return NextResponse.json({ allowed_engines: data.allowed_engines || ['claude'] }, { headers: CORS })
            }
        }
    } catch {}

    // DB에 없는 localhost는 기본값 두 엔진 허용
    if (isLocal) return NextResponse.json({ allowed_engines: ['claude', 'gemini'] }, { headers: CORS })

    return NextResponse.json({ allowed_engines: ['claude'] }, { headers: CORS })
}
