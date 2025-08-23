<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" :class="['icon', { active: isActive }]">
        <path
            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5 7h14M5 12h11c1 0 3 .5 3 2.5S17.333 17 16.5 17H12m-7 0h4m3 0 2-2m-2 2 2 2"
        />
    </svg>
</template>

<script setup lang="ts">
defineProps<{
    isActive?: boolean
}>()
</script>

<style scoped>
.icon {
    width: 28px;
    height: 28px;
    cursor: pointer;
    color: white;
    padding: 4px;
    margin-right: 12px;
    border-radius: 4px;
    transition: background 0.2s;
}

.icon.active {
    background: #1e1e1e;
    /* highlight background when active */
}
</style>
