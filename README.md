# Drawing App 🎨

A modern drawing application built with **Vue 3**, **Fabric.js**, and **TypeScript**, following the **Feature-Sliced Design (FSD)** architecture.

## ✨ Features

- **Drawing Tools**: Pencil, Eraser, Rectangle, Circle, Line.
- **Text Tool**: Add and edit text directly on canvas.
- **Image Handling**: Upload images or capture directly from camera.
- **Transformations**: Flip, Rotate, Opacity adjustment, Layer ordering (Bring Forward/Backward).
- **Cropping**: Intuitive image cropping functionality.
- **History**: Full Undo/Redo support.
- **Export**: Export individual objects or the entire canvas as PNG/JPEG.

## 🏗️ Architecture: Feature-Sliced Design (FSD)

The project is structured according to the [Feature-Sliced Design](https://feature-sliced.design/) methodology for better maintainability and scalability:

- **`app/`**: Global setup, styles, and entry points.
- **`pages/`**: Application pages (e.g., HomePage).
- **`widgets/`**: Complex components composed of features and entities (e.g., DrawingBoard).
- **`features/`**: User-facing functionalities (e.g., DrawingTools, CameraCapture, ObjectManipulation).
- **`entities/`**: Business logic and domain entities (e.g., Canvas model).
- **`shared/`**: Reusable UI components, icons, types, and libraries.

## 🛠️ Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Canvas Engine**: Fabric.js (v6)
- **Styling**: Tailwind CSS
- **State Management**: Pinia (if needed) & Vue Reactivity
- **Language**: TypeScript
- **Icons**: Lucide Icons (Inline SVGs)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.

### Installation

```sh
bun install
```

### Development

```sh
bun dev
```

### Build

```sh
bun run build
```

### Linting

```sh
bun lint
```

## 📝 License

MIT
