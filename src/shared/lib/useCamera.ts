import { ref, type Ref } from 'vue'

export const useCamera = () => {
  const videoRef = ref<HTMLVideoElement | null>(null)
  const stream = ref<MediaStream | null>(null)
  const isActive = ref(false)
  const error = ref<string | null>(null)
  const facingMode = ref<'user' | 'environment'>('environment')

  const startCamera = async (videoEl: Ref<HTMLVideoElement | null>) => {
    try {
      error.value = null
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode.value,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      stream.value = mediaStream
      videoRef.value = videoEl.value

      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream
        await videoRef.value.play()
      }

      isActive.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to access camera'
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
      stream.value = null
    }
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
    isActive.value = false
  }

  const captureFrame = (): string | null => {
    if (!videoRef.value) return null

    const video = videoRef.value
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = video.videoWidth
    tempCanvas.height = video.videoHeight

    const ctx = tempCanvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0)
    return tempCanvas.toDataURL('image/png')
  }

  const switchCamera = async (videoEl: Ref<HTMLVideoElement | null>) => {
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
    stopCamera()
    await startCamera(videoEl)
  }

  return {
    videoRef,
    stream,
    isActive,
    error,
    facingMode,
    startCamera,
    stopCamera,
    captureFrame,
    switchCamera,
  }
}
