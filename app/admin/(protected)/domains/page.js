'use client'

import { useState, useEffect } from 'react'

const ENGINE_LABELS = { claude: 'Claude', gemini: 'Gemini' }
const ENGINE_COLORS = { claude: '#a78bfa', gemini: '#34d399' }

export default function DomainsPage() {
    const [domains, setDomains] = useState([])
    const [newDomain, setNewDomain] = useState('')
    const [newEngine, setNewEngine] = useState('claude')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { fetchDomains() }, [])

    async function fetchDomains() {
        const res = await fetch('/api/admin/domains')
        setDomains(await res.json())
        setLoading(false)
    }

    async function addDomain(e) {
        e.preventDefault()
        if (!newDomain.trim()) return
        setSubmitting(true)
        const res = await fetch('/api/admin/domains', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: newDomain.trim(), engine: newEngine }),
        })
        if (!res.ok) {
            const data = await res.json()
            alert(data.error || '추가 실패')
        }
        setNewDomain('')
        setNewEngine('claude')
        setSubmitting(false)
        fetchDomains()
    }

    async function toggleActive(id, active) {
        await fetch('/api/admin/domains', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, active: !active }),
        })
        fetchDomains()
    }

    async function changeEngine(id, engine) {
        await fetch('/api/admin/domains', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, engine }),
        })
        fetchDomains()
    }

    async function deleteDomain(id) {
        if (!confirm('도메인을 삭제하시겠습니까?')) return
        await fetch(`/api/admin/domains?id=${id}`, { method: 'DELETE' })
        fetchDomains()
    }

    return (
        <div>
            <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>도메인 관리</h1>

            <div style={card}>
                <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>새 도메인 추가</h2>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b' }}>위젯 사용을 허용할 도메인과 번역 엔진을 설정하세요</p>
                <form onSubmit={addDomain} style={{ display: 'flex', gap: 8 }}>
                    <input
                        value={newDomain}
                        onChange={e => setNewDomain(e.target.value)}
                        placeholder="example.com"
                        style={inputStyle}
                    />
                    <select
                        value={newEngine}
                        onChange={e => setNewEngine(e.target.value)}
                        style={{ ...inputStyle, flex: 'none', width: 120 }}
                    >
                        <option value="claude">Claude</option>
                        <option value="gemini">Gemini</option>
                    </select>
                    <button type="submit" disabled={submitting} style={btnPrimary}>
                        {submitting ? '추가 중...' : '추가'}
                    </button>
                </form>
            </div>

            <div style={card}>
                {loading ? (
                    <p style={{ color: '#64748b', fontSize: 14 }}>로딩 중...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #2d3748' }}>
                                {['도메인', '엔진', '상태', '등록일', '관리'].map((h, i) => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: i === 4 ? 'right' : 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {domains.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#475569', fontSize: 14 }}>등록된 도메인이 없습니다</td></tr>
                            ) : domains.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid #1e2433' }}>
                                    <td style={td}><strong style={{ color: '#e2e8f0' }}>{d.domain}</strong></td>
                                    <td style={td}>
                                        <select
                                            value={d.engine || 'claude'}
                                            onChange={e => changeEngine(d.id, e.target.value)}
                                            style={{
                                                padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                                background: '#0f1117', border: `1px solid ${ENGINE_COLORS[d.engine || 'claude']}`,
                                                color: ENGINE_COLORS[d.engine || 'claude'], cursor: 'pointer', outline: 'none'
                                            }}
                                        >
                                            <option value="claude">Claude</option>
                                            <option value="gemini">Gemini</option>
                                        </select>
                                    </td>
                                    <td style={td}>
                                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: d.active ? '#0d2e1a' : '#2d1515', color: d.active ? '#34d399' : '#f87171' }}>
                                            {d.active ? '활성' : '비활성'}
                                        </span>
                                    </td>
                                    <td style={{ ...td, color: '#475569', fontSize: 13 }}>{new Date(d.created_at).toLocaleDateString('ko-KR')}</td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <button onClick={() => toggleActive(d.id, d.active)} style={btnSecondary}>
                                            {d.active ? '비활성화' : '활성화'}
                                        </button>
                                        <button onClick={() => deleteDomain(d.id)} style={btnDanger}>삭제</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

const card = { background: '#1a1b26', border: '1px solid #2d3748', padding: 24, borderRadius: 10, marginBottom: 20 }
const td = { padding: '12px 14px', fontSize: 14, color: '#cbd5e1' }
const inputStyle = { flex: 1, padding: '9px 12px', border: '1px solid #2d3748', borderRadius: 6, fontSize: 14, background: '#0f1117', color: '#e2e8f0', outline: 'none' }
const btnPrimary = { padding: '9px 22px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }
const btnSecondary = { padding: '5px 12px', marginRight: 6, border: '1px solid #2d3748', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: '#94a3b8' }
const btnDanger = { padding: '5px 12px', border: '1px solid #7f1d1d', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: '#2d1515', color: '#f87171' }
