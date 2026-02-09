import { ref, shallowRef, type Ref } from 'vue'
import * as fabric from 'fabric'
import type { ToolType, BrushSettings } from '@/shared/types/canvas'
import { useCanvasHistory } from './lib/history'
import { useCanvasTools } from './lib/tools'
import { useCanvasTransform } from './lib/transform'
import { useCanvasImage } from './lib/image'

export const useCanvas = (canvasElRef: Ref<HTMLCanvasElement | null>) => {
  const fabricCanvas = shallowRef<fabric.Canvas | null>(null)
  const activeTool = ref<ToolType>('pencil')
  const brushSettings = ref<BrushSettings>({
    color: '#000000',
    width: 3,
    opacity: 1,
  })
  const history = ref<string[]>([])
  const historyIndex = ref(-1)
  const isCanvasReady = ref(false)

  // 1. Setup History
  const { saveHistory, undo, redo, loadFromHistory } = useCanvasHistory(
    fabricCanvas,
    history,
    historyIndex,
  )

  // 2. Setup Transform & Basic Actions
  const {
    getActiveObject,
    flipObject,
    rotateObject,
    setObjectOpacity,
    getObjectOpacity,
    bringForward,
    sendBackward,
    duplicateObject,
    deleteSelected,
  } = useCanvasTransform(fabricCanvas, saveHistory)

  // 3. Setup Tools
  const { setTool, updateBrush } = useCanvasTools(
    fabricCanvas,
    activeTool,
    brushSettings,
    saveHistory,
  )

  // 4. Setup Image Actions
  const {
    addImageFromURL,
    addImageFromFile,
    exportCanvas,
    cropImage,
    applyCrop,
    cancelCrop,
    isCropping,
    exportObject: _exportObject,
  } = useCanvasImage(fabricCanvas, saveHistory, getActiveObject)

  const getActiveObjectType = (): string | null => {
    const obj = getActiveObject()
    if (!obj) return null
    if (obj instanceof fabric.FabricImage) return 'image'
    if (obj instanceof fabric.Rect) return 'rectangle'
    if (obj instanceof fabric.Ellipse) return 'circle'
    if (obj instanceof fabric.Line) return 'line'
    if (obj instanceof fabric.IText || obj instanceof fabric.FabricText) return 'text'
    if (obj instanceof fabric.Path) return 'path'
    if (obj instanceof fabric.ActiveSelection) return 'group'
    return 'object'
  }

  const exportObject = (format: 'png' | 'jpeg' = 'png') => {
    _exportObject(format, getActiveObjectType)
  }

  const initCanvas = (width: number, height: number) => {
    if (!canvasElRef.value) return

    const canvas = new fabric.Canvas(canvasElRef.value, {
      width,
      height,
      isDrawingMode: true,
    })

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
    canvas.freeDrawingBrush.color = brushSettings.value.color
    canvas.freeDrawingBrush.width = brushSettings.value.width

    canvas.on('path:created', () => saveHistory())
    canvas.on('object:modified', () => saveHistory())

    fabricCanvas.value = canvas
    isCanvasReady.value = true
    saveHistory()
  }

  const clearCanvas = () => {
    if (!fabricCanvas.value) return
    fabricCanvas.value.clear()
    fabricCanvas.value.renderAll()
    saveHistory()
  }

  const resizeCanvas = (width: number, height: number) => {
    if (!fabricCanvas.value) return
    fabricCanvas.value.setDimensions({ width, height })
    fabricCanvas.value.renderAll()
  }

  const dispose = () => {
    if (fabricCanvas.value) {
      fabricCanvas.value.dispose()
      fabricCanvas.value = null
    }
  }

  const setCanvasBackground = (color: string) => {
    if (!fabricCanvas.value) return
    fabricCanvas.value.backgroundColor = color
    fabricCanvas.value.renderAll()
  }

  return {
    fabricCanvas,
    activeTool,
    brushSettings,
    history,
    historyIndex,
    isCanvasReady,
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
  }
}
