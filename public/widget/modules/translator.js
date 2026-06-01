(function () {
    window.AIT = window.AIT || {}

    const BATCH_SIZE = 20

    function applyTranslation(element, finalHtml) {
        element.setAttribute('data-ait-translated', 'true')

        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = finalHtml

        const srcTexts = Array.from(tempDiv.querySelectorAll('*'))
            .concat([tempDiv])
            .filter(el => el.childNodes.length > 0)

        let success = false
        try {
            success = updateTextNodes(element, tempDiv)
        } catch (e) {
            success = false
        }

        if (!success) {
            element.innerHTML = finalHtml
        }
    }

    function updateTextNodes(target, source) {
        const targetChildren = Array.from(target.childNodes)
        const sourceChildren = Array.from(source.childNodes)

        if (targetChildren.length !== sourceChildren.length) {
            return false
        }

        let allSuccess = true
        for (let i = 0; i < targetChildren.length; i++) {
            const t = targetChildren[i]
            const s = sourceChildren[i]

            if (t.nodeType === Node.TEXT_NODE && s.nodeType === Node.TEXT_NODE) {
                t.textContent = s.textContent
            } else if (t.nodeType === Node.ELEMENT_NODE && s.nodeType === Node.ELEMENT_NODE) {
                if (!updateTextNodes(t, s)) allSuccess = false
            } else {
                allSuccess = false
            }
        }
        return allSuccess
    }

    async function translateBatch(items, targetLang, sourceLang) {
        const cfg = window.AIT.config
        const cache = window.AIT.cache
        const replacer = window.AIT.tagReplacer

        const toRequest = []
        const cachedResults = []

        items.forEach((item, i) => {
            const cacheKey = `${targetLang}:${item.originalHtml}`
            if (cache.has(cacheKey)) {
                cachedResults.push({ item, translated: cache.get(cacheKey) })
            } else {
                toRequest.push({ index: i, text: item.encodedText, originalHtml: item.originalHtml, item })
            }
        })

        cachedResults.forEach(({ item, translated }) => {
            const finalHtml = replacer.decode(translated, item.tags, item.nums)
            applyTranslation(item.element, finalHtml)
            window.AIT.scanner.markDone(item.element)
        })

        if (toRequest.length === 0) return

        const response = await fetch(cfg.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                texts: toRequest.map(r => ({ index: r.index, text: r.text })),
                target_lang: targetLang,
                source_lang: sourceLang,
                engine: cfg.engine || null,
            }),
        })

        const data = await response.json()
        if (!data.translated_texts) return

        data.translated_texts.forEach(result => {
            const req = toRequest[result.index]
            if (!req) return

            const cacheKey = `${targetLang}:${req.originalHtml}`
            cache.set(cacheKey, result.text)

            const finalHtml = replacer.decode(result.text, req.item.tags, req.item.nums)
            applyTranslation(req.item.element, finalHtml)
            window.AIT.scanner.markDone(req.item.element)
        })
    }

    async function translateNodes(elements) {
        const cfg = window.AIT.config
        const replacer = window.AIT.tagReplacer

        const items = elements.map(el => {
            const { text, tags, nums } = replacer.encode(el.innerHTML)
            return { element: el, encodedText: text, originalHtml: el.innerHTML, tags, nums }
        })

        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE)
            await translateBatch(batch, cfg.targetLang, cfg.sourceLang)
        }
    }

    async function translatePlaceholders(elements) {
        const cfg = window.AIT.config
        const cache = window.AIT.cache

        const toRequest = []
        elements.forEach((el, i) => {
            const text = el.getAttribute('placeholder')
            if (!text?.trim()) return
            const cacheKey = `ph:${cfg.targetLang}:${text}`
            if (cache.hasPlaceholder(cacheKey)) {
                el.setAttribute('placeholder', cache.getPlaceholder(cacheKey))
                el.setAttribute('data-ait-ph-translated', 'true')
            } else {
                toRequest.push({ index: i, text, element: el, cacheKey })
            }
        })

        if (toRequest.length === 0) return

        const response = await fetch(cfg.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                texts: toRequest.map(r => ({ index: r.index, text: r.text })),
                target_lang: cfg.targetLang,
                source_lang: cfg.sourceLang,
                engine: cfg.engine || null,
            }),
        })

        const data = await response.json()
        if (!data.translated_texts) return

        data.translated_texts.forEach(result => {
            const req = toRequest[result.index]
            if (!req) return
            req.element.setAttribute('placeholder', result.text)
            req.element.setAttribute('data-ait-ph-translated', 'true')
            cache.setPlaceholder(req.cacheKey, result.text)
        })
    }

    window.AIT.translator = { translateNodes, translatePlaceholders }
})()
