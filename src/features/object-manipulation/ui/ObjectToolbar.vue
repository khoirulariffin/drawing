<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  objectType: string | null
  isCropping: boolean
  opacity: number
  position: { x: number; y: number }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  flipHorizontal: []
  flipVertical: []
  rotateCw: []
  rotateCcw: []
  'update:opacity': [value: number]
  bringForward: []
  sendBackward: []
  duplicate: []
  crop: []
  applyCrop: []
  cancelCrop: []
  exportObject: []
  delete: []
}>()

const isImage = computed(() => props.objectType === 'image')

const opacityPercent = computed(() => Math.round(props.opacity * 100))
</script>

<template>
  <div
    class="absolute z-40 flex flex-col gap-2 pointer-events-auto transition-all duration-300 animate-in fade-in zoom-in-95 ease-out-expo"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: 'translateX(-50%) translateY(-100%) translateY(-20px)',
    }"
  >
    <!-- Crop Mode Toolbar -->
    <div
      v-if="isCropping"
      class="flex items-center gap-2 px-3 py-2 bg-[var(--accent-color)] rounded-[1.5rem] shadow-2xl border border-white/20"
    >
      <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 2v14a2 2 0 0 0 2 2h14" />
          <path d="M18 22V8a2 2 0 0 0-2-2H2" />
        </svg>
      </div>
      <span class="text-xs font-bold text-white px-1">Crop Image</span>
      <button
        @click="emit('applyCrop')"
        class="apple-button px-4 h-8 rounded-full bg-white text-[var(--accent-color)] text-xs font-bold hover:bg-neutral-100 transition-colors shadow-sm"
      >
        Done
      </button>
      <button
        @click="emit('cancelCrop')"
        class="apple-button px-4 h-8 rounded-full bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors"
      >
        Cancel
      </button>
    </div>

    <!-- Normal Object Toolbar -->
    <div v-else class="flex items-center gap-1 p-1.5 apple-glass rounded-full shadow-2xl min-w-fit">
      <!-- Common Actions Area -->
      <div class="flex items-center gap-0.5 bg-[var(--bg-app)]/30 p-0.5 rounded-full">
        <!-- Crop (image only) -->
        <button
          v-if="isImage"
          @click="emit('crop')"
          title="Crop"
          class="apple-button w-9 h-9 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-app)] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 2v14a2 2 0 0 0 2 2h14" />
            <path d="M18 22V8a2 2 0 0 0-2-2H2" />
          </svg>
        </button>

        <!-- Flip Controls -->
        <button
          @click="emit('flipHorizontal')"
          class="apple-button w-9 h-9 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
            <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
            <path d="M12 2v20" />
          </svg>
        </button>

        <!-- Rotation -->
        <button
          @click="emit('rotateCw')"
          class="apple-button w-9 h-9 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>
      </div>

      <div class="w-px h-6 bg-[var(--border-color)] mx-1" />

      <!-- Opacity Slider Group -->
      <div class="flex items-center gap-2 px-3 py-1 bg-[var(--bg-app)]/30 rounded-full">
        <div
          class="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)]"
          :style="{ opacity: props.opacity }"
        ></div>
        <input
          type="range"
          min="0"
          max="100"
          :value="opacityPercent"
          @input="emit('update:opacity', Number(($event.target as HTMLInputElement).value) / 100)"
          class="w-16 h-1 accent-[var(--text-primary)] cursor-pointer"
        />
        <span class="text-[9px] font-bold text-[var(--text-secondary)] w-6 tabular-nums"
          >{{ opacityPercent }}%</span
        >
      </div>

      <div class="w-px h-6 bg-[var(--border-color)] mx-1" />

      <!-- Layer & Clone Group -->
      <div class="flex items-center gap-0.5">
        <button
          @click="emit('bringForward')"
          class="apple-button w-9 h-9 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="8" y="2" width="13" height="13" rx="2" />
            <rect x="3" y="9" width="13" height="13" rx="2" fill="white" />
          </svg>
        </button>

        <button
          @click="emit('duplicate')"
          class="apple-button w-9 h-9 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>

        <button
          @click="emit('delete')"
          class="apple-button w-9 h-9 rounded-full text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

      <!-- Arrow Indicator for Floating Panel -->
      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
        <div
          class="w-2.5 h-2.5 bg-[var(--bg-panel)] rotate-45 border-r border-b border-[var(--border-color)]"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes in-expo {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-90%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-100%) scale(1);
  }
}

.ease-out-expo {
  animation: in-expo 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
}
</style>
