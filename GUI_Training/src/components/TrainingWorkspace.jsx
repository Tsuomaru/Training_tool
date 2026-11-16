
import LabelPanel from './LabelPanel'
import { useState } from 'react'

function TrainingWorkspace({ project, onBack }) {
    
    const [imageData, setImageData] = useState(null)
    const [uploading, setUploading] = useState(false)

    async function handleImageUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)

    try {
        const response = await fetch('/api/upload-tiff', {
        method: 'POST',
        body: formData
        })

        const data = await response.json()

        if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
        }

        setImageData(data)
    } catch (error) {
        alert(error.message)
    } finally {
        setUploading(false)
        event.target.value = ''
    }
    }

    return (
    <div className="training-workspace">

      <header className="workspace-header">
        <h2>{project.name}</h2>
        <button onClick={onBack}>Back to Organizer</button>
      </header>

      <div className="workspace-toolbar">
        <label className="import-button">
            Import TIFF
            <input
                type="file"
                accept=".tif,.tiff"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />
            </label>
        <button>Point</button>
        <button>Line</button>
        <button>Polygon</button>
        <button>Undo</button>
        <button>Redo</button>
      </div>

      <div className="workspace-content">

        <aside className="workspace-left">
          <LabelPanel />

          <h3>Image Information</h3>
            {imageData ? (
            <div>
                <p>File: {imageData.filename}</p>
                <p>Width: {imageData.width} px</p>
                <p>Height: {imageData.height} px</p>
                <p>Bands: {imageData.bands.join(', ')}</p>
            </div>
            ) : (
            <p>No image loaded</p>
            )}
        </aside>

      <main className="workspace-viewer">
        {uploading ? (
            <p>Loading TIFF image...</p>
        ) : imageData ? (
            <img
            src={imageData.preview}
            alt={imageData.filename}
            className="raster-preview"
            />
        ) : (
            <p>No TIFF image imported</p>
        )}
        </main>

        <aside className="workspace-right">
          <h3>Selected Point</h3>
          <p>X: —</p>
          <p>Y: —</p>

          <h3>Labeled Points</h3>
          <p>No labels created</p>
        </aside>

      </div>

      <footer className="workspace-status">
        <span>Zoom: 100%</span>
        <span>Pixel: —</span>
        <span>Scale: —</span>
      </footer>

    </div>
  )
}

export default TrainingWorkspace
