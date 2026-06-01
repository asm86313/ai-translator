(function () {
    window.AIT = window.AIT || {}

    window.AIT.tagReplacer = {
        encode(innerHTML) {
            const tags = []
            const nums = []

            const withTags = innerHTML.replace(/<!--[\s\S]*?-->|<[^>]+>/g, (match) => {
                tags.push(match)
                return `__TAG_${tags.length - 1}__`
            })

            const withNums = withTags.replace(/__TAG_(\d+)__([\d,.]+)__TAG_(\d+)__/g, (match, open, num, close) => {
                nums.push(num)
                return `__TAG_${open}____NUM_${nums.length - 1}____TAG_${close}__`
            })

            return { text: withNums, tags, nums }
        },

        decode(text, tags, nums) {
            let result = text

            if (tags.length > 0) {
                tags.forEach((tag, i) => {
                    result = result.replace(new RegExp(`__TAG_${i}__`, 'g'), tag)
                })
            }

            if (nums.length > 0) {
                nums.forEach((num, i) => {
                    result = result.replace(new RegExp(`__NUM_${i}__`, 'g'), num)
                })
            }

            return result
        },
    }
})()
