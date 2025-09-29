<template>
    <div class="monaco-editor-container">
        <MonacoEditor
            v-model:value="value"
            :options="editorOptions"
            :height="height"
            :language="lang"
            :theme="monacoTheme"
            @update:value="onChange"
            @beforeMount="onBeforeMount"
            @mount="onMount"
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
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                readOnly: this.readonly,
                automaticLayout: true,
                selectionHighlight: true,
                fontSize: (this as any).$store.state.monacoFontSize,
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
        },
        onMount(editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) {
            // Add Ctrl+Enter keyboard shortcut to send request
            editor.addAction({
                id: 'send-request',
                label: 'Send Request',
                keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter],
                contextMenuGroupId: 'navigation',
                run: () => {
                    // Emit event to send request - this will bubble up to the parent components
                    // and eventually reach the App component which handles the request sending
                    const event = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        ctrlKey: true,
                        bubbles: true,
                        cancelable: true
                    })

                    // Dispatch the event on the document to trigger the global keyboard handler
                    document.dispatchEvent(event)
                }
            })
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
                    'editor.lineHighlightBackground': '#44475a'
                }
            })

            // Ensure jsonc language is available for comments in JSON
            try {
                const jsonc = monacoInstance.languages.getLanguages().find(l => l.id === 'jsonc')
                if(!jsonc) {
                    monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
                        allowComments: true,
                        validate: true
                    })
                } else {
                    monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
                        allowComments: true,
                        validate: true
                    })
                }
            } catch {}
        }
    }
}
</script>

<style scoped>
.monaco-editor-container {
    height: 100%;
}

:deep(.monaco-editor) {
    border: none;
    outline: none;
}
</style>
