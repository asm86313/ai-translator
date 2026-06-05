(function () {
    window.AIT = window.AIT || {}

    const STORAGE_KEY = 'ait_lang'
    const ENGINE_KEY = 'ait_engine'

    const LANGUAGES = [
        { code: 'ko', name: '한국어' },
        { code: 'en', name: 'English' },
        { code: 'zh-Hans', name: '中文' },
        { code: 'ja', name: '日本語' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'th', name: 'ภาษาไทย' },
    ]

    const ENGINES = [
        { id: 'claude', name: 'Claude' },
        { id: 'gemini', name: 'Gemini' },
    ]

    function getCurrentLang() {
        return localStorage.getItem(STORAGE_KEY) || 'ko'
    }

    function getCurrentEngine() {
        return localStorage.getItem(ENGINE_KEY) || 'claude'
    }

    function setLang(lang) {
        if (lang === 'ko') {
            localStorage.removeItem(STORAGE_KEY)
        } else {
            localStorage.setItem(STORAGE_KEY, lang)
        }
        window.location.reload()
    }

    function setEngine(engine) {
        localStorage.setItem(ENGINE_KEY, engine)
        window.location.reload()
    }

    function setEngineNoReload(engine) {
        localStorage.setItem(ENGINE_KEY, engine)
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
                background-color: #ffffff;
                color: #333333;
                border: 1px solid #cccccc;
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
            .ait-select option {
                background-color: #ffffff;
                color: #333333;
            }
            .ait-engine-select {
                min-width: 90px;
            }
            .ait-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(0,0,0,0.15);
                border-top: 2px solid #3b82f6;
                border-radius: 50%;
                animation: ait-spin 0.7s linear infinite;
                display: none;
                flex-shrink: 0;
            }
            .ait-spinner.ait-active {
                display: block;
            }
            @keyframes ait-spin {
                to { transform: rotate(360deg); }
            }
        `
        document.head.appendChild(style)
    }

    function createPanel(targetId) {
        injectStyles()

        const currentLang = getCurrentLang()
        const currentEngine = getCurrentEngine()
        const cfg = window.AIT.config
        const langs = cfg.languages || LANGUAGES

        const panel = document.createElement('div')
        panel.className = 'ait-panel'

        // 엔진 선택기 (showEngineSelector: true 일 때만 표시)
        if (cfg.showEngineSelector) {
            const engines = cfg.engines || ENGINES
            const engineSelect = document.createElement('select')
            engineSelect.className = 'ait-select ait-engine-select'

            engines.forEach(engine => {
                const option = document.createElement('option')
                option.value = engine.id
                option.textContent = engine.name
                if (engine.id === currentEngine) option.selected = true
                engineSelect.appendChild(option)
            })

            engineSelect.addEventListener('change', (e) => setEngine(e.target.value))
            panel.appendChild(engineSelect)
        }

        // 언어 선택기
        const langSelect = document.createElement('select')
        langSelect.className = 'ait-select'

        langs.forEach(lang => {
            const option = document.createElement('option')
            option.value = lang.code
            option.textContent = lang.name
            if (lang.code === currentLang) option.selected = true
            langSelect.appendChild(option)
        })

        langSelect.addEventListener('change', (e) => setLang(e.target.value))
        panel.appendChild(langSelect)

        // 스피너
        const spinner = document.createElement('div')
        spinner.className = 'ait-spinner'
        spinner.id = 'ait-spinner'
        panel.appendChild(spinner)

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

    function showSpinner() {
        const s = document.getElementById('ait-spinner')
        if (s) s.classList.add('ait-active')
    }

    function hideSpinner() {
        const s = document.getElementById('ait-spinner')
        if (s) s.classList.remove('ait-active')
    }

    window.AIT.panel = { createPanel, getCurrentLang, getCurrentEngine, setLang, setEngine, setEngineNoReload, showSpinner, hideSpinner }
})()
