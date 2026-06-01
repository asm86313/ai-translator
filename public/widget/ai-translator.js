(async function () {
    const userConfig = window.aitConfig || {}

    window.AIT = window.AIT || {}
    window.AIT.config = {
        apiUrl: userConfig.apiUrl || '/api/translate',
        sourceLang: userConfig.sourceLang || 'ko',
        targetLang: 'ko',
        targetElementId: userConfig.targetElementId || '',
        languages: userConfig.languages || null,
    }

    const BASE = userConfig.widgetBase || '/widget/modules'

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
        await window.AIT.init()
    } catch (e) {
        console.error('[AIT] 초기화 실패:', e)
    }
})()
