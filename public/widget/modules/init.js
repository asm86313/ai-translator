(function () {
    window.AIT = window.AIT || {}

    async function init() {
        const cfg = window.AIT.config
        const panel = window.AIT.panel
        const scanner = window.AIT.scanner
        const translator = window.AIT.translator
        const mo = window.AIT.mutationObserver

        const currentLang = panel.getCurrentLang()
        cfg.targetLang = currentLang
        cfg.sourceLang = cfg.sourceLang || 'ko'

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
