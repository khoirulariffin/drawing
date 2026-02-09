export type ToolType = 'select' | 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text'

export interface BrushSettings {
  color: string
  width: number
  opacity: number
}

export interface CanvasState {
  activeTool: ToolType
  brush: BrushSettings
  backgroundColor: string
  zoom: number
  isCameraOpen: boolean
}

export interface HistoryEntry {
  json: string
  timestamp: number
}
