import { type Ref, type ShallowRef } from 'vue'
import * as fabric from 'fabric'
import type { ToolType, BrushSettings } from '@/shared/types/canvas'

export const useCanvasTools = (
  fabricCanvas: ShallowRef<fabric.Canvas | null>,
  activeTool: Ref<ToolType>,
  brushSettings: Ref<BrushSettings>,
  saveHistory: () => void,
) => {
  const setupShapeDrawing = (shape: 'rectangle' | 'circle' | 'line') => {
    if (!fabricCanvas.value) return
    const canvas = fabricCanvas.value

    let isDrawing = false
    let startX = 0
    let startY = 0
    let activeShape: fabric.Object | null = null

    const onMouseDown = (opt: fabric.TPointerEventInfo) => {
      isDrawing = true
      const pointer = canvas.getScenePoint(opt.e)
      startX = pointer.x
      startY = pointer.y

      const shapeOptions = {
        left: startX,
        top: startY,
        fill: 'transparent',
        stroke: brushSettings.value.color,
        strokeWidth: brushSettings.value.width,
        selectable: false,
        evented: false,
      }

      if (shape === 'rectangle') {
        activeShape = new fabric.Rect({ ...shapeOptions, width: 0, height: 0 })
      } else if (shape === 'circle') {
        activeShape = new fabric.Ellipse({ ...shapeOptions, rx: 0, ry: 0 })
      } else {
        activeShape = new fabric.Line([startX, startY, startX, startY], {
          stroke: brushSettings.value.color,
          strokeWidth: brushSettings.value.width,
          selectable: false,
          evented: false,
        })
      }

      if (activeShape) canvas.add(activeShape)
    }

    const onMouseMove = (opt: fabric.TPointerEventInfo) => {
      if (!isDrawing || !activeShape) return
      const pointer = canvas.getScenePoint(opt.e)

      if (shape === 'rectangle') {
        const rect = activeShape as fabric.Rect
        rect.set({
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
        })
      } else if (shape === 'circle') {
        const ellipse = activeShape as fabric.Ellipse
        ellipse.set({
          rx: Math.abs(pointer.x - startX) / 2,
          ry: Math.abs(pointer.y - startY) / 2,
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
        })
      } else {
        const line = activeShape as fabric.Line
        line.set({ x2: pointer.x, y2: pointer.y })
      }

      canvas.renderAll()
    }

    const onMouseUp = () => {
      if (!isDrawing) return
      isDrawing = false
      activeShape = null
      saveHistory()
    }

    canvas.off('mouse:down')
    canvas.off('mouse:move')
    canvas.off('mouse:up')
    canvas.on('mouse:down', onMouseDown)
    canvas.on('mouse:move', onMouseMove)
    canvas.on('mouse:up', onMouseUp)
  }

  const setupTextTool = () => {
    if (!fabricCanvas.value) return
    const canvas = fabricCanvas.value

    canvas.off('mouse:down')
    canvas.off('mouse:move')
    canvas.off('mouse:up')

    const onMouseDown = (opt: fabric.TPointerEventInfo) => {
      const pointer = canvas.getScenePoint(opt.e)
      const text = new fabric.IText('Type here', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 20,
        fill: brushSettings.value.color,
        fontFamily: 'sans-serif',
        selectable: true,
        evented: true,
      })
      canvas.add(text)
      canvas.setActiveObject(text)
      text.enterEditing()
      saveHistory()

      canvas.off('mouse:down', onMouseDown)
    }

    canvas.on('mouse:down', onMouseDown)
  }

  const setTool = (tool: ToolType) => {
    if (!fabricCanvas.value) return
    activeTool.value = tool

    const canvas = fabricCanvas.value

    canvas.off('mouse:down')
    canvas.off('mouse:move')
    canvas.off('mouse:up')

    canvas.isDrawingMode = false
    canvas.selection = false
    canvas.defaultCursor = 'default'
    canvas.forEachObject((obj) => {
      obj.selectable = false
      obj.evented = false
    })

    switch (tool) {
      case 'select':
        canvas.isDrawingMode = false
        canvas.selection = true
        canvas.defaultCursor = 'default'
        canvas.forEachObject((obj) => {
          obj.selectable = true
          obj.evented = true
        })
        break

      case 'pencil':
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
        canvas.freeDrawingBrush.color = brushSettings.value.color
        canvas.freeDrawingBrush.width = brushSettings.value.width
        break

      case 'eraser':
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
        canvas.freeDrawingBrush.color = '#ffffff'
        canvas.freeDrawingBrush.width = brushSettings.value.width * 3
        break

      case 'rectangle':
      case 'circle':
      case 'line':
        canvas.isDrawingMode = false
        canvas.defaultCursor = 'crosshair'
        setupShapeDrawing(tool)
        break

      case 'text':
        canvas.isDrawingMode = false
        canvas.defaultCursor = 'text'
        setupTextTool()
        break
    }
  }

  const updateBrush = (settings: Partial<BrushSettings>) => {
    brushSettings.value = { ...brushSettings.value, ...settings }

    if (!fabricCanvas.value?.freeDrawingBrush) return
    if (settings.color && activeTool.value !== 'eraser') {
      fabricCanvas.value.freeDrawingBrush.color = settings.color
    }
    if (settings.width) {
      fabricCanvas.value.freeDrawingBrush.width =
        activeTool.value === 'eraser' ? settings.width * 3 : settings.width
    }
  }

  return {
    setTool,
    updateBrush,
  }
}
