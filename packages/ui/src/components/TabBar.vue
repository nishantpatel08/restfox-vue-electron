<template>
    <div class="tab-bar-wrapper">
        <div
            class="tabs-container"
            ref="tabContainer"
            @wheel.prevent="scrollTabs"
        >
            <div
                class="tab"
                :class="{ 'tab-active': activeTab && activeTab._id === tab._id }"
                v-for="tab in tabs"
                @click="setActiveTab(tab)"
                @mousedown.middle.prevent="closeTab(tab)"
                :data-id="tab._id"
                draggable="true"
                @contextmenu.prevent="handleTabContextMenu($event, tab)"
            >
                <span style="margin-right: 0.2rem; font-size: 9px;" :class="`request-method--${getTabMethodName(tab)}`">
                    {{ getTabMethodName(tab) }}
                    <i style="margin-right: 0.2rem" v-if="tab._type === 'request_group'" class="fas fa-folder"></i>
                </span>
                <template v-if="tab._id in sidebarItemTemporaryName">
                    {{ sidebarItemTemporaryName[tab._id] }}
                </template>
                <template v-else>
                    {{ tab.name }}
                </template>
                <span style="margin-left: 1rem" @click.stop="closeTab(tab)" class="tab-close"><i class="fas fa-times"></i></span>
            </div>
        </div>

        <!-- Environment Selector -->
        <div class="environment-selector-container">
            <div class="custom-dropdown env-dropdown" @click="toggleEnvSelectorDropdown">
                <i class="fa fa-circle" :style="{ color: currentEnvironmentColor }"></i>&nbsp;&nbsp;{{ currentEnvironment ?? 'Default' }}
                <i class="fa fa-caret-down space-right"></i>
            </div>
        </div>
    </div>
    <!-- <div class="tab-add" @click="addTab" style="visibility: hidden">+</div> -->
    <ContextMenu :options="tabContextMenuOptions" :element="tabContextMenuElement" v-model:show="showTabContextMenu" @click="handleTabContextMenuItemClick" />
    <ContextMenu
        :options="getEnvList()"
        :element="envSelectorDropdownState.element"
        :x="envSelectorDropdownState.contextMenuX"
        :y="envSelectorDropdownState.contextMenuY"
        v-model:show="envSelectorDropdownState.visible"
        :selected-option="currentEnvironment"
        @click="selectEnv"
    />
    <EnvironmentModal v-model:showModal="environmentModalShow" :workspace="activeWorkspace" v-if="activeWorkspace" :key="activeWorkspace._id" />
</template>

<script>
import ContextMenu from './ContextMenu.vue'
import EnvironmentModal from './modals/EnvironmentModal.vue'
import { arrayMove } from '@/helpers'
import constants from '../constants'

export default {
    components: {
        ContextMenu,
        EnvironmentModal
    },
    data() {
        return {
            draggedTabElement: null,
            indexOfDraggedTab: null,
            tabContextMenuElement: null,
            tabContextMenuTab: null,
            showTabContextMenu: false,
            environmentModalShow: false,
            envSelectorDropdownState: {
                visible: false,
                contextMenuX: null,
                contextMenuY: null,
                element: null,
            },
            tabsContextMenuList: [
                {
                    'type': 'option',
                    'label': 'Move to New Window',
                    'value': 'Move to New Window'
                },
                {
                    'type': 'separator'
                },
                {
                    'type': 'option',
                    'label': 'Close',
                    'value': 'Close'
                },
                {
                    'type': 'option',
                    'label': 'Close All',
                    'value': 'Close All'
                },
            ]
        }
    },
    computed: {
        tabs() {
            return this.$store.state.tabs
        },
        activeTab() {
            return this.$store.state.activeTab
        },
        sidebarItemTemporaryName() {
            return this.$store.state.sidebarItemTemporaryName
        },
        activeWorkspace() {
            return this.$store.state.activeWorkspace
        },
        environments() {
            return this.activeWorkspace.environments ?? [
                {
                    name: constants.DEFAULT_ENVIRONMENT.name,
                    environment: this.activeWorkspace.environment,
                    color: constants.DEFAULT_ENVIRONMENT.color
                }
            ]
        },
        currentEnvironmentColor() {
            return this.environments.find(env => env.name === this.currentEnvironment).color ?? constants.DEFAULT_ENVIRONMENT.color
        },
        currentEnvironment: {
            get() {
                return this.activeWorkspace?.currentEnvironment ?? constants.DEFAULT_ENVIRONMENT.name
            },
            set(value) {
                this.activeWorkspace.currentEnvironment = value
                this.$store.commit('updateWorkspaceCurrentEnvironment', {
                    workspaceId: this.activeWorkspace._id,
                    currentEnvironment: value
                })
                const selectedEnvironment = this.environments.find(environmentItem => environmentItem.name === value)
                this.activeWorkspace.environment = selectedEnvironment.environment
                this.$store.commit('updateWorkspaceEnvironment',  {
                    workspaceId: this.activeWorkspace._id,
                    environment: selectedEnvironment.environment
                })
            }
        },
        tabContextMenuOptions() {
            if (this.tabs.length === 1) {
                return this.tabsContextMenuList
            } else {
                return [
                    {
                        'type': 'option',
                        'label': 'Move to New Window',
                        'value': 'Move to New Window'
                    },
                    {
                        'type': 'separator'
                    },
                    {
                        'type': 'option',
                        'label': 'Close',
                        'value': 'Close'
                    },
                    {
                        'type': 'option',
                        'label': 'Close Others',
                        'value': 'Close Others',
                    },
                    {
                        'type': 'option',
                        'label': 'Close All',
                        'value': 'Close All'
                    },
                ]
            }
        },
    },
    methods: {
        setActiveTab(tab) {
            this.$store.dispatch('setActiveTab', tab)
        },
        closeTab(tab, persist = true) {
            this.$store.commit('closeTab', tab._id)

            if(persist) {
                this.$store.commit('persistActiveWorkspaceTabs')
            }
        },
        dragStart(event) {
            this.draggedTabElement = event.target.closest('.tab')
            if(!this.draggedTabElement) {
                return
            }
            this.indexOfDraggedTab = this.tabs.findIndex(item => item._id === this.draggedTabElement.dataset.id)
            this.setActiveTab(this.tabs[this.indexOfDraggedTab])
            this.draggedTabElement.style.background = 'var(--background-color)'
            this.draggedTabElement.style.opacity = '0.5'
        },
        dragEnd() {
            if(!this.draggedTabElement) {
                return
            }
            this.draggedTabElement.style.background = ''
            this.draggedTabElement.style.opacity = ''
        },
        dragOver(event) {
            if(!this.draggedTabElement) {
                return
            }
            event.preventDefault()
        },
        dragEnter(event) {
            if(!this.draggedTabElement) {
                return
            }
            const tabToDropOn = event.target.closest('.tab')
            if(tabToDropOn) {
                tabToDropOn.classList.add('disable-pointer-events')
                tabToDropOn.style.background = 'var(--drop-target-background-color)'
            }
        },
        dragLeave(event) {
            if(!this.draggedTabElement) {
                return
            }
            const tabToDropOn = event.target.closest('.tab')
            if(tabToDropOn) {
                tabToDropOn.classList.remove('disable-pointer-events')
                tabToDropOn.style.background = ''
            }
        },
        drop(event) {
            if(!this.draggedTabElement) {
                return
            }
            event.preventDefault()
            const tabToDropOn = event.target.closest('.tab')
            if(tabToDropOn) {
                tabToDropOn.style.background = ''
                const indexOfTabToDropOn = this.tabs.findIndex(item => item._id === tabToDropOn.dataset.id)
                arrayMove(this.tabs, this.indexOfDraggedTab, indexOfTabToDropOn)
                this.$store.commit('persistActiveWorkspaceTabs')
            }
        },
        handleTabContextMenu(event, tab) {
            this.tabContextMenuElement = event.target
            this.tabContextMenuTab = tab
            this.showTabContextMenu = true
        },
        handleTabContextMenuItemClick(clickedContextMenuitem) {
            if(clickedContextMenuitem === 'Move to New Window') {
                this.$store.commit('detachTab', this.tabContextMenuTab)
                this.closeTab(this.tabContextMenuTab, true)
            }

            if(clickedContextMenuitem === 'Close') {
                this.closeTab(this.tabContextMenuTab)
            }

            if(clickedContextMenuitem === 'Close Others') {
                this.tabs.filter(tab => tab._id !== this.tabContextMenuTab._id).forEach(tab => {
                    this.closeTab(tab, false)
                })
                this.$store.commit('persistActiveWorkspaceTabs')
            }

            if(clickedContextMenuitem === 'Close All') {
                this.$store.commit('closeAllTabs')
            }
        },
        getTabMethodName(tab) {
            if(tab._type === 'request') {
                return tab.method
            }

            if(tab._type === 'socket') {
                return 'SOCK'
            }

            if(tab._type === 'request_group') {
                return ''
            }
        },
        scrollTabs(event) {
            this.$refs.tabContainer.scrollLeft += event.deltaY
        },
        toggleEnvSelectorDropdown(event) {
            this.envSelectorDropdownState.visible = !this.envSelectorDropdownState.visible
            if (this.envSelectorDropdownState.visible) {
                const containerElement = event.target.closest('.custom-dropdown')
                this.envSelectorDropdownState.contextMenuX = containerElement.getBoundingClientRect().left + containerElement.getBoundingClientRect().width
                this.envSelectorDropdownState.contextMenuY = containerElement.getBoundingClientRect().top + containerElement.getBoundingClientRect().height
                this.envSelectorDropdownState.element = containerElement
            } else {
                this.envSelectorDropdownState.element = null
            }
        },
        getEnvList() {
            const environmentOption = [
                {
                    type: 'option',
                    label: 'Environment',
                    icon: 'fas fa-code',
                    value: 'environment_modal',
                    class: 'context-menu-item-with-left-padding'
                },
                {
                    type: 'separator'
                }
            ]
            const list =  this.environments.map(item => {
                return {
                    type: 'option',
                    label: `<i class="fa fa-circle" style="color:${item.color}"></i>&nbsp;&nbsp;${item.name}`,
                    value: `${item.name}`,
                    class: 'context-menu-item-with-left-padding'
                }
            })
            return [...environmentOption, ...list]
        },
        selectEnv(value) {
            if (value === 'environment_modal') {
                this.environmentModalShow = true
                return
            }
            this.currentEnvironment = value
            this.$store.dispatch('reloadTabEnvironmentResolved')
        },
    },
    mounted() {
        document.addEventListener('dragstart', this.dragStart)
        document.addEventListener('dragend', this.dragEnd)
        document.addEventListener('dragover', this.dragOver)
        document.addEventListener('dragenter', this.dragEnter)
        document.addEventListener('dragleave', this.dragLeave)
        document.addEventListener('drop', this.drop)
    },
    unmounted() {
        document.removeEventListener('dragstart', this.dragStart)
        document.removeEventListener('dragend', this.dragEnd)
        document.removeEventListener('dragover', this.dragOver)
        document.removeEventListener('dragenter', this.dragEnter)
        document.removeEventListener('dragleave', this.dragLeave)
        document.removeEventListener('drop', this.drop)
    }
}
</script>

<style scoped>
.tab-bar-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
}

.tab-bar .tabs-container {
    display: flex;
    flex: 1;
    overflow-x: auto;
    cursor: pointer;
    min-width: 0;
}

.tab-bar .tab {
    padding-top: 0.7rem;
    padding-bottom: 0.7rem;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
    border-top: 1px solid transparent;
    white-space: nowrap;
    color: var(--content-color-secondary)
}

.tab-bar .tab:hover {
    color: var(--content-color-primary)
}

.tab-bar .tab.disable-pointer-events * {
    pointer-events: none;
}

.tab-bar .tab-active {
    border-bottom: 1px solid var(--base-color-brand);
    background-color: var(--background-color);
    color: var(--content-color-primary)
}

.tab-bar .tab-add {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
}

.environment-selector-container {
    display: flex;
    align-items: center;
    border-left: 1px solid var(--default-border-color);
    flex-shrink: 0;
    background-color: var(--background-color);
    position: relative;
}

.env-dropdown {
    display: inline-flex;
    align-items: center;
    height: 100%;
    padding: 0.7rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
}

.env-dropdown:hover {
    background-color: var(--border-color-lighter-darkened);
}

.custom-dropdown {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
}

.custom-dropdown:hover {
    background-color: var(--border-color-lighter-darkened);
}
</style>
