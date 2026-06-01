(function () {
    window.AIT = window.AIT || {}

    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CODE', 'PRE'])
    const INLINE_TAGS = new Set(['A', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'SMALL', 'LABEL', 'BUTTON'])
    const inProgress = new WeakSet()

    function hasText(el) {
        return el.textContent.trim().length > 0 && /\p{L}/u.test(el.textContent)
    }

    function getBlockParent(node) {
        let el = node.parentElement
        while (el && INLINE_TAGS.has(el.tagName)) {
            el = el.parentElement
        }
        return el
    }

    function scanNodes(root) {
        const blocks = []
        const seen = new WeakSet()

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false)

        let node
        while ((node = walker.nextNode())) {
            if (!node.textContent.trim()) continue

            const parent = node.parentElement
            if (!parent) continue
            if (parent.closest(SKIP_TAGS.size ? [...SKIP_TAGS].join(',') : 'script')) continue
            if (parent.closest('.ait-panel')) continue

            const block = getBlockParent(node)
            if (!block || block === document.body || block.tagName === 'HTML') continue
            if (seen.has(block) || inProgress.has(block)) continue
            if (block.hasAttribute('data-ait-translated')) continue
            if (!hasText(block)) continue

            seen.add(block)
            inProgress.add(block)
            blocks.push(block)
        }

        return blocks
    }

    function scanPlaceholders(root = document) {
        const selectors = 'input[placeholder]:not([data-ait-ph-translated]), textarea[placeholder]:not([data-ait-ph-translated])'
        return Array.from(root.querySelectorAll(selectors))
    }

    function markDone(el) {
        inProgress.delete(el)
    }

    window.AIT.scanner = { scanNodes, scanPlaceholders, markDone }
})()
