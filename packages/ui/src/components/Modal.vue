<template>
    <transition name="overlay-fade" appear>
        <div v-if="modelValue" class="modal" tabindex="0" @mousedown="closeModalOnBackgroundClick">
            <transition name="modal-pop" appear>
                <div class="modal__container" :style="{ width: width }" role="dialog" aria-modal="true">
                    <div class="modal__content" :style="{ height: fullHeight ? '90vh' : undefined }">
                        <header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3>{{ title }}</h3>
                                <div style="margin-right: 1rem; white-space: nowrap;">
                                    <slot name="after-title"></slot>
                                </div>
                            </div>
                            <span @click="$emit('update:modelValue', false)"><i class="fa fa-times"></i></span>
                        </header>
                        <div class="modal-main" :style="{ flexBasis: height }">
                            <slot>No Modal Content</slot>
                        </div>
                        <footer v-if="$slots.footer">
                            <slot name="footer"></slot>
                        </footer>
                    </div>
                </div>
            </transition>
        </div>
    </transition>
</template>

<script>
export default {
    props: {
        modelValue: Boolean,
        title: String,
        height: {
            type: String,
            required: false,
        },
        width: {
            type: String,
            required: false
        },
        fullHeight: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        closeModalOnBackgroundClick(e) {
            // document.body.contains(e.target) is needed when the clicked element is no longer in the DOM
            // if you don't add it, the orphaned e.target element will close the modal, as its "closest" will
            // not yield the .modal__content class element or any other elements for that matter
            // because it has been removed by the user
            if(e.target.closest('.modal__content') === null && document.body.contains(e.target)) {
                this.$emit('update:modelValue', false)
            }
        },
        handleKeydown(event) {
            if(event.key === 'Escape') {
                const rect = this.$el.getBoundingClientRect()
                const x = rect.left
                const y = rect.top
                const topElement = document.elementFromPoint(x, y)
                if(this.$el === topElement) {
                    this.$emit('update:modelValue', false)
                }
            }
        }
    },
    mounted() {
        window.addEventListener('keydown', this.handleKeydown)
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.handleKeydown)
    }
}
</script>

<style scoped>
/* ----------  Overlay (backdrop) fade ---------- */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
    transition: opacity 220ms ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
    opacity: 0;
}

.overlay-fade-enter-to,
.overlay-fade-leave-from {
    opacity: 1;
}

/* ----------  Modal box (pop + slide) ---------- */
.modal-pop-enter-active,
.modal-pop-leave-active {
    transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms ease;
    will-change: transform, opacity;
}

.modal-pop-enter-from,
.modal-pop-leave-to {
    opacity: 0;
    transform: translateY(-12px) scale(0.98);
}

.modal-pop-enter-to,
.modal-pop-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

/* ---------- original styles ---------- */
.modal {
    --gutter: 14px;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal__container {
    min-width: 600px;
    max-width: 95vw;
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    margin: 0 auto;
    background-color: var(--modal-background-color);
    color: var(--modal-text-color);
    display: flex;
    flex-direction: column;
}

.modal__container header {
    display: grid;
    padding: var(--gutter);
    align-items: center;
    grid-template-columns: auto 20px;
    border-bottom: 1px solid var(--modal-border-color)
}

.modal__container header h3 {
    font-weight: normal;
    font-size: 1rem;
}

.modal__container header span {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    font-size: 16px;
    opacity: 0.8;
    cursor: pointer;
}

.modal__container header span:hover {
    opacity: 1;
    background-color: var(--default-border-color);
}

.modal__container .modal-main {
    flex: 1;
    text-align: left;
    overflow: auto;
    padding: 1rem 1.5rem;
}

.modal__container footer {
    height: auto;
    text-align: right;
    border-top: solid 1px var(--modal-border-color);
    padding: var(--gutter);
    background-color: var(--modal-footer-background-color);
}

.modal__container footer button, .modal__container footer input {
    margin: 0;
}

.modal__container footer button:not(:last-child), .modal__container footer input:not(:last-child) {
    margin-right: var(--gutter);
}

.modal__content {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
}

.modal ::-webkit-scrollbar {
    background-color: var(--modal-scrollbar-background);
}

.modal ::-webkit-scrollbar-thumb {
    background: var(--modal-scrollbar);
}
</style>
