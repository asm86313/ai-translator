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

function normalizeUrl(input) {
    const url = input.trim()
    return url.startsWith('http') ? url : 'https://' + url
}

export default function Home() {
    const [inputUrl, setInputUrl] = useState('')
    const [currentUrl, setCurrentUrl] = useState('')  // 현재 로드된 URL
    const [lang, setLang] = useState('en')
    const [engine, setEngine] = useState('claude')
    const [proxyUrl, setProxyUrl] = useState('')
    const [error, setError] = useState('')
    const [translated, setTranslated] = useState(false)

    // Enter — 사이트만 로드 (번역 없음)
    function handleLoad(e) {
        e.preventDefault()
        if (!inputUrl.trim()) return
        setError('')
        try {
            const url = normalizeUrl(inputUrl)
            new URL(url)
            setCurrentUrl(url)
            setProxyUrl(buildProxyUrl(url, 'ko', engine))  // ko = 번역 안 함
            setTranslated(false)
        } catch {
            setError('올바른 URL을 입력하세요.')
        }
    }

    // 번역하기 버튼 — 선택한 언어/엔진으로 번역
    function handleTranslate() {
        if (!currentUrl) return
        setProxyUrl(buildProxyUrl(currentUrl, lang, engine))
        setTranslated(true)
    }

    // 언어 변경 — 이미 번역 중이면 즉시 재번역
    function handleLangChange(newLang) {
        setLang(newLang)
        if (translated && currentUrl) {
            setProxyUrl(buildProxyUrl(currentUrl, newLang, engine))
        }
    }

    // 엔진 변경 — 이미 번역 중이면 즉시 재번역
    function handleEngineChange(newEngine) {
        setEngine(newEngine)
        if (translated && currentUrl) {
            setProxyUrl(buildProxyUrl(currentUrl, lang, newEngine))
        }
    }

    function handleReset() {
        setProxyUrl('')
        setCurrentUrl('')
        setInputUrl('')
        setTranslated(false)
        setError('')
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f1117' }}>

            {/* 상단 툴바 */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', background: '#13141f',
                borderBottom: '1px solid #2d3748', flexShrink: 0,
                flexWrap: 'wrap',
            }}>
                <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>
                    AIT 번역기
                </span>

                {/* URL 입력 — Enter로 페이지 로드 */}
                <form onSubmit={handleLoad} style={{ display: 'flex', flex: 1, minWidth: 200, gap: 6 }}>
                    <input
                        value={inputUrl}
                        onChange={e => setInputUrl(e.target.value)}
                        placeholder="URL 입력 후 Enter (예: https://edenm.kr)"
                        style={{
                            flex: 1, padding: '8px 14px',
                            border: `1px solid ${error ? '#f87171' : '#2d3748'}`,
                            borderRadius: 8, background: '#0f1117',
                            color: '#e2e8f0', fontSize: 14, outline: 'none',
                        }}
                    />
                    <button type="submit" style={btnGhost} title="페이지 열기">
                        열기
                    </button>
                </form>

                {/* 언어 / 엔진 선택 */}
                <select value={lang} onChange={e => handleLangChange(e.target.value)} style={selectStyle}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>

                <select value={engine} onChange={e => handleEngineChange(e.target.value)} style={{ ...selectStyle, minWidth: 100 }}>
                    {ENGINES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>

                {/* 번역하기 — 메인 액션 */}
                <button
                    onClick={handleTranslate}
                    disabled={!currentUrl}
                    style={{
                        ...btnPrimary,
                        opacity: currentUrl ? 1 : 0.4,
                        cursor: currentUrl ? 'pointer' : 'not-allowed',
                    }}
                >
                    번역하기
                </button>

                {proxyUrl && (
                    <button onClick={handleReset} style={btnGhost}>초기화</button>
                )}
            </div>

            {error && (
                <div style={{ padding: '8px 16px', background: '#2d1515', color: '#f87171', fontSize: 13, flexShrink: 0 }}>
                    {error}
                </div>
            )}

            {/* 상태 안내바 */}
            {currentUrl && (
                <div style={{
                    padding: '6px 16px', background: '#0d1424', fontSize: 12,
                    color: translated ? '#34d399' : '#64748b',
                    borderBottom: '1px solid #1e2433', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <span style={{ opacity: 0.6 }}>{currentUrl}</span>
                    <span style={{ marginLeft: 'auto' }}>
                        {translated ? `✅ ${LANGUAGES.find(l => l.code === lang)?.name} 번역 중` : '⬜ 원본 (번역 전)'}
                    </span>
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
                    <p style={{ fontSize: 16, margin: 0, color: '#64748b' }}>URL을 입력하고 Enter를 누르세요</p>
                    <p style={{ fontSize: 13, margin: 0, color: '#334155' }}>
                        페이지가 열리면 언어를 선택하고 번역하기를 클릭하세요
                    </p>
                </div>
            )}
        </div>
    )
}

const selectStyle = {
    padding: '8px 12px', border: '1px solid #2d3748', borderRadius: 8,
    background: '#0f1117', color: '#e2e8f0', fontSize: 14,
    cursor: 'pointer', outline: 'none', minWidth: 120,
}
const btnPrimary = {
    padding: '8px 22px', background: '#3b82f6', color: 'white',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
    whiteSpace: 'nowrap',
}
const btnGhost = {
    padding: '8px 14px', background: 'transparent', color: '#64748b',
    border: '1px solid #2d3748', borderRadius: 8, cursor: 'pointer',
    fontSize: 13, whiteSpace: 'nowrap',
}
