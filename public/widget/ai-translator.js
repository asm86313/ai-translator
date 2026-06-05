(async function () {
    window.AIT = window.AIT || {}

    // BASE는 초기에만 필요하므로 먼저 읽음
    const earlyConfig = window.aitConfig || {}
    const BASE = earlyConfig.widgetBase || '/widget/modules'

    const MODULES = [
        'cache.js',
        'tag-replacer.js',
        'dom-scanner.js',
        'translator.js',
        'panel.js',
        'mutation-observer.js',
        'init.js',
    ]

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = src
            script.onload = resolve
            script.onerror = () => reject(new Error(`Failed to load: ${src}`))
            document.head.appendChild(script)
        })
    }

    try {
        for (const mod of MODULES) {
            await loadScript(`${BASE}/${mod}`)
        }

        // 모듈 로드 완료 후 config 읽기 (inline 스크립트가 먼저 실행됨을 보장)
        const userConfig = window.aitConfig || {}
        window.AIT.config = {
            apiUrl: userConfig.apiUrl || '/api/translate',
            sourceLang: userConfig.sourceLang || 'ko',
            targetLang: 'ko',
            targetElementId: userConfig.targetElementId || '',
            languages: userConfig.languages || null,
            showEngineSelector: userConfig.showEngineSelector || false,
            engines: userConfig.engines || null,
        }

        await window.AIT.init()
    } catch (e) {
        console.error('[AIT] 초기화 실패:', e)
    }
})()
