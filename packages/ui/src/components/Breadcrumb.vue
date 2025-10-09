<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { findItemInTreeById } from '@/helpers'

const store = useStore()

const props = defineProps({
    activeTab: {
        type: Object,
        required: true
    }
})

const breadcrumbPath = computed(() => {
    if (!props.activeTab || !props.activeTab.parentId) {
        return []
    }

    const path = []
    let currentId = props.activeTab.parentId
    const collectionTree = store.state.collectionTree

    // Walk up the tree using parentId
    while (currentId) {
        const item = findItemInTreeById(collectionTree, currentId)
        if (item) {
            path.unshift({
                _id: item._id,
                name: item.name,
                _type: item._type
            })
            currentId = item.parentId
        } else {
            break
        }
    }

    return path
})

function navigateToItem(itemId) {
    const item = findItemInTreeById(store.state.collectionTree, itemId)
    if (item && item._type === 'request') {
        store.dispatch('setActiveTab', item)
    }
}
</script>

<template>
    <div class="breadcrumb-container">
        <div class="breadcrumb">
            <template v-if="breadcrumbPath.length > 0">
                <span v-for="item in breadcrumbPath" :key="item._id" class="breadcrumb-segment">
                    <span v-if="item !== breadcrumbPath[0]" class="breadcrumb-separator">/</span>
                    <span
                        class="breadcrumb-item"
                        :class="{ 'clickable': item._type === 'request' }"
                        @click="item._type === 'request' ? navigateToItem(item._id) : null"
                    >
                        {{ item.name }}
                    </span>
                </span>
                <span class="breadcrumb-separator">/</span>
            </template>
            <template v-if="activeTab">
                <span class="breadcrumb-item current">
                    {{ activeTab.name }}
                </span>
            </template>
        </div>
    </div>
</template>

<style scoped>
.breadcrumb-container {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: var(--background-color);
    font-size: 13px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
}

.breadcrumb {
    display: flex;
    align-items: center;
    color: var(--content-color-tertiary);
}

.breadcrumb-segment {
    display: flex;
    align-items: center;
    gap: 4px;
}

.breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.breadcrumb-item.current {
    font-weight: 600;
    color: var(--text-color);
}

.breadcrumb-item.clickable {
    cursor: pointer;
}

.breadcrumb-item.clickable:hover {
    background-color: var(--hover-background-color);
}

.breadcrumb-separator {
    color: var(--content-color-tertiary);
    margin: 0 4px;
}

/* Scrollbar styling for horizontal overflow */
.breadcrumb-container::-webkit-scrollbar {
    height: 4px;
}

.breadcrumb-container::-webkit-scrollbar-track {
    background: transparent;
}

.breadcrumb-container::-webkit-scrollbar-thumb {
    background: var(--scrollbar-color);
    border-radius: 2px;
}

.breadcrumb-container::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-hover-color);
}
</style>

