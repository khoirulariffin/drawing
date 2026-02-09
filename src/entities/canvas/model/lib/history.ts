import { type Ref, type ShallowRef } from 'vue'
import * as fabric from 'fabric'

export const useCanvasHistory = (
  fabricCanvas: ShallowRef<fabric.Canvas | null>,
  history: Ref<string[]>,
  historyIndex: Ref<number>,
) => {
  const saveHistory = () => {
    if (!fabricCanvas.value) return
    const json = JSON.stringify(fabricCanvas.value.toJSON())

    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    history.value.push(json)
    historyIndex.value = history.value.length - 1
  }

  const loadFromHistory = () => {
    if (!fabricCanvas.value) return
    const json = history.value[historyIndex.value]
    if (!json) return
    fabricCanvas.value.loadFromJSON(json).then(() => {
      fabricCanvas.value!.renderAll()
    })
  }

  const undo = () => {
    if (!fabricCanvas.value || historyIndex.value <= 0) return
    historyIndex.value--
    loadFromHistory()
  }

  const redo = () => {
    if (!fabricCanvas.value || historyIndex.value >= history.value.length - 1) return
    historyIndex.value++
    loadFromHistory()
  }

  return {
    saveHistory,
    undo,
    redo,
    loadFromHistory,
  }
}
