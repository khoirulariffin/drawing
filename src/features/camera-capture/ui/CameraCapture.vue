<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useCamera } from '@/shared/lib/useCamera'

const emit = defineEmits<{
  capture: [dataUrl: string]
  close: []
}>()

const { isActive, error, startCamera, stopCamera, captureFrame } = useCamera()
const videoEl = ref<HTMLVideoElement | null>(null)

const open = async () => {
  await startCamera(videoEl)
}

const handleCapture = () => {
  const dataUrl = captureFrame()
  if (dataUrl) {
    emit('capture', dataUrl)
    handleClose()
  }
}

const handleClose = () => {
  stopCamera()
  emit('close')
}

open()

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden"
  >
    <div
      class="relative w-full h-full sm:h-auto sm:max-w-2xl sm:mx-4 sm:rounded-[2rem] overflow-hidden bg-black shadow-2xl flex flex-col"
    >
      <!-- Header Overlay -->
      <div
        class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-6 pointer-events-none"
      >
        <h3 class="text-sm font-bold text-white/80 uppercase tracking-widest pointer-events-auto">
          Camera
        </h3>
        <button
          @click="handleClose"
          class="apple-button w-10 h-10 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors pointer-events-auto"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Video Area -->
      <div class="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        <video
          ref="videoEl"
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover sm:aspect-video"
        />

        <!-- Loading State -->
        <div
          v-if="!isActive && !error"
          class="absolute inset-0 flex flex-col items-center justify-center gap-4"
        >
          <div
            class="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin"
          />
          <span class="text-xs font-medium text-white/40 uppercase tracking-widest"
            >Waking Sensor...</span
          >
        </div>

        <!-- Error State -->
        <div v-if="error" class="absolute inset-0 flex items-center justify-center p-8">
          <div class="apple-glass p-6 rounded-[1.5rem] bg-red-500/10 border-red-500/20 text-center">
            <p class="text-sm font-bold text-red-500">{{ error }}</p>
            <button
              @click="handleClose"
              class="mt-4 px-6 h-9 rounded-full bg-red-500 text-white text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <!-- Shutter Controls -->
      <div
        class="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent"
      >
        <div class="relative flex items-center justify-center">
          <!-- Shutter Outer Ring -->
          <div class="absolute w-20 h-20 rounded-full border-2 border-white/30"></div>

          <!-- Shutter Button -->
          <button
            @click="handleCapture"
            :disabled="!isActive"
            class="apple-button w-16 h-16 rounded-full bg-white shadow-xl hover:scale-95 active:scale-90 transition-all disabled:opacity-20 disabled:scale-100"
            title="Capture Image"
          >
            <div class="w-14 h-14 rounded-full border border-black/5"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
