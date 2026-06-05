import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const targetUrl = searchParams.get('url')
    const lang = searchParams.get('lang') || 'ko'
    const engine = searchParams.get('engine') || 'claude'

    if (!targetUrl) {
        return new NextResponse('<p>URL이 필요합니다.</p>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
    }

    try {
        const res = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'ko-KR,ko;q=0.9',
            },
            redirect: 'follow',
        })

        if (!res.ok) {
            return new NextResponse(errorPage(`페이지를 가져올 수 없습니다. (${res.status})`), {
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
        }

        let html = await res.text()

        // 상대 경로 해결을 위한 base 태그
        const urlObj = new URL(targetUrl)
        const baseHref = `${urlObj.protocol}//${urlObj.host}`

        const injection = `
<base href="${baseHref}">
<div id="ait-target" style="position:fixed;top:12px;right:16px;z-index:99999;font-family:sans-serif;"></div>
<script>
// 툴바에서 선택한 언어/엔진을 localStorage에 주입
if ('${lang}' !== 'ko') {
    localStorage.setItem('ait_lang', '${lang}')
} else {
    localStorage.removeItem('ait_lang')
}
localStorage.setItem('ait_engine', '${engine}')
window.aitConfig = {
    apiUrl: '${origin}/api/translate',
    sourceLang: 'ko',
    targetElementId: 'ait-target',
    showEngineSelector: false,
}
</script>
<script src="${origin}/widget/ai-translator.js"></script>
`
        if (html.includes('</body>')) {
            html = html.replace(/<\/body>/i, `${injection}</body>`)
        } else {
            html += injection
        }

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
    } catch (error) {
        return new NextResponse(errorPage(`오류: ${error.message}`), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
    }
}

function errorPage(message) {
    return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;color:#e2e8f0;background:#0f1117;">
        <h2>⚠️ ${message}</h2>
        <p>일부 사이트는 외부 접근을 차단합니다.</p>
    </body></html>`
}
