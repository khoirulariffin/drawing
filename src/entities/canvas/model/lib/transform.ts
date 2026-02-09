import { type ShallowRef } from 'vue'
import * as fabric from 'fabric'

export const useCanvasTransform = (
  fabricCanvas: ShallowRef<fabric.Canvas | null>,
  saveHistory: () => void,
) => {
  const getActiveObject = (): fabric.Object | null => {
    return fabricCanvas.value?.getActiveObject() ?? null
  }

  const flipObject = (direction: 'horizontal' | 'vertical') => {
    const obj = getActiveObject()
    if (!obj || !fabricCanvas.value) return
    if (direction === 'horizontal') {
      obj.set('flipX', !obj.flipX)
    } else {
      obj.set('flipY', !obj.flipY)
    }
    fabricCanvas.value.renderAll()
    saveHistory()
  }

  const rotateObject = (angle: number) => {
    const obj = getActiveObject()
    if (!obj || !fabricCanvas.value) return
    obj.rotate((obj.angle ?? 0) + angle)
    fabricCanvas.value.renderAll()
    saveHistory()
  }

  const setObjectOpacity = (opacity: number) => {
    const obj = getActiveObject()
    if (!obj || !fabricCanvas.value) return
    obj.set('opacity', opacity)
    fabricCanvas.value.renderAll()
    saveHistory()
  }

  const getObjectOpacity = (): number => {
    const obj = getActiveObject()
    return obj?.opacity ?? 1
  }

  const bringForward = () => {
    const obj = getActiveObject()
    if (!obj || !fabricCanvas.value) return
    fabricCanvas.value.bringObjectForward(obj)
    fabricCanvas.value.renderAll()
    saveHistory()
  }

  const sendBackward = () => {
    const obj = getActiveObject()
    if (!obj || !fabricCanvas.value) return
    fabricCanvas.value.sendObjectBackwards(obj)
    fabricCanvas.value.renderAll()
    saveHistory()
  }

  const duplicateObject = () => {
    const obj = getActiveObject()
    if (!obj || !fabricCanvas.value) return
    obj.clone().then((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left ?? 0) + 20,
        top: (cloned.top ?? 0) + 20,
        selectable: true,
        evented: true,
      })
      fabricCanvas.value!.add(cloned)
      fabricCanvas.value!.setActiveObject(cloned)
      fabricCanvas.value!.renderAll()
      saveHistory()
    })
  }

  const deleteSelected = () => {
    if (!fabricCanvas.value) return
    const activeObjects = fabricCanvas.value.getActiveObjects()
    if (activeObjects.length === 0) return
    activeObjects.forEach((obj) => fabricCanvas.value!.remove(obj))
    fabricCanvas.value.discardActiveObject()
    fabricCanvas.value.renderAll()
    saveHistory()
  }

  return {
    getActiveObject,
    flipObject,
    rotateObject,
    setObjectOpacity,
    getObjectOpacity,
    bringForward,
    sendBackward,
    duplicateObject,
    deleteSelected,
  }
}
