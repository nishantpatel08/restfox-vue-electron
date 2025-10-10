<template>
    <span class="request-panel-tab-title">
        {{ requestPanelTab.name }}
        <i class="fa fa-circle active-script" v-if="scriptIndicator && requestPanelTab.name === 'Script'"></i>
        <i class="fa fa-circle active-script" v-if="docIndicator && requestPanelTab.name === 'Docs'"></i>
        <template v-if="requestPanelTab.name === 'Body'">
            <template v-if="activeTab.body.mimeType === 'application/x-www-form-urlencoded'">
                <template v-if="'params' in activeTab.body && activeTab.body.params.filter(item => item.disabled === undefined || item.disabled === false).length > 0">
                    <i class="fa fa-circle active-script"></i>
                </template>
            </template>
            <template v-if="activeTab.body.mimeType === 'multipart/form-data'">
                <template v-if="'params' in activeTab.body && activeTab.body.params.filter(item => item.disabled === undefined || item.disabled === false).length > 0">
                    <i class="fa fa-circle active-script"></i>
                </template>
            </template>
            <template v-if="activeTab.body.mimeType === 'text/plain'"><i class="fa fa-circle active-script"></i></template>
            <template v-if="activeTab.body.mimeType === 'application/json'"><i class="fa fa-circle active-script"></i></template>
            <template v-if="activeTab.body.mimeType === 'application/graphql'"><i class="fa fa-circle active-script"></i></template>
            <template v-if="activeTab.body.mimeType === 'application/octet-stream'"><i class="fa fa-circle active-script"></i></template>
        </template>
        <template v-if="requestPanelTab.name === 'Query'">
            <template v-if="'parameters' in activeTab && activeTab.parameters.filter(item => item.disabled === undefined || item.disabled === false).length > 0">
                <i class="fa fa-circle active-script"></i>
            </template>
        </template>
        <template v-if="requestPanelTab.name === 'Header'">
            <template v-if="'headers' in activeTab && activeTab.headers.filter(item => item.disabled === undefined || item.disabled === false).length > 0">
                <span class="header-count"> ({{ activeTab.headers.filter(item => item.disabled === undefined || item.disabled === false).length }})</span>
            </template>
        </template>
        <template v-if="requestPanelTab.name === 'Auth'">
            <template v-if="'authentication' in activeTab && activeTab.authentication.type !== 'No Auth'">
                <i class="fa fa-circle active-script"></i>
            </template>
        </template>
    </span>
</template>

<script>
export default {
    props: {
        requestPanelTab: {
            type: Object,
            required: true
        },
        activeTab: {
            type: Object,
            required: true
        },
        scriptIndicator: {
            type: Boolean
        },
        docIndicator: {
            type: Boolean
        }
    },
    methods: {
        getAuthenticationTypeLabel(authenticationType) {
            switch(authenticationType) {
                case 'basic':
                    return 'Basic'
                case 'bearer':
                    return 'Bearer'
                case 'oauth2':
                    return 'OAuth 2.0'
            }
        }
    }
}
</script>

<style scoped>
.request-panel-tab-title {
    display: flex;
    align-items: center;
}

.header-count {
    color: var(--method-get);
    margin-left: 4px;
}

.active-script {
    margin-left: 6px;
}
</style>
