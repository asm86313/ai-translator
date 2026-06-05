'use client'

import { useState } from 'react'

const LANGUAGES = [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'zh-Hans', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'th', name: 'ภาษาไทย' },
]

const ENGINES = [
    { id: 'claude', name: 'Claude' },
    { id: 'gemini', name: 'Gemini' },
]

function buildProxyUrl(url, lang, engine) {
    return `/api/proxy?url=${encodeURIComponent(url)}&lang=${lang}&engine=${engine}`
}

export default function Home() {
    const [inputUrl, setInputUrl] = useState('')
    const [lang, setLang] = useState('en')
    const [engine, setEngine] = useState('claude')
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
            setProxyUrl(buildProxyUrl(url, lang, engine))
        } catch {
            setError('올바른 URL을 입력하세요.')
        }
    }

    function handleLangChange(newLang) {
        setLang(newLang)
        if (proxyUrl) {
            const urlMatch = proxyUrl.match(/url=([^&]+)/)
            if (urlMatch) {
                setProxyUrl(buildProxyUrl(decodeURIComponent(urlMatch[1]), newLang, engine))
            }
        }
    }

    function handleEngineChange(newEngine) {
        setEngine(newEngine)
        if (proxyUrl) {
            const urlMatch = proxyUrl.match(/url=([^&]+)/)
            if (urlMatch) {
                setProxyUrl(buildProxyUrl(decodeURIComponent(urlMatch[1]), lang, newEngine))
            }
        }
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f1117' }}>

            {/* 상단 툴바 */}
            <form onSubmit={handleTranslate} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', background: '#13141f',
                borderBottom: '1px solid #2d3748', flexShrink: 0,
                flexWrap: 'wrap',
            }}>
                <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>
                    AIT 번역기
                </span>

                <input
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    placeholder="번역할 페이지 URL 입력 (예: https://www.city.hwaseong.go.kr)"
                    style={{
                        flex: 1, minWidth: 200, padding: '8px 14px',
                        border: `1px solid ${error ? '#f87171' : '#2d3748'}`,
                        borderRadius: 8, background: '#0f1117',
                        color: '#e2e8f0', fontSize: 14, outline: 'none',
                    }}
                />

                {/* 언어 선택 */}
                <select
                    value={lang}
                    onChange={e => handleLangChange(e.target.value)}
                    style={selectStyle}
                >
                    {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                </select>

                {/* 엔진 선택 */}
                <select
                    value={engine}
                    onChange={e => handleEngineChange(e.target.value)}
                    style={{ ...selectStyle, minWidth: 100 }}
                >
                    {ENGINES.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>

                <button type="submit" style={btnStyle}>번역하기</button>

                {proxyUrl && (
                    <button
                        type="button"
                        onClick={() => { setProxyUrl(''); setInputUrl('') }}
                        style={{ ...btnStyle, background: 'transparent', color: '#64748b', border: '1px solid #2d3748' }}
                    >
                        초기화
                    </button>
                )}
            </form>

            {error && (
                <div style={{ padding: '8px 16px', background: '#2d1515', color: '#f87171', fontSize: 13, flexShrink: 0 }}>
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

const selectStyle = {
    padding: '8px 12px', border: '1px solid #2d3748', borderRadius: 8,
    background: '#0f1117', color: '#e2e8f0', fontSize: 14, cursor: 'pointer',
    outline: 'none', minWidth: 120,
}

const btnStyle = {
    padding: '8px 22px', background: '#3b82f6', color: 'white',
    border: 'none', borderRadius: 8, cursor: 'pointer',
    fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
}
