import { createServiceClient } from '@/lib/supabase/service'

export default async function AdminDashboard() {
    const db = createServiceClient()
    const [
        { count: totalDomains },
        { count: activeDomains },
        { count: totalTranslations },
        { count: overrides },
    ] = await Promise.all([
        db.from('allowed_domains').select('*', { count: 'exact', head: true }),
        db.from('allowed_domains').select('*', { count: 'exact', head: true }).eq('active', true),
        db.from('translations').select('*', { count: 'exact', head: true }),
        db.from('translations').select('*', { count: 'exact', head: true }).eq('is_override', true),
    ])

    return (
        <div>
            <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>대시보드</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, maxWidth: 600 }}>
                <StatCard title="활성 도메인" value={activeDomains ?? 0} sub={`전체 ${totalDomains ?? 0}개`} color="#60a5fa" />
                <StatCard title="번역 캐시" value={totalTranslations ?? 0} sub={`수정됨 ${overrides ?? 0}개`} color="#34d399" />
            </div>
            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                <QuickLink href="/admin/domains" label="도메인 관리 →" />
                <QuickLink href="/admin/translations" label="번역 관리 →" />
            </div>
        </div>
    )
}

function StatCard({ title, value, sub, color }) {
    return (
        <div style={{ background: '#1a1b26', border: '1px solid #2d3748', padding: '24px 28px', borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 42, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>{sub}</div>
        </div>
    )
}

function QuickLink({ href, label }) {
    return (
        <a href={href} style={{ padding: '10px 20px', background: '#1a1b26', border: '1px solid #2d3748', borderRadius: 8, fontSize: 14, color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
            {label}
        </a>
    )
}
