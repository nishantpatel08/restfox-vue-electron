<template>
    <div class="request-panel-address-bar">
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
        <button v-if="!intervalRequestSending && !delayRequestSending" @click="sendRequest('send')" data-testid="request-panel-address-bar__send-button">Send</button>
        <button v-if="intervalRequestSending || delayRequestSending" @click="sendRequest('cancel')" data-testid="request-panel-address-bar__cancel-button">Cancel</button>
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
import ContextMenu from './ContextMenu.vue'
import { convertCurlCommandToRestSparkCollection, toggleDropdown } from '@/helpers'
import constants from '@/constants'

export default {
    name: 'RequestAddressBar',
    components: {
        CodeMirrorSingleLine,
        ContextMenu,
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
        intervalRequestSending: {
            type: [Number, null],
            default: null
        },
        delayRequestSending: {
            type: [Number, null],
            default: null
        },
        activeWorkspace: {
            type: Object,
            required: true
        }
    },
    emits: [
        'send-request',
        'generate-code',
        'send-with-delay',
        'send-with-interval',
        'cancel-request',
        'url-change',
        'tag-click',
        'custom-http-method'
    ],
    data() {
        return {
            methods: this.getHttpMethodList(),
            sendOptions: this.getSendOptions(),
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
            },
        }
    },
    methods: {
        getHttpMethodList() {
            const customMethod = 'Custom Method'
            let httpMethodList = [
                'GET',
                'POST',
                'PUT',
                'PATCH',
                'DELETE',
                'OPTIONS',
                'HEAD',
            ].map(method => {
                return {
                    type: 'option',
                    label: method,
                    value: method,
                    class: 'request-method--' + method,
                }
            })

            httpMethodList.push({ type: 'separator' })
            httpMethodList.push({
                type: 'option',
                label: customMethod,
                value: customMethod,
                class: 'request-method--' + customMethod,
            })

            return httpMethodList
        },
        getSendOptions() {
            return [
                {
                    type: 'option',
                    label: 'Basic',
                    disabled: true,
                    value: '',
                    class: 'text-with-line',
                },
                {
                    type: 'option',
                    label: 'Send Now',
                    value: 'send',
                    class: 'context-menu-item-with-left-padding',
                    icon: 'fa fa-paper-plane'
                },
                {
                    type: 'option',
                    label: 'Generate Client Code',
                    value: 'generate-code',
                    class: 'context-menu-item-with-left-padding',
                    icon: 'fa fa-code'
                },
                {
                    type: 'option',
                    label: 'Advanced',
                    disabled: true,
                    value: '',
                    class: 'text-with-line',
                },
                {
                    type: 'option',
                    label: 'Send After Delay',
                    value: 'send-with-delay',
                    class: 'context-menu-item-with-left-padding',
                    icon: 'fa fa-clock'
                },
                {
                    type: 'option',
                    label: 'Repeat on Interval',
                    value: 'send-with-interval',
                    class: 'context-menu-item-with-left-padding',
                    icon: 'fa fa-refresh'
                },
            ]
        },
        async sendRequest(value) {
            if(value === 'send') {
                this.$emit('send-request', this.activeTab)
            }

            if(value === 'generate-code') {
                this.$emit('generate-code', this.activeTab)
            }

            if(value === 'send-with-delay') {
                this.$emit('send-with-delay')
            }

            if(value === 'send-with-interval') {
                this.$emit('send-with-interval')
            }

            if(value === 'cancel') {
                this.$emit('cancel-request')
            }
        },
        handleAddressBarKeyDown(e) {
            if(!e.defaultPrevented && e.ctrlKey === false && e.key === 'Enter') {
                if(this.activeTab.url === '') {
                    return
                }
                this.sendRequest('send')
            }
        },
        async handleAddressBarPaste(content) {
            if (content.startsWith('curl')) {
                if(!await window.createConfirm(`We've detected that you've pasted a curl command. Do you want to import the curl command into the current request?`)) {
                    return false
                }
                const result = await convertCurlCommandToRestSparkCollection(content, this.activeWorkspace._id)

                if(result.length) {
                    delete result[0].name
                    delete result[0]._id
                    delete result[0]._type
                    delete result[0].workspaceId
                    delete result[0].parentId
                    Object.assign(this.activeTab, result[0])

                    if(this.activeTab.body.mimeType === constants.MIME_TYPE.GRAPHQL) {
                        this.$emit('load-graphql')
                    }
                }

                return true
            }

            return false
        },
        handleUrlChange() {
            this.$emit('url-change')
        },
        onTagClick(parsedFunc, updateFunc) {
            this.$emit('tag-click', parsedFunc, updateFunc)
        },
        toggleMethodSelectorDropdown(event) {
            toggleDropdown(event, this.methodSelectorDropdownState)
        },
        toggleSendSelectorDropdown(event) {
            toggleDropdown(event, this.sendSelectorDropdownState)
        },
        selectMethod(method) {
            if (method === 'Custom Method') {
                this.$emit('custom-http-method')
                return
            }

            this.activeTab.method = method
        },
    }
}
</script>

<style scoped>
.request-panel-address-bar {
    display: flex;
    border-bottom: 1px solid var(--default-border-color);
    height: 2.5rem;
    align-items: center;
    min-width: 0;
}

.request-panel-address-bar > select {
    text-align: center;
}

.request-panel-address-bar > .code-mirror-input-container {
    flex: 1;
    min-width: 0;
}

.request-panel-address-bar > select, .request-panel-address-bar > button {
    border: 0;
}

.request-panel-address-bar select {
    padding: 5px;
    outline: 0;
    background: inherit;
}

.request-panel-address-bar button {
    background-color: var(--send-request-button-color);
    color: white;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    height: 100%;
    cursor: pointer;
    font-weight: 600;
}

.request-panel-address-bar button:hover {
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
}

.send-options:hover {
    background-color: var(--send-request-button-hover-color);
}

.send-options.custom-dropdown > i {
    padding: 0;
}

.request-panel-address-bar > .method-selector {
    gap: 10px;
}
</style>
