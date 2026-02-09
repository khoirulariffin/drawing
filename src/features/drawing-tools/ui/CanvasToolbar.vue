<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ToolType } from '@/shared/types/canvas'

interface Props {
  activeTool: ToolType
  brushColor: string
  brushWidth: number
  canUndo: boolean
  canRedo: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:activeTool': [tool: ToolType]
  'update:brushColor': [color: string]
  'update:brushWidth': [width: number]
  upload: []
  camera: []
  export: []
  clear: []
  delete: []
  undo: []
  redo: []
}>()

const showBrushPanel = ref(false)

const tools: { id: ToolType; label: string; icon: string }[] = [
  {
    id: 'select',
    label: 'Select',
    icon: '<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/>',
  },
  {
    id: 'pencil',
    label: 'Pencil',
    icon: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  },
  {
    id: 'eraser',
    label: 'Eraser',
    icon: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    icon: '<rect x="3" y="3" width="18" height="18" rx="2"/>',
  },
  {
    id: 'circle',
    label: 'Circle',
    icon: '<circle cx="12" cy="12" r="10"/>',
  },
  {
    id: 'line',
    label: 'Line',
    icon: '<path d="M5 19L19 5"/>',
  },
  {
    id: 'text',
    label: 'Text',
    icon: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
  },
]

const brushWidths = [1, 2, 3, 5, 8, 12, 20]

const isActive = (tool: ToolType) => props.activeTool === tool

const currentToolLabel = computed(() => tools.find((t) => t.id === props.activeTool)?.label ?? '')
</script>

<template>
  <div
    class="relative flex flex-col gap-3 w-full max-w-fit mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <!-- Brush Panel Dropdown (Moved outside overflow container) -->
    <Transition
      enter-active-class="transition duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="showBrushPanel"
        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-5 apple-glass rounded-[2rem] z-50 min-w-[260px] shadow-2xl"
      >
        <!-- Color Palettes -->
        <div class="mb-5">
          <div class="flex items-center justify-between mb-3 px-1">
            <label class="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider"
              >Color</label
            >
            <div class="flex items-center gap-2">
              <div class="text-[10px] font-mono text-[var(--text-secondary)]">
                {{ brushColor.toUpperCase() }}
              </div>
              <input
                type="color"
                :value="brushColor"
                @input="emit('update:brushColor', ($event.target as HTMLInputElement).value)"
                class="w-6 h-6 rounded-md border-0 p-0 overflow-hidden cursor-pointer"
              />
            </div>
          </div>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="color in [
                '#000000',
                '#ffffff',
                '#ff3b30',
                '#0071e3',
                '#34c759',
                '#ff9500',
                '#5856d6',
                '#af52de',
                '#ffcc00',
                '#ff2d55',
                '#a2a2a2',
                '#5ac8fa',
              ]"
              :key="color"
              @click="emit('update:brushColor', color)"
              class="apple-button w-8 h-8 rounded-full border-2 transition-all hover:scale-125 active:scale-90 shadow-sm"
              :class="
                brushColor === color
                  ? 'border-[var(--text-primary)] scale-110 shadow-md'
                  : 'border-transparent'
              "
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>

        <!-- Brush Size Picker -->
        <div>
          <label
            class="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 px-1"
            >Size</label
          >
          <div
            class="flex items-center gap-1.5 bg-[var(--bg-app)]/50 p-1.5 rounded-full overflow-x-auto no-scrollbar"
          >
            <button
              v-for="w in brushWidths"
              :key="w"
              @click="emit('update:brushWidth', w)"
              class="apple-button flex-shrink-0 w-8 h-8 rounded-full transition-all"
              :class="
                brushWidth === w
                  ? 'bg-[var(--bg-item-active)] text-[var(--text-active)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-app)]'
              "
            >
              <div
                class="rounded-full"
                :style="{
                  width: `${Math.max(4, w * 1.2)}px`,
                  height: `${Math.max(4, w * 1.2)}px`,
                  backgroundColor: brushWidth === w ? 'var(--text-active)' : 'currentColor',
                }"
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main Toolbar Container -->
    <div
      class="apple-glass rounded-[2rem] p-1.5 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar"
    >
      <!-- Primary Drawing Tools Group -->
      <div class="flex items-center gap-1 bg-[var(--bg-app)]/50 rounded-[1.75rem] p-1">
        <button
          v-for="tool in tools"
          :key="tool.id"
          @click="emit('update:activeTool', tool.id)"
          :title="tool.label"
          class="apple-button w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all"
          :class="
            isActive(tool.id)
              ? 'bg-[var(--bg-item-active)] text-[var(--text-active)] shadow-lg scale-105'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-app)] hover:text-[var(--text-primary)]'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            v-html="tool.icon"
          />
        </button>
      </div>

      <!-- Vertical Divider -->
      <div class="w-px h-8 bg-[var(--border-color)] mx-1 hidden sm:block" />

      <!-- Brush & Color Section -->
      <div class="relative flex items-center">
        <button
          @click="showBrushPanel = !showBrushPanel"
          class="apple-button h-11 px-3 gap-2 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-app)] transition-colors"
          :class="{ 'bg-[var(--bg-app)]': showBrushPanel }"
        >
          <div
            class="rounded-full shadow-inner border border-[var(--border-color)] transition-transform"
            :style="{
              width: `${Math.max(12, Math.min(brushWidth * 2, 24))}px`,
              height: `${Math.max(12, Math.min(brushWidth * 2, 24))}px`,
              backgroundColor: brushColor,
            }"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="text-[var(--text-secondary)] transition-transform duration-300"
            :class="{ 'rotate-180': showBrushPanel }"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      <!-- Action Group -->
      <div class="flex items-center gap-0.5 px-1 ml-auto">
        <button
          @click="emit('upload')"
          title="Upload"
          class="apple-button w-10 h-10 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-app)] hover:text-[var(--text-primary)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>

        <button
          @click="emit('camera')"
          title="Camera"
          class="apple-button w-10 h-10 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-app)] hover:text-[var(--text-primary)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
            />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </button>

        <div class="w-px h-6 bg-[var(--border-color)] mx-1" />

        <button
          @click="emit('undo')"
          :disabled="!canUndo"
          class="apple-button w-10 h-10 rounded-full transition-opacity disabled:opacity-20"
          :class="
            canUndo
              ? 'text-[var(--text-primary)] hover:bg-[var(--bg-app)]'
              : 'text-[var(--text-secondary)]'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>

        <button
          @click="emit('redo')"
          :disabled="!canRedo"
          class="apple-button w-10 h-10 rounded-full transition-opacity disabled:opacity-20"
          :class="
            canRedo
              ? 'text-[var(--text-primary)] hover:bg-[var(--bg-app)]'
              : 'text-[var(--text-secondary)]'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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

        <div class="w-px h-6 bg-[var(--border-color)] mx-1" />

        <button
          @click="emit('clear')"
          title="Clear"
          class="apple-button w-10 h-10 rounded-full text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>

        <button
          @click="emit('export')"
          class="apple-button h-10 px-4 ml-1 rounded-full bg-[var(--accent-color)] text-white font-semibold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
        >
          Export
        </button>
      </div>
    </div>

    <!-- Active Indicator / Feedback -->
    <div class="flex justify-center">
      <div class="px-4 py-1.5 apple-glass rounded-full">
        <span
          class="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]"
          >{{ currentToolLabel }}</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
