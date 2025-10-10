<script setup>
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/TabBar.vue'
import Sidebar from '@/components/Sidebar.vue'
import WindowPortal from '@/components/WindowPortal.vue'
import Tab from '@/components/Tab.vue'
import ImportModal from '@/components/ImportModal.vue'
import RequestPanelAddressBar from '@/components/RequestPanelAddressBar.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import GenerateCodeModal from '@/components/modals/GenerateCodeModal.vue'
import HttpMethodModal from '@/components/modals/HttpMethodModal.vue'
import EditTagModal from '@/components/modals/EditTagModal.vue'
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useStore } from 'vuex'
import constants from '../constants'
import * as queryParamsSync from '@/utils/query-params-sync'
import { jsonStringify } from '@/helpers'

const store = useStore()
const activeTab = computed(() => store.state.activeTab)
const showTabs = computed(() => store.state.flags.showTabs)
const requestResponseLayoutTopBottom = computed(() => store.state.requestResponseLayout === 'top-bottom')
const detachedTabs = computed({
    get() {
        return store.state.detachedTabs
    },
    set(value) {
        store.state.detachedTabs = value
    }
})
const requestPanelRatio = ref(undefined)
const responsePanelRatio = ref(undefined)

// Data for RequestPanelAddressBar
const intervalRequestSending = ref(null)
const delayRequestSending = ref(null)
const httpMethodModalShow = ref(false)
const generateCodeModalCollectionItem = ref(null)
const generateCodeModalShow = ref(false)
const editTagModalShow = ref(false)
const editTagParsedFunc = ref(null)
const editTagUpdateFunc = ref(null)
const graphql = ref({
    query: '',
    variables: '{}'
})
const disableGraphqlWatch = ref(false)

// Computed properties for RequestPanelAddressBar
const collectionItemEnvironmentResolved = computed(() => {
    if (activeTab.value === null) {
        return {}
    }
    return store.state.tabEnvironmentResolved[activeTab.value._id] ?? {}
})
const tagAutocompletions = computed(() => constants.AUTOCOMPLETIONS.TAGS)
const isRequestLoading = computed(() => {
    if (!activeTab.value) {
        return false
    }
    return store.state.requestResponseStatus[activeTab.value._id] === 'loading'
})

// Methods for RequestPanelAddressBar
function getHttpMethodList() {
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
}

function getSendOptions() {
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
}

async function sendRequest(value) {
    if(value === 'send') {
        store.dispatch('sendRequest', activeTab.value)
    }

    if(value === 'generate-code') {
        generateCodeModalCollectionItem.value = JSON.parse(JSON.stringify(activeTab.value))
        generateCodeModalShow.value = true
    }

    if(value === 'send-with-delay') {
        delayRequestSending.value = await window.createPrompt('Delay in seconds')

        if(delayRequestSending.value) {
            delayRequestSending.value = setTimeout(() => {
                store.dispatch('sendRequest', activeTab.value)
                delayRequestSending.value = null
            }, delayRequestSending.value * 1000)
        }
    }

    if(value === 'send-with-interval') {
        intervalRequestSending.value = await window.createPrompt('Interval in seconds')

        if(intervalRequestSending.value) {
            intervalRequestSending.value = setInterval(() => {
                store.dispatch('sendRequest', activeTab.value)
            }, intervalRequestSending.value * 1000)
        }
    }

    if(value === 'cancel') {
        // Cancel loading request
        if(activeTab.value && activeTab.value._id in store.state.requestAbortController) {
            store.state.requestAbortController[activeTab.value._id].abort()
        }

        if (intervalRequestSending.value) {
            clearInterval(intervalRequestSending.value)
            intervalRequestSending.value = null
        }

        if (delayRequestSending.value) {
            clearTimeout(delayRequestSending.value)
            delayRequestSending.value = null
        }
    }
}

function selectMethod(method) {
    if (method === 'Custom Method') {
        httpMethodModalShow.value = true
        return
    }

    activeTab.value.method = method
}

function handleUrlChange() {
    queryParamsSync.onUrlChange(activeTab.value)
}

async function handleCurlImport(curlData) {
    delete curlData.name
    delete curlData._id
    delete curlData._type
    delete curlData.workspaceId
    delete curlData.parentId
    Object.assign(activeTab.value, curlData)
    if (activeTab.value.body.mimeType === constants.MIME_TYPE.GRAPHQL) {
        loadGraphql()
    }
}

function loadGraphql() {
    if(activeTab.value && activeTab.value.body && activeTab.value.body.mimeType === 'application/graphql') {
        disableGraphqlWatch.value = true
        try {
            const parsedBodyText = JSON.parse(activeTab.value.body.text)
            graphql.value = {
                query: parsedBodyText.query ?? '',
                variables: jsonStringify(typeof parsedBodyText.variables === 'object' ? parsedBodyText.variables : {})
            }
        } catch {
            graphql.value = {
                query: '',
                variables: '{}'
            }
        }
    }
}

function onTagClick(parsedFunc, updateFunc) {
    editTagParsedFunc.value = parsedFunc
    editTagUpdateFunc.value = updateFunc
    editTagModalShow.value = true
}

function handleCustomHttpMethod(method) {
    activeTab.value.method = method
}

function setContainerGridColumnWidths(sidebarWidth) {
    const container = document.querySelector('.container')
    let containerStyle = 'auto 1fr'
    if(container.style.gridTemplateColumns) {
        containerStyle = container.style.gridTemplateColumns
    }
    let containerValueSplit = containerStyle.split(' ')
    containerValueSplit[0] = sidebarWidth ?? containerValueSplit[0]
    container.style.gridTemplateColumns = containerValueSplit.join(' ')
}

function onSidebarResize(e) {
    const sidebar = e[0].target
    if(sidebar.style.width) {
        const sidebarWidth = getComputedStyle(sidebar).width
        localStorage.setItem(constants.LOCAL_STORAGE_KEY.SIDEBAR_WIDTH, sidebarWidth)
        setContainerGridColumnWidths(sidebarWidth)
    }
}

function requestPanelResized(e) {
    requestPanelRatio.value = e.detail.leftPanel
    localStorage.setItem(constants.LOCAL_STORAGE_KEY.REQUEST_PANEL_RATIO, e.detail.leftPanel)
    responsePanelRatio.value = e.detail.rightPanel
    localStorage.setItem(constants.LOCAL_STORAGE_KEY.RESPONSE_PANEL_RATIO, e.detail.rightPanel)
}

function handePortalClose(detachedTab) {
    detachedTabs.value = detachedTabs.value.filter(tab => tab._id !== detachedTab._id)
}

let resizeObserverSidebar

onMounted(() => {
    const sidebar = document.querySelector('.sidebar')

    const savedSidebarWidth = localStorage.getItem(constants.LOCAL_STORAGE_KEY.SIDEBAR_WIDTH)
    const savedRequestPanelRatio = localStorage.getItem(constants.LOCAL_STORAGE_KEY.REQUEST_PANEL_RATIO)
    const savedResponsePanelRatio = localStorage.getItem(constants.LOCAL_STORAGE_KEY.RESPONSE_PANEL_RATIO)
    const savedRequestResponseLayout = localStorage.getItem(constants.LOCAL_STORAGE_KEY.REQUEST_RESPONSE_LAYOUT)

    if(savedSidebarWidth) {
        sidebar.style.width = savedSidebarWidth
        setContainerGridColumnWidths(savedSidebarWidth)
    }

    if(savedRequestPanelRatio && savedResponsePanelRatio) {
        requestPanelRatio.value = savedRequestPanelRatio
        responsePanelRatio.value = savedResponsePanelRatio
    }

    if(savedRequestResponseLayout) {
        store.state.requestResponseLayout = savedRequestResponseLayout
    }

    resizeObserverSidebar = new ResizeObserver(onSidebarResize)
    resizeObserverSidebar.observe(sidebar)
})

// Watch for GraphQL changes to sync back to active tab
watch(graphql, () => {
    if(disableGraphqlWatch.value) {
        disableGraphqlWatch.value = false
        return
    }
    let graphqlVariables = {}
    try {
        graphqlVariables = JSON.parse(graphql.value.variables)
    } catch {}
    activeTab.value.body.text = jsonStringify({
        query: graphql.value.query,
        variables: graphqlVariables
    })
}, { deep: true })

// Watch for active tab changes to load GraphQL data
watch(activeTab, () => {
    if (activeTab.value && activeTab.value._type === 'request') {
        loadGraphql()
    }
}, { immediate: true })

onBeforeUnmount(() => {
    resizeObserverSidebar.disconnect()
})
</script>

<template>
    <div class="container">
        <header>
            <NavBar nav="collection" />
        </header>

        <section class="tab-bar" v-if="activeTab && showTabs">
            <TabBar />
        </section>

        <section class="breadcrumb-section" v-if="activeTab && activeTab._type === 'request'">
            <Breadcrumb :active-tab="activeTab" />
        </section>

        <section class="request-panel-address-bar-container" v-if="activeTab && activeTab._type === 'request'">
            <RequestPanelAddressBar
                :active-tab="activeTab"
                :collection-item-environment-resolved="collectionItemEnvironmentResolved"
                :tag-autocompletions="tagAutocompletions"
                :methods="getHttpMethodList()"
                :send-options="getSendOptions()"
                :interval-request-sending="intervalRequestSending"
                :delay-request-sending="delayRequestSending"
                :is-request-loading="isRequestLoading"
                @select-method="selectMethod"
                @send-request="sendRequest"
                @url-change="handleUrlChange"
                @curl-import="handleCurlImport"
                @tag-click="onTagClick"
            />
        </section>

        <aside class="sidebar">
            <Sidebar />
        </aside>

        <Tab
            :collection-item="activeTab"
            :request-response-layout-top-bottom="requestResponseLayoutTopBottom"
            :request-panel-ratio="requestPanelRatio"
            :response-panel-ratio="responsePanelRatio"
            :request-panel-resized="requestPanelResized"
        />

        <template v-for="detachedTab in detachedTabs" :key="'detached-tab' + detachedTab._id">
            <WindowPortal :open="true" :title="(detachedTab._type === 'socket' ? 'SOCK' : detachedTab.method) + ' ' + detachedTab.name + ' — RestSpark'" @close="handePortalClose(detachedTab)">
                <Tab
                    :collection-item="detachedTab"
                    :request-response-layout-top-bottom="requestResponseLayoutTopBottom"
                    :request-panel-ratio="requestPanelRatio"
                    :response-panel-ratio="responsePanelRatio"
                    :request-panel-resized="requestPanelResized"
                />
            </WindowPortal>
        </template>

        <ImportModal />
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
    </div>
</template>

<style scoped>
.container {
    display: grid;

    grid-template-areas:
      "header header"
      "sidebar tab-bar"
      "sidebar breadcrumb-section"
      "sidebar request-panel-address-bar-container"
      "sidebar request-response-panels";

    grid-template-columns: 300px 1fr;
    grid-template-rows: auto auto auto auto 1fr;

    height: 100%;
}

header {
    grid-area: header;
    border-bottom: 1px solid var(--default-border-color);
}

.tab-bar {
    grid-area: tab-bar;
    display: flex;
    user-select: none;
    border-bottom: 1px solid var(--default-border-color);
    width: 100%;
    overflow: auto;
}

.breadcrumb-section {
    grid-area: breadcrumb-section;
}

.request-panel-address-bar-container {
  grid-area: request-panel-address-bar-container;
  padding: 10px 16px;
}

.sidebar {
    grid-area: sidebar;
    overflow: auto;
    user-select: none;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--default-border-color);
    resize: horizontal;
    min-width: 250px;
    width: 300px;
    max-width: 500px;
}
</style>
