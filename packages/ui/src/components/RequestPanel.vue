<template>
    <template v-if="activeTab && activeTab._type === 'request'">
        <div class="request-panel-tabs" v-show="tabView === 'full'">
            <div class="request-panel-tab" :class="{ 'request-panel-tab-active': activeRequestPanelTab === requestPanelTab.name }" @click="activeRequestPanelTab = requestPanelTab.name" v-for="requestPanelTab in requestPanelTabs" :data-testid="`request-panel-tab-${requestPanelTab.name}`">
                <RequestPanelTabTitle :request-panel-tab="requestPanelTab" :active-tab="activeTab" :script-indicator="!!script.pre_request || !!script.post_request" :doc-indicator="!!activeTab.description"></RequestPanelTabTitle>
            </div>
            <div class="request-panel-tab-fill"></div>
        </div>
        <div class="request-panel-tabs" v-show="tabView === 'portable'">
            <div class="request-panel-tab" style="width: 100%; border-color: transparent; cursor: default;">
                <select v-model="activeRequestPanelTab" style="border: 1px solid var(--default-border-color); outline: 0px; padding: 0.3rem; background-color: var(--background-color);">
                    <option v-for="requestPanelTab in requestPanelTabs" :value="requestPanelTab.name">
                        <RequestPanelTabTitle :request-panel-tab="requestPanelTab" :active-tab="activeTab"></RequestPanelTabTitle>
                    </option>
                </select>
            </div>
        </div>
        <div class="request-panel-tabs-context">
            <div v-if="activeRequestPanelTab === 'Body'" class="request-panel-tabs-context-container">
                <div class="request-panel-body-header">
                    <div v-if="activeTab.body.mimeType" class="custom-select" @click="handleRequestBodyMenu">
                        {{ requestBodyList.find(item => item.value === activeTab.body.mimeType)?.label ?? 'No Body' }}
                        <i class="fa fa-caret-down space-right"></i>
                    </div>
                    <div class="request-panel-body-header-content" v-if="activeTab.body.mimeType === 'application/json'">
                        <button class="button" @click="beautifyJSON">Beautify</button>
                    </div>
                    <div class="request-panel-body-header-content" v-if="activeTab.body.mimeType === 'application/graphql'">
                        <div class="custom-dropdown" @click="toggleSchemaSelectorDropdown">
                            <div><i class="fa fa-wrench"></i> Schema</div>
                            <i class="fa fa-caret-down space-right"></i>
                            <ContextMenu
                                :options="schemaOptionList"
                                :element="schemaSelectorDropdownState.element"
                                :x="schemaSelectorDropdownState.contextMenuX"
                                :y="schemaSelectorDropdownState.contextMenuY"
                                v-model:show="schemaSelectorDropdownState.visible"
                                @click="showGraphQLDocs"
                            />
                        </div>
                        <GraphQLSchemaFetcher :is-visible="showGraphQLDocumentation" :endpoint="urlPreview ?? ''" @close="toggleSidebar" :collection-item="activeTab" :collection-item-environment-resolved="collectionItemEnvironmentResolved" :schema-action="schemaAction" />
                        <button class="button" @click="beautifyGraphQL" style="margin-left: 0.5rem">Beautify</button>
                    </div>
                </div>
                <div v-if="activeTab.body.mimeType === 'application/x-www-form-urlencoded'">
                    <table class="custom-table" style="table-layout: fixed">
                        <thead>
                            <tr>
                                <th class="checkbox-column"></th>
                                <th class="key-column">Key</th>
                                <th class="value-column">Value</th>
                                <th class="action-column"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(param, index) in activeTab.body.params">
                                <td class="checkbox-column">
                                    <input type="checkbox" :checked="param.disabled === undefined || param.disabled === false" @change="param.disabled = $event.target.checked ? false : true">
                                </td>
                                <td class="key-column">
                                    <CodeMirrorSingleLine
                                        v-model="param.name"
                                        placeholder="Key"
                                        :env-variables="collectionItemEnvironmentResolved"
                                        :autocompletions="tagAutocompletions"
                                        @tagClick="onTagClick"
                                        :input-text-compatible="true"
                                        :disabled="param.disabled"
                                        :key="'body-param-name-' + index"
                                    />
                                </td>
                                <td class="value-column">
                                    <CodeMirrorSingleLine
                                        v-model="param.value"
                                        placeholder="Value"
                                        :env-variables="collectionItemEnvironmentResolved"
                                        :autocompletions="tagAutocompletions"
                                        @tagClick="onTagClick"
                                        :input-text-compatible="true"
                                        :disabled="param.disabled"
                                        :key="'body-param-value-' + index"
                                    />
                                </td>
                                <td class="action-column" @click="activeTab.body.params.splice(index, 1)">
                                    <i class="fa fa-trash"></i>
                                </td>
                            </tr>
                        </tbody>
                        <tr>
                            <td colspan="4" style="text-align: center; user-select: none" @click="pushItem(activeTab.body, 'params', { name: '', value: '' })">
                                + Add Item
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-if="activeTab.body.mimeType === 'multipart/form-data'">
                    <table class="custom-table" style="table-layout: fixed">
                        <thead>
                            <tr>
                                <th class="checkbox-column"></th>
                                <th class="key-column">Key</th>
                                <th class="value-column">Value</th>
                                <th class="action-column"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(param, index) in activeTab.body.params">
                                <td class="checkbox-column">
                                    <input type="checkbox" :checked="param.disabled === undefined || param.disabled === false" @change="param.disabled = $event.target.checked ? false : true">
                                </td>
                                <td class="key-column">
                                    <CodeMirrorSingleLine
                                        v-model="param.name"
                                        placeholder="Key"
                                        :env-variables="collectionItemEnvironmentResolved"
                                        :autocompletions="tagAutocompletions"
                                        @tagClick="onTagClick"
                                        :input-text-compatible="true"
                                        :disabled="param.disabled"
                                        :key="'body-param-name-' + index"
                                    />
                                </td>
                                <td class="value-column">
                                    <div style="display: flex; align-items: center;">
                                        <template v-if="param.type === 'text'">
                                            <CodeMirrorSingleLine
                                                v-model="param.value"
                                                placeholder="Value"
                                                :env-variables="collectionItemEnvironmentResolved"
                                                :autocompletions="tagAutocompletions"
                                                @tagClick="onTagClick"
                                                :input-text-compatible="true"
                                                :disabled="param.disabled"
                                                :key="'body-param-value-' + index"
                                                style="flex: 1; overflow: auto;"
                                            />
                                        </template>
                                        <template v-else>
                                            <label style="width: 100%; display: flex; align-items: center;">
                                                <div :style="{ filter: !param.disabled ? undefined : 'opacity(0.4)' }" style="display: flex; align-items: center; width: 100%;">
                                                    <span style="border: 1px solid lightgrey; padding: 3px; white-space: nowrap;">Choose Files</span>
                                                    <span style="margin-left: 0.5rem">
                                                        <template v-if="param.files && param.files.length > 0">{{ param.files.length === 1 ? param.files[0].name : `${param.files.length} files selected` }}</template>
                                                        <template v-else>No File Selected</template>
                                                    </span>
                                                    <span style="border: 1px solid lightgrey; padding: 1px 5px; white-space: nowrap; margin-left: auto;" @click.prevent="setFilesForParam([], param)" v-show="param.files && param.files.length > 0">x</span>
                                                </div>
                                                <input type="file" @change="setFilesForParam($event.target.files, param)" multiple :disabled="param.disabled" style="display: none;">
                                            </label>
                                        </template>
                                        <select v-model="param.type" style="padding: 1px 0px; margin-left: 0.5rem;" :disabled="param.disabled">
                                            <option value="text">Text</option>
                                            <option value="file">File</option>
                                        </select>
                                    </div>
                                </td>
                                <td class="action-column" @click="activeTab.body.params.splice(index, 1)">
                                    <i class="fa fa-trash"></i>
                                </td>
                            </tr>
                        </tbody>
                        <tr>
                            <td colspan="4" style="text-align: center; user-select: none" @click="pushItem(activeTab.body, 'params', { name: '', value: '', type: 'text' })">
                                + Add Item
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-if="activeTab.body.mimeType === 'text/plain'" class="oy-a">
                    <MonacoEditor
                        v-model="activeTab.body.text"
                        lang="text"
                        class="code-editor"
                        :key="'monaco-editor-' + activeTab._id + '-' + refreshCodeMirrorEditors"
                    ></MonacoEditor>
                </div>
                <div v-if="activeTab.body.mimeType === 'application/json'" class="oy-a">
                    <MonacoEditor
                        v-model="activeTab.body.text"
                        lang="json"
                        class="code-editor"
                        :key="'monaco-editor-' + activeTab._id + '-' + refreshCodeMirrorEditors"
                        ref="jsonEditor"
                    ></MonacoEditor>
                </div>
                <div style="display: grid; grid-template-rows: 1fr 130px auto; height: 100%; overflow: auto;" v-if="activeTab.body.mimeType === 'application/graphql'">
                    <div class="oy-a" style="min-height: 130px;">
                        <MonacoEditor
                            v-model="graphql.query"
                            lang="graphql"
                            class="code-editor"
                            :key="'monaco-editor1-' + activeTab._id + '-' + refreshCodeMirrorEditors"
                            ref="graphqlEditor"
                        ></MonacoEditor>
                    </div>
                    <div style="margin-top: 0.5rem;display: grid; grid-template-rows: auto 1fr;">
                        <div style="margin-bottom: 0.3rem; user-select: none;">Query Variables</div>
                        <div class="oy-a">
                            <MonacoEditor
                                v-model="graphql.variables"
                                lang="json"
                                class="code-editor"
                                :key="'monaco-editor2-' + activeTab._id + '-' + refreshCodeMirrorEditors"
                                ref="jsonEditor"
                            ></MonacoEditor>
                        </div>
                    </div>
                </div>
                <div v-if="activeTab.body.mimeType === 'application/octet-stream'">
                    <label style="width: 100%; display: flex; align-items: center; border: 1px solid var(--default-border-color);  padding: 0.5rem;">
                        <div style="display: flex; align-items: center; width: 100%;">
                            <span style="border: 1px solid lightgrey; padding: 3px; white-space: nowrap;">Choose File</span>
                            <span style="margin-left: 0.5rem">
                                <template v-if="activeTab.body.fileName">{{ activeTab.body.fileName.name }}</template>
                                <template v-else>No File Selected</template>
                            </span>
                            <span style="border: 1px solid lightgrey; padding: 1px 5px; white-space: nowrap; margin-left: auto;" @click.prevent="activeTab.body.fileName = null; $refs.binaryFileInput.value = '';" v-show="activeTab.body.fileName">x</span>
                        </div>
                        <input type="file" ref="binaryFileInput" @change="activeTab.body.fileName = $event.target.files[0]" style="display: none;">
                    </label>
                </div>
            </div>
            <template v-if="activeRequestPanelTab === 'Query'">
                <table class="custom-table" style="table-layout: fixed">
                    <thead>
                        <tr>
                            <th class="checkbox-column"></th>
                            <th class="key-column">Key</th>
                            <th class="value-column">Value</th>
                            <th class="action-column"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(param, index) in activeTab.parameters">
                            <td class="checkbox-column">
                                <input type="checkbox" :checked="param.disabled === undefined || param.disabled === false" @change="param.disabled = $event.target.checked ? false : true; handleQueryParametersChange();">
                            </td>
                            <td class="key-column">
                                <CodeMirrorSingleLine
                                    v-model="param.name"
                                    placeholder="Key"
                                    :env-variables="collectionItemEnvironmentResolved"
                                    :autocompletions="tagAutocompletions"
                                    @tagClick="onTagClick"
                                    :input-text-compatible="true"
                                    :disabled="param.disabled"
                                    :key="'query-param-name-' + index"
                                    @update:modelValue="handleQueryParametersChange()"
                                />
                            </td>
                            <td class="value-column">
                                <CodeMirrorSingleLine
                                    v-model="param.value"
                                    placeholder="Value"
                                    :env-variables="collectionItemEnvironmentResolved"
                                    :autocompletions="tagAutocompletions"
                                    @tagClick="onTagClick"
                                    :input-text-compatible="true"
                                    :disabled="param.disabled"
                                    :key="'query-param-value-' + index"
                                    @update:modelValue="handleQueryParametersChange()"
                                />
                            </td>
                            <td class="action-column" @click="activeTab.parameters.splice(index, 1); handleQueryParametersChange();">
                                <i class="fa fa-trash"></i>
                            </td>
                        </tr>
                    </tbody>
                    <tr>
                        <td colspan="4" style="text-align: center; user-select: none" @click="pushItem(activeTab, 'parameters', { name: '', value: '' }); handleQueryParametersChange();">
                            + Add Item
                        </td>
                    </tr>
                </table>
                <div style="margin-top: 1rem; margin-bottom: 0.5rem;">
                    Path Parameters
                    <template v-if="'pathParameters' in activeTab && activeTab.pathParameters.filter(item => item.disabled === undefined || item.disabled === false).length > 0">
                        <span> ({{ activeTab.pathParameters.filter(item => item.disabled === undefined || item.disabled === false).length }})</span>
                    </template>
                </div>
                <table class="custom-table" style="table-layout: fixed">
                    <thead>
                        <tr>
                            <th class="checkbox-column"></th>
                            <th class="key-column">Key</th>
                            <th class="value-column">Value</th>
                            <th class="action-column"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(param, index) in activeTab.pathParameters">
                            <td class="checkbox-column">
                                <input type="checkbox" :checked="param.disabled === undefined || param.disabled === false" @change="param.disabled = $event.target.checked ? false : true">
                            </td>
                            <td class="key-column">
                                <CodeMirrorSingleLine
                                    v-model="param.name"
                                    placeholder="Key"
                                    :env-variables="collectionItemEnvironmentResolved"
                                    :autocompletions="tagAutocompletions"
                                    @tagClick="onTagClick"
                                    :input-text-compatible="true"
                                    :disabled="param.disabled"
                                    :key="'path-param-name-' + index"
                                />
                            </td>
                            <td class="value-column">
                                <CodeMirrorSingleLine
                                    v-model="param.value"
                                    placeholder="Value"
                                    :env-variables="collectionItemEnvironmentResolved"
                                    :autocompletions="tagAutocompletions"
                                    @tagClick="onTagClick"
                                    :input-text-compatible="true"
                                    :disabled="param.disabled"
                                    :key="'path-param-value-' + index"
                                />
                            </td>
                            <td class="action-column" @click="activeTab.pathParameters.splice(index, 1)">
                                <i class="fa fa-trash"></i>
                            </td>
                        </tr>
                    </tbody>
                    <tr>
                        <td colspan="4" style="text-align: center; user-select: none" @click="pushItem(activeTab, 'pathParameters', { name: '', value: '' })">
                            + Add Item
                        </td>
                    </tr>
                </table>
                <div style="margin-top: 1rem; margin-bottom: 0.5rem;">
                    URL Preview
                </div>
                <div style="border: 1px solid var(--default-border-color); border-radius: var(--default-border-radius); padding: 0.5rem; overflow-wrap: break-word;">
                    {{ urlPreview }}
                </div>
            </template>
            <template v-if="activeRequestPanelTab === 'Header'">
                <RequestPanelHeaders
                    :collection-item="activeTab"
                    :collection-item-environment-resolved="collectionItemEnvironmentResolved"
                    @tagClick="onTagClick"
                />
            </template>
            <template v-if="activeRequestPanelTab === 'Auth'">
                <RequestPanelAuth
                    :collection-item="activeTab"
                    :collection-item-environment-resolved="collectionItemEnvironmentResolved"
                    :flags="flags"
                    @tagClick="onTagClick"
                />
            </template>
            <template v-if="activeRequestPanelTab === 'Script'">
                <div style="height: 100%; display: grid; grid-template-rows: auto 1fr auto 1fr;">
                    <div style="margin-bottom: var(--label-margin-bottom); display: flex; justify-content: space-between; align-items: flex-end;">
                        <div><i class="fa fa-file-import" /> Pre Request <i class="fa fa-circle active-script" v-if="script.pre_request !== ''"></i></div>
                        <div style="display: flex">
                            <ReferencesButton />
                            <SnippetDropdown @optionSelected="insertSnippetPreScript" type="preScripts" style="margin-left: 0.5rem" />
                        </div>
                    </div>
                    <MonacoEditor
                        v-model="script.pre_request"
                        lang="javascript"
                        class="code-editor"
                        :key="`pre-request-script-editor-${activeTab._id}`"
                    ></MonacoEditor>

                    <div style="margin-bottom: var(--label-margin-bottom); display: flex; justify-content: space-between; align-items: flex-end;">
                        <div><i class="fa fa-file-export" /> Post Request <i class="fa fa-circle active-script" v-if="script.post_request !== ''"></i></div>
                        <div style="display: flex; margin-top: 0.5rem">
                            <button type="button" class="button" @click="generateTests" style="cursor: pointer; margin-right: 0.5rem;">Generate Test Scripts</button>
                            <SnippetDropdown @optionSelected="insertSnippetPostScript" type="postScripts" />
                        </div>
                    </div>
                    <MonacoEditor
                        v-model="script.post_request"
                        lang="javascript"
                        class="code-editor"
                        :key="`post-request-script-editor-${activeTab._id}`"
                    ></MonacoEditor>
                </div>
            </template>
            <div style="height: 100%; display: grid; grid-template-rows: auto 1fr; overflow: auto;" v-if="activeRequestPanelTab === 'Docs'">
                <template v-if="editDescription">
                    <div>
                        <button class="button" @click="editDescription = false" style="margin-bottom: 1rem">Preview</button>
                    </div>
                    <textarea v-model="activeTab.description" style="width: 100%; height: 100%; padding: 0.5rem;" spellcheck="false"></textarea>
                </template>
                <template v-else>
                    <div>
                        <button class="button" @click="editDescription = true" style="margin-bottom: 1rem">Edit</button>
                    </div>
                    <div v-html="renderMarkdown(activeTab.description ?? '')" style="overflow: auto;"></div>
                </template>
            </div>
        </div>
        <ContextMenu
            :options="requestBodyList"
            v-model:show="showRequestBodyMenu"
            :x="requestBodyMenuX"
            :y="requestBodyMenuY"
            :width="requestBodyWidth"
            :selected-option="activeTab.body.mimeType"
            @click="handleRequestBodyMenuClick"
        />
    </template>
    <HttpMethodModal
        v-model:showModal="httpMethodModalShow"
        :method="activeTab?.method"
        @customHttpMethod="handleCustomHttpMethod"
    />
    <GenerateCodeModal v-model:showModal="generateCodeModalShow" :collection-item="generateCodeModalCollectionItem" />
    <EditTagModal
        v-if="editTagModalShow"
        v-model:showModal="editTagModalShow"
        :parsed-func="editTagParsedFunc"
        :update-func="editTagUpdateFunc"
        :active-tab="activeTab"
    />
</template>

<script lang="ts">
import CodeMirrorSingleLine from './CodeMirrorSingleLine.vue'
import MonacoEditor from '@/components/MonacoEditor.vue'
import RequestPanelTabTitle from '@/components/RequestPanelTabTitle.vue'
import RequestPanelHeaders from '@/components/RequestPanelHeaders.vue'
import RequestPanelAuth from '@/components/RequestPanelAuth.vue'
import ReferencesButton from '@/components/ReferencesButton.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import SnippetDropdown from '@/components/SnippetDropdown.vue'
import { emitter } from '@/event-bus'
import { jsonPrettify } from '../utils/prettify-json'
import {
    convertCurlCommandToRestSparkCollection,
    debounce,
    getEditorConfig,
    getSpaces,
    jsonStringify,
    substituteEnvironmentVariables,
    toggleDropdown
} from '@/helpers'
import * as queryParamsSync from '@/utils/query-params-sync'
import constants from '@/constants'
import { marked } from 'marked'
import HttpMethodModal from '@/components/modals/HttpMethodModal.vue'
import GraphQLSchemaFetcher from '@/components/GraphQLSchemaFetcher.vue'
import GenerateCodeModal from '@/components/modals/GenerateCodeModal.vue'
import EditTagModal from '@/components/modals/EditTagModal.vue'
import { formatSdl } from 'format-graphql'
import { generateTestScripts } from '@/utils/generate-test-scripts'

const renderer = new marked.Renderer()

renderer.link = (...args) => {
    const link = marked.Renderer.prototype.link.apply(this, args)
    return link.replace('<a', `<a target="_blank" rel="noopener noreferrer"`)
}

marked.setOptions({
    renderer: renderer
})

export default {
    components: {
        GenerateCodeModal,
        ContextMenu,
        CodeMirrorSingleLine,
        MonacoEditor,
        RequestPanelTabTitle,
        RequestPanelHeaders,
        RequestPanelAuth,
        ReferencesButton,
        HttpMethodModal,
        SnippetDropdown,
        GraphQLSchemaFetcher,
        EditTagModal
    },
    props: {
        activeTab: Object,
    },
    data() {
        return {
            requestPanelTabs: [
                {
                    name: 'Body'
                },
                {
                    name: 'Query'
                },
                {
                    name: 'Header'
                },
                {
                    name: 'Auth'
                },
                {
                    name: 'Script'
                },
                {
                    name: 'Docs'
                },
            ],
            activeRequestPanelTab: 'Body',
            graphql: {
                query: '',
                variables: '{}'
            },
            disableGraphqlWatch: false,
            refreshCodeMirrorEditors: 1,
            rootElementResizeObserver: null,
            tabView: 'full',
            script: {
                pre_request: constants.CODE_EXAMPLE.SCRIPT.PRE_REQUEST,
                post_request: constants.CODE_EXAMPLE.SCRIPT.POST_REQUEST,
            },
            skipScriptUpdate: false,
            editDescription: false,
            schemaSelectorDropdownState: {
                visible: false,
                contextMenuX: null,
                contextMenuY: null,
                element: null,
            },
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
            schemaOptionList: [
                {
                    'type': 'option',
                    'label': 'Show Documentation',
                    'value': 'show-documentation',
                    'icon': 'fa fa-book'
                },
                {
                    'type': 'option',
                    'label': 'Refresh Schema',
                    'value': 'refresh-schema',
                    'icon': 'fa fa-repeat'
                },
            ],
            requestBodyList: [
                {
                    'type': 'option',
                    'label': 'Structured',
                    'value': '',
                    'icon': 'fa fa-bars',
                    'disabled': true,
                    'class': 'text-with-line'
                },
                {
                    'type': 'option',
                    'label': 'Multipart Form',
                    'value': 'multipart/form-data',
                },
                {
                    'type': 'option',
                    'label': 'Form URL Encoded',
                    'value': 'application/x-www-form-urlencoded',
                },
                {
                    'type': 'option',
                    'label': 'GraphQL',
                    'value': 'application/graphql',
                },
                {
                    'type': 'option',
                    'label': 'Text',
                    'value': '',
                    'icon': 'fa fa-angle-right',
                    'disabled': true,
                    'class': 'text-with-line'
                },
                {
                    'type': 'option',
                    'label': 'Plain Text',
                    'value': 'text/plain',
                },
                {
                    'type': 'option',
                    'label': 'JSON',
                    'value': 'application/json',
                },
                {
                    'type': 'option',
                    'label': 'Other',
                    'value': '',
                    'icon': 'fa fa-ellipsis-h',
                    'disabled': true,
                    'class': 'text-with-line'
                },
                {
                    'type': 'option',
                    'label': 'No Body',
                    'value': 'No Body',
                },
                {
                    'type': 'option',
                    'label': 'Binary File',
                    'value': 'application/octet-stream',
                },
            ],
            showRequestBodyMenu: false,
            requestBodyMenuX: null,
            requestBodyMenuY: null,
            requestBodyWidth: null,
            httpMethodModalShow: false,
            showGraphQLDocumentation: false,
            schemaAction: null,
            generateCodeModalCollectionItem: null,
            generateCodeModalShow: false,
            editTagModalShow: false,
            editTagParsedFunc: null,
            editTagUpdateFunc: null,
            urlPreview: '',
        }
    },
    computed: {
        activeWorkspace() {
            return this.$store.state.activeWorkspace
        },
        collectionItemEnvironmentResolved() {
            if (this.activeTab === null) {
                return {}
            }
            return this.$store.state.tabEnvironmentResolved[this.activeTab._id] ?? {}
        },
        flags() {
            return this.$store.state.flags
        },
        scriptPlugin() {
            if(this.activeTab === null) {
                return undefined
            }

            return this.$store.state.plugins.workspace.find(plugin => plugin.collectionId === this.activeTab._id && plugin.type === 'script')
        },
        preRequestAutocompletions() {
            return [
                ...constants.AUTOCOMPLETIONS.PLUGIN.GENERAL_METHODS,
                ...constants.AUTOCOMPLETIONS.PLUGIN.REQUEST_METHODS
            ]
        },
        postRequestAutocompletions() {
            return [
                ...constants.AUTOCOMPLETIONS.PLUGIN.GENERAL_METHODS,
                ...constants.AUTOCOMPLETIONS.PLUGIN.RESPONSE_METHODS
            ]
        },
        tagAutocompletions() {
            return constants.AUTOCOMPLETIONS.TAGS
        },
        indentSize() {
            return getSpaces(getEditorConfig().indentSize)
        }
    },
    watch: {
        activeTab() {
            this.attachRootElementResizeObserver()
        },
        'activeTab._id'() {
            this.loadGraphql()
        },
        'activeTab.body.mimeType'() {
            if(this.activeTab && this.activeTab.body && this.activeTab.body.mimeType === constants.MIME_TYPE.FORM_DATA) {
                if('params' in this.activeTab.body) {
                    // set type to text by default if type does not exist int he params array
                    this.activeTab.body.params.forEach(param => {
                        if('type' in param === false) {
                            param.type = 'text'
                        }
                    })
                }
                return
            }
            this.loadGraphql()
        },
        'activeTab.url'() {
            this.getUrlPreview()
        },
        'activeTab.pathParameters': {
            handler() {
                this.getUrlPreview()
            },
            deep: true
        },
        collectionItemEnvironmentResolved() {
            this.getUrlPreview()
        },
        graphql: {
            async handler() {
                if(this.disableGraphqlWatch) {
                    this.disableGraphqlWatch = false
                    return
                }
                let graphqlVariables = {}
                try {
                    const stripJsonComments = (await import('strip-json-comments')).default
                    graphqlVariables = JSON.parse(stripJsonComments(this.graphql.variables))
                } catch {}
                this.activeTab.body.text = jsonStringify({
                    query: this.graphql.query,
                    variables: graphqlVariables
                })
            },
            deep: true
        },
        scriptPlugin: {
            handler() {
                if(this.scriptPlugin) {
                    if (this.script.pre_request !== this.scriptPlugin.code.pre_request) {
                        this.skipScriptUpdate = true
                        this.script.pre_request = this.scriptPlugin.code.pre_request
                    }

                    if (this.script.post_request !== this.scriptPlugin.code.post_request) {
                        this.skipScriptUpdate = true
                        this.script.post_request = this.scriptPlugin.code.post_request
                    }
                } else {
                    if (this.script.pre_request !== constants.CODE_EXAMPLE.SCRIPT.PRE_REQUEST) {
                        this.skipScriptUpdate = true
                        this.script.pre_request = constants.CODE_EXAMPLE.SCRIPT.PRE_REQUEST
                    }

                    if (this.script.post_request !== constants.CODE_EXAMPLE.SCRIPT.POST_REQUEST) {
                        this.skipScriptUpdate = true
                        this.script.post_request = constants.CODE_EXAMPLE.SCRIPT.POST_REQUEST
                    }
                }
            },
            immediate: true
        },
        script: {
            handler() {
                if(this.skipScriptUpdate) {
                    this.skipScriptUpdate = false
                    return
                }
                this.handleScriptSave(this)
            },
            deep: true
        },
    },
    methods: {


        pushItem(object, key, itemToPush) {
            if(key in object === false) {
                object[key] = []
            }

            object[key].push(itemToPush)
        },
        beautifyJSON() {
            try {
                const formattedJSON = jsonPrettify(this.activeTab.body.text, this.indentSize)
                this.$refs.jsonEditor.setValue(formattedJSON)
            } catch {} // catch all json parsing errors and ignore them
        },
        beautifyGraphQL() {
            try {
                const formattedVarsJSON = jsonPrettify(this.graphql.variables, this.indentSize)
                const formattedGraphqlJSON = formatSdl(this.graphql.query)
                this.$refs.jsonEditor.setValue(formattedVarsJSON)
                this.$refs.graphqlEditor.setValue(formattedGraphqlJSON)
            } catch {} // catch all json parsing errors and ignore them
        },
        showGraphQLDocs(value){
            this.schemaAction = value
            if (value === 'show-documentation') {
                this.showGraphQLDocumentation = true
            }
        },
        toggleSidebar() {
            this.showGraphQLDocumentation = !this.showGraphQLDocumentation
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
                        this.loadGraphql()
                    }
                }

                return true
            }

            return false
        },
        loadGraphql() {
            if(this.activeTab && this.activeTab.body && this.activeTab.body.mimeType === 'application/graphql') {
                this.disableGraphqlWatch = true
                try {
                    const parsedBodyText = JSON.parse(this.activeTab.body.text)
                    this.graphql = {
                        query: parsedBodyText.query ?? '',
                        variables: jsonStringify(typeof parsedBodyText.variables === 'object' ? parsedBodyText.variables : {})
                    }
                } catch {
                    this.graphql = {
                        query: '',
                        variables: '{}'
                    }
                }
            }
        },
        handleResponsePanelEmitter(event) {
            if(event === 'request restored') {
                this.loadGraphql()
                this.refreshCodeMirrorEditors++
            }
        },
        setFilesForParam(files, param) {
            param.files = Array.from(files)
        },
        onRootElementResize() {
            const scrollWidth = 'requestPanelTabViewSwitchedScrollWidth' in window ? window.requestPanelTabViewSwitchedScrollWidth : this.$el.parentElement.scrollWidth
            if(this.$el.parentElement.clientWidth < scrollWidth) {
                this.tabView = 'portable'
                if('requestPanelTabViewSwitchedScrollWidth' in window === false) {
                    window.requestPanelTabViewSwitchedScrollWidth = this.$el.parentElement.scrollWidth
                }
            } else {
                delete window.requestPanelTabViewSwitchedScrollWidth
                this.tabView = 'full'
            }
        },
        attachRootElementResizeObserver() {
            if(this.activeTab) {
                this.$nextTick(() => {
                    this.rootElementResizeObserver = new ResizeObserver(this.onRootElementResize)
                    this.rootElementResizeObserver.observe(this.$el.parentElement)
                })
            } else {
                if(this.rootElementResizeObserver) {
                    this.rootElementResizeObserver.disconnect()
                    this.rootElementResizeObserver = null
                }
            }
        },

        handleQueryParametersChange() {
            queryParamsSync.onParametersChange(this.activeTab)
        },
        renderMarkdown(markdown) {
            return marked.parse(markdown)
        },
        handleScriptSave: debounce((_this) => {
            if(_this.scriptPlugin) {
                _this.$store.commit('updatePlugin', {
                    _id: _this.scriptPlugin._id,
                    name: null,
                    code: {
                        pre_request: _this.script.pre_request,
                        post_request: _this.script.post_request,
                    },
                })
            } else {
                _this.$store.commit('addPlugin', {
                    name: null,
                    code: {
                        pre_request: _this.script.pre_request,
                        post_request: _this.script.post_request,
                    },
                    workspaceId: null,
                    collectionId: _this.activeTab._id,
                    type: 'script',
                })
            }
            console.log('Script saved')
        }, 500),
        toggleMethodSelectorDropdown(event) {
            toggleDropdown(event, this.methodSelectorDropdownState)
        },
        toggleSchemaSelectorDropdown(event) {
            toggleDropdown(event, this.schemaSelectorDropdownState)
        },
        toggleSendSelectorDropdown(event) {
            toggleDropdown(event, this.sendSelectorDropdownState)
        },

        handleRequestBodyMenu(event) {
            const containerElement = event.target.closest('.custom-select')
            this.requestBodyMenuX = containerElement.getBoundingClientRect().left
            this.requestBodyMenuY = containerElement.getBoundingClientRect().top + containerElement.getBoundingClientRect().height
            this.requestBodyWidth = containerElement.getBoundingClientRect().width
            this.showRequestBodyMenu = true
        },
        handleRequestBodyMenuClick(newMimeType) {
            this.activeTab.body.mimeType = newMimeType

            let mimeType = null

            if(newMimeType === constants.MIME_TYPE.FORM_URL_ENCODED) {
                mimeType = constants.MIME_TYPE.FORM_URL_ENCODED
            }

            if(newMimeType === constants.MIME_TYPE.FORM_DATA) {
                mimeType = constants.MIME_TYPE.FORM_DATA
            }

            if(newMimeType === constants.MIME_TYPE.TEXT_PLAIN) {
                mimeType = constants.MIME_TYPE.TEXT_PLAIN
            }

            if(newMimeType === constants.MIME_TYPE.JSON || newMimeType === constants.MIME_TYPE.GRAPHQL) {
                mimeType = constants.MIME_TYPE.JSON
            }

            if(newMimeType === constants.MIME_TYPE.OCTET_STREAM) {
                mimeType = constants.MIME_TYPE.OCTET_STREAM
            }

            if(mimeType === null) {
                for (let i = 0; i < this.activeTab.headers.length; i++) {
                    if (this.activeTab.headers[i].name === 'Content-Type') {
                        this.activeTab.headers.splice(i, 1)
                    }
                }
                return
            }

            let contentTypeHeader = 'headers' in this.activeTab && this.activeTab.headers.find(header => header.name.toLowerCase() === 'content-type')

            if(contentTypeHeader) {
                contentTypeHeader.value = mimeType
            } else {
                if('headers' in this.activeTab == false) {
                    this.activeTab.headers = []
                }

                this.activeTab.headers.push({
                    name: 'Content-Type',
                    value: mimeType
                })
            }
        },
        handleCustomHttpMethod(method) {
            this.activeTab.method = method
        },

        insertSnippetPreScript(text) {
            this.script.pre_request += text + `\n`
        },
        insertSnippetPostScript(text) {
            this.script.post_request += text + `\n`
        },


        async getUrlPreview() {
            if (!this.activeTab) {
                return
            }

            let url = this.activeTab.url ?? ''

            url = await substituteEnvironmentVariables(this.collectionItemEnvironmentResolved, url, { tagTrigger: false, noError: true })

            if (this.activeTab.pathParameters) {
                for (const pathParameter of this.activeTab.pathParameters.filter(item => !item.disabled)) {
                    const paramName = await substituteEnvironmentVariables(this.collectionItemEnvironmentResolved, pathParameter.name, { tagTrigger: false, noError: true })
                    const paramValue = await substituteEnvironmentVariables(this.collectionItemEnvironmentResolved, pathParameter.value, { tagTrigger: false, noError: true })

                    url = url.replaceAll(`:${paramName}`, paramValue)
                        .replaceAll(`{${paramName}}`, paramValue)
                }
            }

            this.urlPreview = url !== '' && url.trim() !== '' ? url : 'No URL'
        },
        async generateTests()  {
            const generatedTestScripts = await generateTestScripts()

            this.script.post_request += generatedTestScripts + `\n`
        }
    },
    mounted() {
        emitter.on('response_panel', this.handleResponsePanelEmitter)

        this.attachRootElementResizeObserver()

        this.loadGraphql()

        this.getUrlPreview()
    },
    beforeUnmount() {
        emitter.off('response_panel', this.handleResponsePanelEmitter)
        if(this.rootElementResizeObserver) {
            this.rootElementResizeObserver.disconnect()
        }
    }
}
</script>

<style scoped>
.request-panel-tabs {
    display: flex;
    user-select: none;
    padding: 0 1rem;
}

.request-panel-tabs .request-panel-tab {
    padding: 8px 0;
    margin: 0 10px;
    white-space: nowrap;
    cursor: pointer;
    color: var(--content-color-secondary);
}

.request-panel-tabs .request-panel-tab:hover {
    color: var(--content-color-primary);
}

.request-panel-tabs .request-panel-tab-active {
    border-bottom: 1px solid var(--base-color-brand);
    background: var(--background-color);
    color: var(--content-color-primary);
}

.request-panel-tabs .request-panel-tab-fill {
    width: 100%;
}

.request-panel-tabs-context {
    padding: 0.6rem;
    overflow-y: auto;
}

.request-panel-tabs-context textarea {
    border: 1px solid var(--default-border-color);
    outline: 0;
    resize: none;
}

.request-panel-tabs-context-container {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
}

.request-panel-tabs-context-container > div > textarea {
    height: 100%;
}

.oy-a {
    overflow-y: auto;
}

.code-editor {
    border: 1px solid var(--border-color-strong);
    height: 100%;
    overflow-y: auto;
}

.request-panel-body-header-content {
    display: flex;
    justify-content: flex-end;
    align-items: center;
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

.request-panel-body-header {
    display: flex;
    justify-content: space-between;
    padding: 0 0.4rem;
}

.request-panel-body-header > .custom-select {
    width: fit-content;
    gap: 16px
}

.request-panel-body-header-content > .button {
    all: unset;
    padding: 3px 10px;
    color: var(--content-color-link);
    font-weight: 600;
}
</style>
