(function () {
    window.AIT = window.AIT || {}

    const translationCache = new Map()
    const placeholderCache = new Map()

    window.AIT.cache = {
        get(key) { return translationCache.get(key) },
        set(key, value) { translationCache.set(key, value) },
        has(key) { return translationCache.has(key) },

        getPlaceholder(key) { return placeholderCache.get(key) },
        setPlaceholder(key, value) { placeholderCache.set(key, value) },
        hasPlaceholder(key) { return placeholderCache.has(key) },
    }
})()
