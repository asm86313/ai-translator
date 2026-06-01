import Script from 'next/script'

export default function Home() {
    return (
        <main style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
            <div id="ait-target" style={{ position: 'fixed', top: 12, right: 16, zIndex: 9999 }} />

            <h1>AI 번역 위젯 데모</h1>
            <p>이 페이지는 번역 위젯 테스트용입니다. 우측 상단의 언어 선택기로 언어를 변경해보세요.</p>

            <h2>화성시 포토갤러리</h2>
            <p>화성시의 아름다운 사진들을 감상하세요. 다양한 행사와 현장 사진을 제공합니다.</p>

            <h3>주요 카테고리</h3>
            <ul>
                <li>포토뉴스</li>
                <li>생생현장</li>
                <li>기획특집</li>
                <li>영상뉴스</li>
            </ul>

            <p>문의전화: 031-5189-7199</p>
            <input type="text" placeholder="검색어를 입력하세요." style={{ padding: '8px', width: '100%', marginTop: 10 }} />

            <Script id="ait-config" strategy="afterInteractive">{`
                window.aitConfig = {
                    apiUrl: '/api/translate',
                    sourceLang: 'ko',
                    targetElementId: 'ait-target',
                    showEngineSelector: true,
                }
            `}</Script>
            <Script src="/widget/ai-translator.js" strategy="afterInteractive" />
        </main>
    )
}
