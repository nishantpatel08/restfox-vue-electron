<template>
    <div class="request-panel-address-bar">
        <div class="request-panel-address-bar-left">
            <div class="custom-dropdown method-selector" @click="toggleMethodSelectorDropdown">
                <div :class="'request-method--' + activeTab.method">{{ activeTab.method }}</div>
                <i class="fa fa-caret-down space-right"></i>
                <ContextMenu
                    :options="methods"
                    :element="methodSelectorDropdownState.element"
                    :x="methodSelectorDropdownState.contextMenuX"
                    :y="methodSelectorDropdownState.contextMenuY"
                    v-model:show="methodSelectorDropdownState.visible"
                    @click="selectMethod"
                />
            </div>
            <div class="code-mirror-input-container">
                <CodeMirrorSingleLine
                    v-model="activeTab.url"
                    placeholder="Enter request URL"
                    :key="'address-bar-' + activeTab._id"
                    @keydown="handleAddressBarKeyDown"
                    @update:modelValue="handleUrlChange"
                    :paste-handler="handleAddressBarPaste"
                    :env-variables="collectionItemEnvironmentResolved"
                    :autocompletions="tagAutocompletions"
                    @tagClick="onTagClick"
                    data-testid="request-panel-address-bar"
                />
            </div>
        </div>
        <button
            v-if="!intervalRequestSending && !delayRequestSending"
            @click="sendRequest('send')"
            data-testid="request-panel-address-bar__send-button"
        >
            Send
        </button>
        <button
            v-if="intervalRequestSending || delayRequestSending"
            @click="sendRequest('cancel')"
            data-testid="request-panel-address-bar__cancel-button"
        >
            Cancel
        </button>
        <div
            v-if="!intervalRequestSending && !delayRequestSending"
            class="custom-dropdown send-options"
            @click="toggleSendSelectorDropdown"
        >
            <i class="fa fa-caret-down space-right"></i>
            <ContextMenu
                :options="sendOptions"
                :element="sendSelectorDropdownState.element"
                :x="sendSelectorDropdownState.contextMenuX"
                :y="sendSelectorDropdownState.contextMenuY"
                v-model:show="sendSelectorDropdownState.visible"
                @click="sendRequest"
            />
        </div>
    </div>
</template>

<script lang="ts">
import CodeMirrorSingleLine from './CodeMirrorSingleLine.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import { convertCurlCommandToRestfoxCollection, toggleDropdown } from '@/helpers'
import { defineComponent } from 'vue'

export default defineComponent({
    components: {
        CodeMirrorSingleLine,
        ContextMenu
    },
    props: {
        activeTab: {
            type: Object,
            required: true
        },
        collectionItemEnvironmentResolved: {
            type: Object,
            required: true
        },
        tagAutocompletions: {
            type: Array,
            required: true
        },
        methods: {
            type: Array,
            required: true
        },
        sendOptions: {
            type: Array,
            required: true
        },
        intervalRequestSending: {
            type: [Number, null],
            default: null
        },
        delayRequestSending: {
            type: [Number, null],
            default: null
        }
    },
    data() {
        return {
            methodSelectorDropdownState: {
                visible: false,
                contextMenuX: null,
                contextMenuY: null,
                element: null,
            },
            sendSelectorDropdownState: {
                visible: false,
                contextMenuX: null,
                contextMenuY: null,
                element: null,
            }
        }
    },
    methods: {
        toggleMethodSelectorDropdown(event: Event) {
            toggleDropdown(event, this.methodSelectorDropdownState)
        },
        toggleSendSelectorDropdown(event: Event) {
            toggleDropdown(event, this.sendSelectorDropdownState)
        },
        selectMethod(method: string) {
            this.$emit('select-method', method)
        },
        sendRequest(value: string) {
            this.$emit('send-request', value)
        },
        handleAddressBarKeyDown(e: KeyboardEvent) {
            if (!e.defaultPrevented && !e.ctrlKey && e.key === 'Enter' && this.activeTab.url) {
                this.sendRequest('send')
            }
        },
        handleUrlChange() {
            this.$emit('url-change')
        },
        async handleAddressBarPaste(content: string) {
            if (content.startsWith('curl')) {
                if (!await window.createConfirm(`We've detected that you've pasted a curl command. Do you want to import the curl command into the current request?`)) {
                    return false
                }
                const result = await convertCurlCommandToRestfoxCollection(content, this.activeWorkspace._id)
                if (result.length) {
                    this.$emit('curl-import', result[0])
                }
                return true
            }
            return false
        },
        onTagClick(parsedFunc: any, updateFunc: any) {
            this.$emit('tag-click', parsedFunc, updateFunc)
        }
    },
    computed: {
        activeWorkspace() {
            return this.$store.state.activeWorkspace
        }
    }
})
</script>

<style scoped>
.request-panel-address-bar {
    display: flex;
    height: 2.5rem;
    align-items: center;
    min-width: 0;
}

.request-panel-address-bar-left > .code-mirror-input-container {
    flex: 1;
    min-width: 0;
    border-left: 1px solid var(--border-color-strong);
}

.request-panel-address-bar-left {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    margin-right: 0.5rem;
    outline: 1px solid var(--content-color-tertiary);
    border-radius: 4px;
}

.request-panel-address-bar > button {
    border: 0;
    background-color: var(--send-request-button-color);
    color: white;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    height: 100%;
    cursor: pointer;
    font-weight: 600;
    border-bottom-left-radius: 4px;
    border-top-left-radius: 4px;
    font-size: 14px;
}

.request-panel-address-bar > button:hover {
    background-color: var(--send-request-button-hover-color);
}

.send-options {
    background-color: var(--send-request-button-color);
    color: var(--primary-text-color);
    margin-right: 0rem;
    padding-right: 0.6rem;
    padding-left: 0.6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    user-select: none;
    height: 100%;
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
}

.send-options:hover {
    background-color: var(--send-request-button-hover-color);
}

.send-options.custom-dropdown > i {
    padding: 0;
}

.request-panel-address-bar-left > .method-selector {
    gap: 20px;
}
</style>
