<template>
    <MonacoEditor
        v-model:value="value"
        :options="editorOptions"
        :height="height"
        @update:value="onChange"
    />
</template>

<script>
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'

export default {
    components: {
        MonacoEditor: VueMonacoEditor
    },
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        lang: {
            type: String,
            default: 'plaintext'
        }
    },
    data() {
        return {
            value: this.modelValue,
            height: '32px'
        }
    },
    computed: {
        appTheme() {
            return this.$store.state.theme
        },
        monacoTheme() {
            // Map app themes to Monaco themes
            const themeMap = {
                'light': 'vs',
                'dark': 'vs-dark',
                'dracula': 'vs-dark' // Dracula theme in Monaco is also vs-dark
            }
            return themeMap[this.appTheme] || 'vs-dark'
        },
        editorOptions() {
            return {
                language: this.lang,
                theme: this.monacoTheme,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'off',
                lineNumbers: 'off',
                folding: false,
                glyphMargin: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 0,
                renderLineHighlight: 'none',
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
                scrollbar: {
                    vertical: 'hidden',
                    horizontal: 'hidden'
                },
                readOnly: this.disabled,
                placeholder: this.placeholder
            }
        }
    },
    watch: {
        modelValue(newVal) {
            this.value = newVal
        }
    },
    methods: {
        onChange(value) {
            this.value = value
            this.$emit('update:modelValue', value)
        }
    }
}
</script>

<style scoped>
:deep(.monaco-editor) {
    border: none;
    outline: none;
}
</style>
