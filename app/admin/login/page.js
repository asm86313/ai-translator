'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.')
            setLoading(false)
        } else {
            router.push('/admin')
            router.refresh()
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117' }}>
            <div style={{ background: '#1a1b26', border: '1px solid #2d3748', padding: 40, borderRadius: 10, width: 380 }}>
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>관리자 로그인</h1>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>AI Translator 관리자 전용</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #2d3748', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: '#0f1117', color: '#e2e8f0' }}
                        />
                    </div>
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #2d3748', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: '#0f1117', color: '#e2e8f0' }}
                        />
                    </div>
                    {error && (
                        <div style={{ padding: '10px 14px', background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 6, fontSize: 13, color: '#f87171', marginBottom: 16 }}>
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: 12, background: loading ? '#1d4ed8' : '#3b82f6', color: 'white', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
            </div>
        </div>
    )
}
