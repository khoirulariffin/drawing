<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useCanvas } from '@/entities/canvas/model/useCanvas'
import CanvasToolbar from '@/features/drawing-tools/ui/CanvasToolbar.vue'
import CameraCapture from '@/features/camera-capture/ui/CameraCapture.vue'
import ObjectToolbar from '@/features/object-manipulation/ui/ObjectToolbar.vue'
import ThemeToggle from '@/features/theme-toggle/ui/ThemeToggle.vue'
import { useTheme } from '@/shared/lib/useTheme'
import { watch } from 'vue'

const canvasEl = ref<HTMLCanvasElement | null>(null)
const canvasWrapper = ref<HTMLDivElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isCameraOpen = ref(false)
const { isDark } = useTheme()

const {
  fabricCanvas,
  activeTool,
  brushSettings,
  historyIndex,
  history,
  initCanvas,
  setTool,
  updateBrush,
  addImageFromURL,
  addImageFromFile,
  exportCanvas,
  exportObject,
  clearCanvas,
  deleteSelected,
  undo,
  redo,
  resizeCanvas,
  dispose,
  getActiveObject,
  getActiveObjectType,
  flipObject,
  rotateObject,
  setObjectOpacity,
  getObjectOpacity,
  bringForward,
  sendBackward,
  duplicateObject,
  cropImage,
  applyCrop,
  cancelCrop,
  isCropping,
  setCanvasBackground,
} = useCanvas(canvasEl)

const canUndo = ref(false)
const canRedo = ref(false)

const selectedObjectType = ref<string | null>(null)
const selectedObjectOpacity = ref(1)
const isObjectSelected = ref(false)
const isCropMode = ref(false)
const objectToolbarPos = reactive({ x: 0, y: 0 })

const updateSelectionState = () => {
  const obj = getActiveObject()
  if (obj) {
    isObjectSelected.value = true
    selectedObjectType.value = getActiveObjectType()
    selectedObjectOpacity.value = getObjectOpacity()
    isCropMode.value = isCropping()

    const bound = obj.getBoundingRect()
    const wrapperRect = canvasWrapper.value?.getBoundingClientRect()
    if (wrapperRect) {
      objectToolbarPos.x = bound.left + bound.width / 2
      objectToolbarPos.y = Math.max(
        0,
        bound.top - 12 - (wrapperRect.top - (canvasWrapper.value?.offsetTop ?? 0)),
      )
    }
  } else {
    isObjectSelected.value = false
    selectedObjectType.value = null
    isCropMode.value = false
  }
}

const updateHistoryState = () => {
  canUndo.value = historyIndex.value > 0
  canRedo.value = historyIndex.value < history.value.length - 1
}

const handleSetTool = (tool: typeof activeTool.value) => {
  setTool(tool)
}

const handleUndo = () => {
  undo()
  updateHistoryState()
}

const handleRedo = () => {
  redo()
  updateHistoryState()
}

const handleClear = () => {
  clearCanvas()
  updateHistoryState()
}

const handleDelete = () => {
  deleteSelected()
  updateHistoryState()
}

const handleUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    addImageFromFile(file)
    setTool('select')
    input.value = ''
  }
  updateHistoryState()
}

const handleCameraCapture = (dataUrl: string) => {
  addImageFromURL(dataUrl)
  isCameraOpen.value = false
  setTool('select')
  updateHistoryState()
}

const handleExport = () => {
  exportCanvas('png')
}

const handleResize = () => {
  if (!canvasWrapper.value) return
  const { clientWidth, clientHeight } = canvasWrapper.value
  resizeCanvas(clientWidth, clientHeight)
}

const handleKeydown = (e: KeyboardEvent) => {
  const isMeta = e.metaKey || e.ctrlKey

  if (isMeta && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    handleUndo()
  }
  if (isMeta && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    handleRedo()
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (activeTool.value === 'select') {
      handleDelete()
    }
  }
}

const handleApplyCrop = () => {
  applyCrop()
  updateSelectionState()
  updateHistoryState()
}

const handleCancelCrop = () => {
  cancelCrop()
  updateSelectionState()
}

const handleExportObject = () => {
  exportObject('png')
}

const handleOpacityChange = (value: number) => {
  setObjectOpacity(value)
  selectedObjectOpacity.value = value
}

// Update canvas background when theme changes
const updateCanvasBackground = () => {
  const bgColor = isDark.value ? '#1c1c1e' : '#ffffff'
  setCanvasBackground(bgColor)
}

watch(isDark, updateCanvasBackground)

let stateWatcher: ReturnType<typeof setInterval>

onMounted(() => {
  if (canvasWrapper.value) {
    const { clientWidth, clientHeight } = canvasWrapper.value
    initCanvas(clientWidth, clientHeight)
    updateCanvasBackground()
    updateHistoryState()
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)

  const canvas = fabricCanvas.value
  if (canvas) {
    canvas.on('selection:created', updateSelectionState)
    canvas.on('selection:updated', updateSelectionState)
    canvas.on('selection:cleared', updateSelectionState)
    canvas.on('object:moving', updateSelectionState)
    canvas.on('object:scaling', updateSelectionState)
    canvas.on('object:rotating', updateSelectionState)
  }

  stateWatcher = setInterval(() => {
    updateHistoryState()
    updateSelectionState()
  }, 300)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  clearInterval(stateWatcher)
  dispose()
})
</script>

<template>
  <div class="flex flex-col h-screen bg-(--bg-app) overflow-hidden select-none touch-none">
    <!-- Top Header -->
    <header
      class="flex items-center justify-between px-6 md:px-12 py-6 md:py-12 absolute top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div class="flex items-center gap-2 pointer-events-auto">
        <div
          class="w-8 h-8 rounded-lg bg-(--accent-color) flex items-center justify-center text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m12 19 7-7 3 3-7 7-3-3z" />
            <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="m2 2 5 5" />
            <path d="m8.5 8.5 1 1" />
          </svg>
        </div>
        <h1 class="text-sm font-bold tracking-tight text-(--text-primary)">DrawingBoard</h1>
      </div>

      <div class="flex items-center gap-3 pointer-events-auto">
        <ThemeToggle />
      </div>
    </header>

    <!-- Canvas Area -->
    <div
      ref="canvasWrapper"
      class="flex-1 relative m-0 sm:m-4 sm:rounded-[2.5rem] overflow-hidden bg-(--bg-canvas) shadow-2xl border border-(--border-color) transition-all duration-500 ease-in-out z-0"
    >
      <canvas ref="canvasEl" />

      <!-- Object Toolbar (floating) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <ObjectToolbar
          v-if="isObjectSelected && activeTool === 'select'"
          :object-type="selectedObjectType"
          :is-cropping="isCropMode"
          :opacity="selectedObjectOpacity"
          :position="objectToolbarPos"
          @flip-horizontal="flipObject('horizontal')"
          @flip-vertical="flipObject('vertical')"
          @rotate-cw="rotateObject(90)"
          @rotate-ccw="rotateObject(-90)"
          @update:opacity="handleOpacityChange"
          @bring-forward="bringForward()"
          @send-backward="sendBackward()"
          @duplicate="duplicateObject()"
          @crop="cropImage()"
          @apply-crop="handleApplyCrop"
          @cancel-crop="handleCancelCrop"
          @export-object="handleExportObject"
          @delete="handleDelete"
        />
      </Transition>
      <!-- Floating Bottom Toolbar -->
      <div class="absolute bottom-24 md:bottom-8 left-0 right-0 z-40 px-4 pointer-events-none">
        <div class="pointer-events-auto flex justify-center">
          <CanvasToolbar
            :active-tool="activeTool"
            :brush-color="brushSettings.color"
            :brush-width="brushSettings.width"
            :can-undo="canUndo"
            :can-redo="canRedo"
            @update:active-tool="handleSetTool"
            @update:brush-color="(c) => updateBrush({ color: c })"
            @update:brush-width="(w) => updateBrush({ width: w })"
            @upload="handleUpload"
            @camera="isCameraOpen = true"
            @export="handleExport"
            @clear="handleClear"
            @delete="handleDelete"
            @undo="handleUndo"
            @redo="handleRedo"
          />
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />

    <!-- Camera Modal (Fills screen on mobile) -->
    <CameraCapture
      v-if="isCameraOpen"
      @capture="handleCameraCapture"
      @close="isCameraOpen = false"
    />
  </div>
</template>

<style>
/* Global styles for the leaf shadow/canvas look */
.canvas-container {
  width: 100% !important;
  height: 100% !important;
}

canvas {
  touch-action: none;
}
</style>
