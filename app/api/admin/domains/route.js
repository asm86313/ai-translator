import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

async function verifyAuth() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function GET() {
    if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const db = createServiceClient()
    const { data } = await db.from('allowed_domains').select('*').order('created_at', { ascending: false })
    return NextResponse.json(data ?? [])
}

export async function POST(request) {
    if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { domain } = await request.json()
    if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 })
    const db = createServiceClient()
    const { error } = await db.from('allowed_domains').insert({ domain: domain.toLowerCase().trim() })
    if (error) return NextResponse.json({ error: '이미 등록된 도메인이거나 오류가 발생했습니다.' }, { status: 400 })
    return NextResponse.json({ ok: true })
}

export async function PATCH(request) {
    if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, active } = await request.json()
    const db = createServiceClient()
    await db.from('allowed_domains').update({ active }).eq('id', id)
    return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
    if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const id = new URL(request.url).searchParams.get('id')
    const db = createServiceClient()
    await db.from('allowed_domains').delete().eq('id', id)
    return NextResponse.json({ ok: true })
}
