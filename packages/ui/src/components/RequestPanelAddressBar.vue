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
            :class="{ 'cancel-mode': isRequestLoading || intervalRequestSending || delayRequestSending }"
            @click="sendRequest(isRequestLoading || intervalRequestSending || delayRequestSending ? 'cancel' : 'send')"
            :data-testid="isRequestLoading || intervalRequestSending || delayRequestSending ? 'request-panel-address-bar__cancel-button' : 'request-panel-address-bar__send-button'"
        >
            {{ isRequestLoading || intervalRequestSending || delayRequestSending ? 'Cancel' : 'Send' }}
        </button>
        <div style="height: 100%;">
            <div
                v-if="!intervalRequestSending && !delayRequestSending && !isRequestLoading"
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
    </div>
</template>

<script lang="ts">
import CodeMirrorSingleLine from './CodeMirrorSingleLine.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import { convertCurlCommandToRestSparkCollection, toggleDropdown } from '@/helpers'
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
        },
        isRequestLoading: {
            type: Boolean,
            default: false
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
                const result = await convertCurlCommandToRestSparkCollection(content, this.activeWorkspace._id)
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
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    border-radius: 0 4px 4px 0;
    box-shadow:
        0 -1px 0 var(--content-color-tertiary),
        1px 0 0 var(--content-color-tertiary),
        0 1px 0 var(--content-color-tertiary);
    border-left: 0;
    transition: box-shadow 0.2s ease;
    position: relative;
}

.request-panel-address-bar-left > .code-mirror-input-container::before {
    content: '';
    position: absolute;
    left: -1px;
    top: 25%;
    bottom: 25%;
    width: 1px;
    background-color: var(--border-color-strong);
    transition: opacity 0.2s ease;
}

.request-panel-address-bar-left > .code-mirror-input-container:focus-within {
    box-shadow: 0 0 0 3px var(--send-request-button-color);
}

.request-panel-address-bar-left > .code-mirror-input-container:focus-within::before {
    opacity: 0;
}

.request-panel-address-bar-left {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    margin-right: 0.5rem;
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
    width: 80px;
}

.request-panel-address-bar > button:hover {
    background-color: var(--send-request-button-hover-color);
}

.request-panel-address-bar > button.cancel-mode {
    background-color: var(--background-color-tertiary);
    color: var(--content-color-primary);
    border-radius: 4px;
    min-width: 110px;
}

.request-panel-address-bar > button.cancel-mode:hover {
    background-color: var(--highlight-background-color-tertiary);
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
    width: 30px;
}

.send-options:hover {
    background-color: var(--send-request-button-hover-color);
}

.send-options.custom-dropdown > i {
    padding: 0;
}

.request-panel-address-bar-left > .method-selector {
    gap: 20px;
    border-radius: 4px 0 0 4px;
    box-shadow:
        -1px 0 0 var(--content-color-tertiary),
        0 -1px 0 var(--content-color-tertiary),
        0 1px 0 var(--content-color-tertiary);
}
</style>
