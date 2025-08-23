<template>
    <MonacoEditor
        v-model:value="value"
        :options="editorOptions"
        :height="height"
        language="json"
        :theme="monacoTheme"
        @update:value="onChange"
    />
</template>

<script lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type * as monaco from 'monaco-editor'

export default {
    name: 'MonacoResponsePanelPreview',
    components: {
        MonacoEditor: VueMonacoEditor
    },
    props: {
        modelValue: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            value: this.modelValue,
            height: '100%'
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
                wordWrap: 'off',
                lineNumbers: 'on',
                folding: true,
                readOnly: true,
                automaticLayout: true,
                selectionHighlight: false,
                occurrencesHighlight: 'off',
                fontSize: 12,
                fontFamily: 'Consolas, "Courier New", monospace',
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
            // If you want to emit real updates instead of just compatibility:
            this.$emit('update:modelValue', value)
            // Emit selection-changed event if needed
            this.$emit('selection-changed', '')
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
