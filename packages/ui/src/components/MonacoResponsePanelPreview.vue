<template>
    <div class="monaco-editor-container">
        <MonacoEditor
            v-model:value="value"
            :options="editorOptions"
            :height="height"
            language="json"
            :theme="monacoTheme"
            @update:value="onChange"
            @beforeMount="onBeforeMount"
        />
    </div>
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
        },
        wordWrap: {
            type: Boolean,
            default: false
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
            // Map app theme to Monaco's defined themes
            const themeMap: Record<string, string> = {
                light: 'myLightTheme',
                dark: 'myDarkTheme',
                dracula: 'myDraculaTheme',
            }
            return themeMap[this.appTheme] || 'vs-dark'
        },
        editorOptions(): monaco.editor.IStandaloneEditorConstructionOptions {
            return {
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: this.wordWrap ? 'on' : 'off',
                lineNumbers: 'on',
                folding: true,
                readOnly: true,
                automaticLayout: true,
                selectionHighlight: true,
                occurrencesHighlight: 'off',
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
            this.$emit('selection-changed', '')
        },
        onBeforeMount(monacoInstance: typeof monaco) {
            // Light theme
            monacoInstance.editor.defineTheme('myLightTheme', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: {
                    'editor.background': '#ffffff',
                    'editor.foreground': '#000000',
                    'editorCursor.foreground': '#000000',
                    'editorLineNumber.foreground': '#999999',
                    'editor.lineHighlightBackground': '#e5ebf1'
                }
            })

            // Dark theme
            monacoInstance.editor.defineTheme('myDarkTheme', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                    'editor.background': '#212121',
                    'editor.foreground': '#f8f8f2',
                    'editorCursor.foreground': '#ffffff',
                    'editor.lineHighlightBackground': '#3e3d32'
                }
            })

            // Dracula theme
            monacoInstance.editor.defineTheme('myDraculaTheme', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'string', foreground: '50FA7B' },
                    { token: 'keyword', foreground: '50FA7B' },
                    { token: 'number', foreground: 'af93da' },
                    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' }
                ],
                colors: {
                    'editor.background': '#282a36',
                    'editor.foreground': '#f8f8f2',
                    'editorCursor.foreground': '#ffb86c',
                    'editor.lineHighlightBackground': '#3e3d32'
                }
            })
        }
    }
}
</script>

<style scoped>
.monaco-editor-container {
    zoom: 1.02;
    height: 100%;
}

:deep(.monaco-editor) {
    border: none;
    outline: none;
}
</style>
