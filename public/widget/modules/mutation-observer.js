(function () {
    window.AIT = window.AIT || {}

    let observer = null
    let debounceTimer = null

    function onMutation(mutations) {
        const addedNodes = []

        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    addedNodes.push(node)
                }
            })
        })

        if (addedNodes.length === 0) return

        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(async () => {
            const cfg = window.AIT.config
            if (!cfg.targetLang || cfg.targetLang === cfg.sourceLang) return

            const scanner = window.AIT.scanner
            const translator = window.AIT.translator
            const panel = window.AIT.panel

            const blocks = []
            addedNodes.forEach(node => {
                blocks.push(...scanner.scanNodes(node))
            })

            const placeholders = []
            addedNodes.forEach(node => {
                placeholders.push(...scanner.scanPlaceholders(node))
            })

            if (blocks.length > 0 || placeholders.length > 0) {
                panel.showSpinner()
                try {
                    if (blocks.length > 0) await translator.translateNodes(blocks)
                    if (placeholders.length > 0) await translator.translatePlaceholders(placeholders)
                } finally {
                    panel.hideSpinner()
                }
            }
        }, 300)
    }

    function start() {
        if (observer) return
        observer = new MutationObserver(onMutation)
        observer.observe(document.body, { childList: true, subtree: true })
    }

    function stop() {
        observer?.disconnect()
        observer = null
    }

    window.AIT.mutationObserver = { start, stop }
})()
