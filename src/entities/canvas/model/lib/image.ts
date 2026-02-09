import { type ShallowRef } from 'vue'
import * as fabric from 'fabric'

export const useCanvasImage = (
  fabricCanvas: ShallowRef<fabric.Canvas | null>,
  saveHistory: () => void,
  getActiveObject: () => fabric.Object | null,
) => {
  const addImageFromURL = (url: string) => {
    if (!fabricCanvas.value) return

    fabric.FabricImage.fromURL(url).then((img) => {
      const canvas = fabricCanvas.value!
      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()

      const scale = Math.min(
        (canvasWidth * 0.2) / (img.width ?? canvasWidth),
        (canvasHeight * 0.2) / (img.height ?? canvasHeight),
      )

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - (img.width ?? 0) * scale) / 2,
        top: (canvasHeight - (img.height ?? 0) * scale) / 2,
        selectable: true,
        evented: true,
      })

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
      saveHistory()
    })
  }

  const addImageFromFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      if (url) addImageFromURL(url)
    }
    reader.readAsDataURL(file)
  }

  const exportCanvas = (format: 'png' | 'jpeg' = 'png') => {
    if (!fabricCanvas.value) return
    const dataURL = fabricCanvas.value.toDataURL({
      format,
      quality: 1,
      multiplier: 2,
    })
    const link = document.createElement('a')
    link.download = `drawing-${Date.now()}.${format}`
    link.href = dataURL
    link.click()
  }

  const cropImage = () => {
    const obj = getActiveObject()
    if (!obj || !(obj instanceof fabric.FabricImage) || !fabricCanvas.value) return

    const canvas = fabricCanvas.value
    const img = obj

    const bound = img.getBoundingRect()

    canvas.discardActiveObject()
    canvas.renderAll()

    const cropRect = new fabric.Rect({
      left: bound.left + bound.width * 0.1,
      top: bound.top + bound.height * 0.1,
      width: bound.width * 0.8,
      height: bound.height * 0.8,
      fill: 'rgba(0,0,0,0.3)',
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      cornerColor: '#3b82f6',
      cornerStrokeColor: '#ffffff',
      cornerSize: 10,
      transparentCorners: false,
      selectable: true,
      evented: true,
      hasRotatingPoint: false,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
    })

    // @ts-expect-error custom property
    cropRect._isCropRect = true
    // @ts-expect-error custom property
    cropRect._targetImage = img

    canvas.add(cropRect)
    canvas.setActiveObject(cropRect)
    canvas.renderAll()
  }

  const applyCrop = () => {
    if (!fabricCanvas.value) return
    const canvas = fabricCanvas.value
    const activeObj = canvas.getActiveObject()

    // @ts-expect-error custom property
    if (!activeObj || !activeObj._isCropRect) return

    // @ts-expect-error custom property
    const targetImage = activeObj._targetImage as fabric.FabricImage
    if (!targetImage) return

    const cropRect = activeObj
    const imgBound = targetImage.getBoundingRect()
    const cropBound = cropRect.getBoundingRect()

    const imgEl = targetImage.getElement() as HTMLImageElement
    const naturalW = imgEl.naturalWidth || (targetImage.width ?? 1)
    const naturalH = imgEl.naturalHeight || (targetImage.height ?? 1)

    const relativeX = (cropBound.left - imgBound.left) / imgBound.width
    const relativeY = (cropBound.top - imgBound.top) / imgBound.height
    const relativeW = cropBound.width / imgBound.width
    const relativeH = cropBound.height / imgBound.height

    const srcX = relativeX * naturalW
    const srcY = relativeY * naturalH
    const srcW = relativeW * naturalW
    const srcH = relativeH * naturalH

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = Math.round(srcW)
    tempCanvas.height = Math.round(srcH)
    const ctx = tempCanvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(
      imgEl,
      Math.round(srcX),
      Math.round(srcY),
      Math.round(srcW),
      Math.round(srcH),
      0,
      0,
      Math.round(srcW),
      Math.round(srcH),
    )

    const dataUrl = tempCanvas.toDataURL('image/png')

    canvas.remove(cropRect)
    canvas.remove(targetImage)
    canvas.renderAll()

    fabric.FabricImage.fromURL(dataUrl).then((newImg) => {
      newImg.set({
        left: cropBound.left,
        top: cropBound.top,
        selectable: true,
        evented: true,
      })
      canvas.add(newImg)
      canvas.setActiveObject(newImg)
      canvas.renderAll()
      saveHistory()
    })
  }

  const cancelCrop = () => {
    if (!fabricCanvas.value) return
    const canvas = fabricCanvas.value
    const objects = canvas.getObjects()
    const cropRect = objects.find((o) => (o as unknown as { _isCropRect: boolean })._isCropRect)
    if (cropRect) {
      canvas.remove(cropRect)
      canvas.renderAll()
    }
  }

  const isCropping = (): boolean => {
    if (!fabricCanvas.value) return false
    const obj = fabricCanvas.value.getActiveObject()
    return (obj as unknown as { _isCropRect: boolean })._isCropRect === true
  }

  const exportObject = (
    format: 'png' | 'jpeg' = 'png',
    getActiveObjectType: () => string | null,
  ) => {
    const obj = getActiveObject()
    if (!obj || !fabricCanvas.value) return

    const canvas = fabricCanvas.value

    const cloneAndExport = (target: fabric.Object) => {
      const tempCanvas = document.createElement('canvas')
      const bound = target.getBoundingRect()
      const multiplier = 2

      tempCanvas.width = bound.width * multiplier
      tempCanvas.height = bound.height * multiplier

      const tempFabric = new fabric.StaticCanvas(tempCanvas, {
        width: bound.width * multiplier,
        height: bound.height * multiplier,
        backgroundColor: format === 'jpeg' ? '#ffffff' : undefined,
      })

      target.clone().then((cloned: fabric.Object) => {
        cloned.set({
          left: ((target.left ?? 0) - bound.left) * multiplier,
          top: ((target.top ?? 0) - bound.top) * multiplier,
          scaleX: (target.scaleX ?? 1) * multiplier,
          scaleY: (target.scaleY ?? 1) * multiplier,
          selectable: false,
          evented: false,
        })

        tempFabric.add(cloned)
        tempFabric.renderAll()

        const dataURL = tempFabric.toDataURL({ format, quality: 1, multiplier: 1 })
        const link = document.createElement('a')
        const objType = getActiveObjectType() ?? 'object'
        link.download = `${objType}-${Date.now()}.${format}`
        link.href = dataURL
        link.click()

        tempFabric.dispose()
      })
    }

    cloneAndExport(obj)
  }

  return {
    addImageFromURL,
    addImageFromFile,
    exportCanvas,
    cropImage,
    applyCrop,
    cancelCrop,
    isCropping,
    exportObject,
  }
}
