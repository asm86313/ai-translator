'use client'

import { useState } from 'react'

export default function Home() {
    const [inputUrl, setInputUrl] = useState('')
    const [proxyUrl, setProxyUrl] = useState('')
    const [error, setError] = useState('')

    function handleTranslate(e) {
        e.preventDefault()
        if (!inputUrl.trim()) return
        setError('')

        let url = inputUrl.trim()
        if (!url.startsWith('http')) url = 'https://' + url

        try {
            new URL(url)
            setProxyUrl(`/api/proxy?url=${encodeURIComponent(url)}`)
        } catch {
            setError('올바른 URL을 입력하세요.')
        }
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f1117' }}>

            {/* 상단 툴바 */}
            <form onSubmit={handleTranslate} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', background: '#13141f',
                borderBottom: '1px solid #2d3748', flexShrink: 0,
            }}>
                <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>
                    AIT 번역기
                </span>
                <input
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    placeholder="번역할 페이지 URL 입력 (예: https://www.city.hwaseong.go.kr)"
                    style={{
                        flex: 1, padding: '8px 14px',
                        border: `1px solid ${error ? '#f87171' : '#2d3748'}`,
                        borderRadius: 8, background: '#0f1117',
                        color: '#e2e8f0', fontSize: 14, outline: 'none',
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '8px 22px', background: '#3b82f6', color: 'white',
                        border: 'none', borderRadius: 8, cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
                    }}
                >
                    번역하기
                </button>
                {proxyUrl && (
                    <button
                        type="button"
                        onClick={() => { setProxyUrl(''); setInputUrl('') }}
                        style={{
                            padding: '8px 14px', background: 'transparent',
                            color: '#64748b', border: '1px solid #2d3748',
                            borderRadius: 8, cursor: 'pointer', fontSize: 13,
                        }}
                    >
                        초기화
                    </button>
                )}
            </form>

            {error && (
                <div style={{ padding: '8px 16px', background: '#2d1515', color: '#f87171', fontSize: 13 }}>
                    {error}
                </div>
            )}

            {/* 메인 영역 */}
            {proxyUrl ? (
                <iframe
                    key={proxyUrl}
                    src={proxyUrl}
                    style={{ flex: 1, border: 'none', width: '100%' }}
                    title="번역 페이지"
                />
            ) : (
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'column',
                    gap: 16, color: '#475569',
                }}>
                    <div style={{ fontSize: 48 }}>🌐</div>
                    <p style={{ fontSize: 16, margin: 0 }}>번역할 페이지 URL을 입력하세요</p>
                    <p style={{ fontSize: 13, margin: 0, color: '#334155' }}>
                        예: https://www.city.hwaseong.go.kr
                    </p>
                </div>
            )}
        </div>
    )
}
