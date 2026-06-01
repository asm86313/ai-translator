import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

const navLink = { color: '#94a3b8', textDecoration: 'none', fontSize: 14, padding: '4px 0', transition: 'color 0.2s' }

export default async function AdminLayout({ children }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    return (
        <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e2e8f0' }}>
            <nav style={{ background: '#13141f', borderBottom: '1px solid #2d3748', padding: '0 28px', display: 'flex', alignItems: 'center', gap: 28, height: 56 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#60a5fa', marginRight: 8 }}>AIT Admin</span>
                <a href="/admin" style={navLink}>대시보드</a>
                <a href="/admin/domains" style={navLink}>도메인 관리</a>
                <a href="/admin/translations" style={navLink}>번역 관리</a>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{user.email}</span>
                    <LogoutButton />
                </div>
            </nav>
            <main style={{ padding: 32 }}>{children}</main>
        </div>
    )
}
