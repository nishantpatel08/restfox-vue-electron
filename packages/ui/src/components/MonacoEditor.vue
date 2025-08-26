<template>
    <div class="monaco-editor-container">
        <MonacoEditor
            v-model:value="value"
            :options="editorOptions"
            :height="height"
            :language="lang"
            :theme="monacoTheme"
            @update:value="onChange"
        />
    </div>
</template>

<script lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type * as monaco from 'monaco-editor'

export default {
    components: {
        MonacoEditor: VueMonacoEditor
    },
    props: {
        modelValue: { type: String, required: true },
        lang: { type: String, required: true },
        readonly: { type: Boolean, default: false },
        height: { type: String, default: '100%' }
    },
    data() {
        return {
            value: this.modelValue
        }
    },
    computed: {
        appTheme(): string {
            return (this as any).$store.state.theme
        },
        monacoTheme(): string {
            // Map app themes to Monaco themes
            const themeMap: Record<string, string> = {
                'light': 'vs',
                'dark': 'vs-dark',
                'dracula': 'vs-dark' // Dracula theme in Monaco is also vs-dark
            }
            return themeMap[this.appTheme] || 'vs-dark'
        },
        editorOptions(): monaco.editor.IStandaloneEditorConstructionOptions {
            return {
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                readOnly: this.readonly,
                automaticLayout: true,
                selectionHighlight: true,
                fontSize: 12,
                fontFamily: '"IBM Plex Mono", "Consolas", "Courier New", monospace',
                fontLigatures: true,
                contextmenu: false,
                domReadOnly: true,
            }
        }
    },
    watch: {
        modelValue(newVal) {
            this.value = newVal
        }
    },
    methods: {
        onChange(value: any) {
            this.value = value
            this.$emit('update:modelValue', value)
        },
        setValue(value: any) {
            this.value = value
            this.$emit('update:modelValue', value)
        }
    }
}
</script>

<style scoped>
.monaco-editor-container {
    zoom: 1.05;
    height: 100%;
}

:deep(.monaco-editor) {
    border: none;
    outline: none;
}
</style>
