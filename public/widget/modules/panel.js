(function () {
    window.AIT = window.AIT || {}

    const STORAGE_KEY = 'ait_lang'

    const LANGUAGES = [
        { code: 'ko', name: '한국어' },
        { code: 'en', name: 'English' },
        { code: 'zh-Hans', name: '中文' },
        { code: 'ja', name: '日本語' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'th', name: 'ภาษาไทย' },
    ]

    function getCurrentLang() {
        return localStorage.getItem(STORAGE_KEY) || 'ko'
    }

    function setLang(lang) {
        if (lang === 'ko') {
            localStorage.removeItem(STORAGE_KEY)
        } else {
            localStorage.setItem(STORAGE_KEY, lang)
        }
        window.location.reload()
    }

    function injectStyles() {
        if (document.getElementById('ait-panel-style')) return
        const style = document.createElement('style')
        style.id = 'ait-panel-style'
        style.textContent = `
            .ait-panel {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            .ait-select {
                appearance: none;
                -webkit-appearance: none;
                background: transparent;
                border: 1px solid currentColor;
                border-radius: 6px;
                padding: 5px 28px 5px 10px;
                font-size: 0.85rem;
                cursor: pointer;
                outline: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 8px center;
                min-width: 110px;
            }
            .ait-select:focus {
                border-color: #3b82f6;
            }
        `
        document.head.appendChild(style)
    }

    function createPanel(targetId) {
        injectStyles()

        const currentLang = getCurrentLang()
        const cfg = window.AIT.config
        const langs = cfg.languages || LANGUAGES

        const panel = document.createElement('div')
        panel.className = 'ait-panel'

        const select = document.createElement('select')
        select.className = 'ait-select'

        langs.forEach(lang => {
            const option = document.createElement('option')
            option.value = lang.code
            option.textContent = lang.name
            if (lang.code === currentLang) option.selected = true
            select.appendChild(option)
        })

        select.addEventListener('change', (e) => setLang(e.target.value))

        panel.appendChild(select)

        if (targetId) {
            const target = document.getElementById(targetId)
            if (target) {
                target.appendChild(panel)
                return
            }
        }

        Object.assign(panel.style, {
            position: 'fixed',
            top: '12px',
            right: '16px',
            zIndex: '9999',
        })
        document.body.appendChild(panel)
    }

    window.AIT.panel = { createPanel, getCurrentLang, setLang }
})()
