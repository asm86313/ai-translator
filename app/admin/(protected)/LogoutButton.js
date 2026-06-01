'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            style={{ padding: '5px 14px', background: 'transparent', border: '1px solid #2d3748', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: '#94a3b8' }}
        >
            로그아웃
        </button>
    )
}
