(function () {
    window.AIT = window.AIT || {}

    const ENGINE_NAMES = { claude: 'Claude', gemini: 'Gemini' }

    async function init() {
        const cfg = window.AIT.config
        const panel = window.AIT.panel
        const scanner = window.AIT.scanner
        const translator = window.AIT.translator
        const mo = window.AIT.mutationObserver

        const currentLang = panel.getCurrentLang()
        cfg.targetLang = currentLang
        cfg.sourceLang = cfg.sourceLang || 'ko'
        cfg.engine = panel.getCurrentEngine()

        // 패널 생성 전 허용 엔진 목록 조회 (엔진 선택기 표시 시)
        if (cfg.showEngineSelector && !cfg.engines) {
            try {
                const configUrl = cfg.apiUrl + '/config'
                const res = await fetch(configUrl)
                const data = await res.json()
                if (data.allowed_engines?.length) {
                    cfg.engines = data.allowed_engines.map(id => ({
                        id,
                        name: ENGINE_NAMES[id] || id,
                    }))
                    // 현재 선택된 엔진이 허용 목록에 없으면 첫 번째로 초기화
                    if (!data.allowed_engines.includes(cfg.engine)) {
                        cfg.engine = data.allowed_engines[0]
                        panel.setEngineNoReload(cfg.engine)
                    }
                }
            } catch {}
        }

        panel.createPanel(cfg.targetElementId)

        if (currentLang && currentLang !== cfg.sourceLang) {
            const blocks = scanner.scanNodes(document.body)
            if (blocks.length > 0) {
                await translator.translateNodes(blocks)
            }

            const placeholders = scanner.scanPlaceholders(document)
            if (placeholders.length > 0) {
                await translator.translatePlaceholders(placeholders)
            }
        }

        mo.start()
    }

    window.AIT.init = init
})()
