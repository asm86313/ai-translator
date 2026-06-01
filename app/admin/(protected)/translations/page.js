'use client'

import { useState, useEffect } from 'react'

const LANGS = { en: 'English', 'zh-Hans': '中文', ja: '日本語', vi: 'Tiếng Việt', th: 'ภาษาไทย' }
const PAGE_SIZE = 20

export default function TranslationsPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterLang, setFilterLang] = useState('')
    const [filterDomain, setFilterDomain] = useState('')
    const [domains, setDomains] = useState([])
    const [page, setPage] = useState(0)
    const [editingId, setEditingId] = useState(null)
    const [editText, setEditText] = useState('')

    useEffect(() => { fetchDomains() }, [])
    useEffect(() => { fetchData() }, [filterLang, filterDomain, page])

    async function fetchDomains() {
        const res = await fetch('/api/admin/translations?domains_only=1')
        setDomains(await res.json())
    }

    async function fetchData() {
        setLoading(true)
        const p = new URLSearchParams({ offset: page * PAGE_SIZE, limit: PAGE_SIZE })
        if (filterLang) p.set('target_lang', filterLang)
        if (filterDomain) p.set('domain', filterDomain)
        const res = await fetch(`/api/admin/translations?${p}`)
        setItems(await res.json())
        setLoading(false)
    }

    async function saveEdit(item) {
        await fetch('/api/admin/translations', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, hash: item.hash, target_lang: item.target_lang, translated_text: editText }),
        })
        setEditingId(null)
        fetchData()
    }

    async function deleteItem(item) {
        if (!confirm('삭제하면 Redis 캐시도 함께 삭제됩니다. 계속하시겠습니까?')) return
        await fetch(`/api/admin/translations?id=${item.id}&hash=${encodeURIComponent(item.hash)}`, { method: 'DELETE' })
        fetchData()
    }

    function resetFilters() {
        setFilterLang('')
        setFilterDomain('')
        setPage(0)
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>번역 관리</h1>

                <select value={filterDomain} onChange={e => { setFilterDomain(e.target.value); setPage(0) }} style={selectStyle}>
                    <option value="">전체 도메인</option>
                    {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select value={filterLang} onChange={e => { setFilterLang(e.target.value); setPage(0) }} style={selectStyle}>
                    <option value="">전체 언어</option>
                    {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>

                {(filterDomain || filterLang) && (
                    <button onClick={resetFilters} style={{ padding: '7px 12px', border: '1px solid #2d3748', borderRadius: 6, cursor: 'pointer', fontSize: 13, background: 'transparent', color: '#94a3b8' }}>
                        필터 초기화
                    </button>
                )}

                <span style={{ fontSize: 13, color: '#475569', marginLeft: 'auto' }}>수정됨 = 노란 배경</span>
            </div>

            <div style={{ background: '#1a1b26', border: '1px solid #2d3748', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#13141f', borderBottom: '2px solid #2d3748' }}>
                            <th style={{ ...th, width: '14%' }}>도메인</th>
                            <th style={{ ...th, width: '8%' }}>언어</th>
                            <th style={{ ...th, width: '32%' }}>원문</th>
                            <th style={{ ...th, width: '32%' }}>번역</th>
                            <th style={{ ...th, width: '14%', textAlign: 'right' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#475569' }}>로딩 중...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#475569', fontSize: 14 }}>번역 데이터가 없습니다</td></tr>
                        ) : items.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #1e2433', background: t.is_override ? '#2a2500' : 'transparent' }}>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>
                                    {t.domain || '-'}
                                </td>
                                <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>
                                    {LANGS[t.target_lang] || t.target_lang}
                                    {t.is_override && <span style={{ display: 'block', fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>수정됨</span>}
                                </td>
                                <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8', maxWidth: 0 }}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.source_text}>
                                        {t.source_text}
                                    </div>
                                </td>
                                <td style={{ padding: '11px 14px', fontSize: 13, color: '#cbd5e1', maxWidth: 0 }}>
                                    {editingId === t.id ? (
                                        <textarea
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #3b82f6', borderRadius: 4, fontSize: 13, resize: 'vertical', minHeight: 64, boxSizing: 'border-box', outline: 'none', background: '#0f1117', color: '#e2e8f0' }}
                                        />
                                    ) : (
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.translated_text}>
                                            {t.translated_text}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    {editingId === t.id ? (
                                        <>
                                            <button onClick={() => saveEdit(t)} style={{ padding: '5px 12px', marginRight: 6, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>저장</button>
                                            <button onClick={() => setEditingId(null)} style={{ padding: '5px 12px', border: '1px solid #2d3748', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: '#94a3b8' }}>취소</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setEditingId(t.id); setEditText(t.translated_text) }} style={{ padding: '5px 12px', marginRight: 6, border: '1px solid #2d3748', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: '#94a3b8' }}>수정</button>
                                            <button onClick={() => deleteItem(t)} style={{ padding: '5px 12px', border: '1px solid #7f1d1d', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: '#2d1515', color: '#f87171' }}>삭제</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', alignItems: 'center' }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    style={{ padding: '7px 18px', border: '1px solid #2d3748', borderRadius: 6, cursor: page === 0 ? 'not-allowed' : 'pointer', background: 'transparent', color: '#94a3b8', fontSize: 13, opacity: page === 0 ? 0.4 : 1 }}>
                    이전
                </button>
                <span style={{ fontSize: 13, color: '#64748b', padding: '0 8px' }}>{page + 1} 페이지</span>
                <button onClick={() => setPage(p => p + 1)} disabled={items.length < PAGE_SIZE}
                    style={{ padding: '7px 18px', border: '1px solid #2d3748', borderRadius: 6, cursor: items.length < PAGE_SIZE ? 'not-allowed' : 'pointer', background: 'transparent', color: '#94a3b8', fontSize: 13, opacity: items.length < PAGE_SIZE ? 0.4 : 1 }}>
                    다음
                </button>
            </div>
        </div>
    )
}

const th = { padding: '11px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }
const selectStyle = { padding: '7px 12px', border: '1px solid #2d3748', borderRadius: 6, fontSize: 13, background: '#0f1117', color: '#e2e8f0' }
