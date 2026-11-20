import BandPanel from './BandPanel'
import LabelPanel from './LabelPanel'
import MapComponent from './MapComponent'
import { useEffect, useRef, useState } from 'react'

function TrainingWorkspace({
  project,
  page = 'training',
  onBack,
  onOpenVerification,
  onOpenAnalysis,
  onBackToVerification,
  onBackToTraining
}) {
  const [imageData, setImageData] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [activeTool, setActiveTool] = useState(null)
  const [hueInverted, setHueInverted] = useState(false)
  const [edgeDetected, setEdgeDetected] = useState(false)
  const mapRef = useRef(null)
  const isAnalysisPage = page === 'analysis'
  const isVerificationPage = page === 'verification'

  useEffect(() => {
    // Do not carry an active drawing interaction between screens.
    setActiveTool(null)
  }, [page])

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
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      setImageData(data)
      setHueInverted(false)
      setEdgeDetected(false)
      setActiveTool(null)
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
        <h2>{project.name}{isVerificationPage ? ' — Verification' : isAnalysisPage ? ' — Analysis' : ''}</h2>
        {isVerificationPage ? (
          <button onClick={onBackToTraining}>Back to Main Project</button>
        ) : isAnalysisPage ? (
          <button onClick={onBackToVerification}>Back to Verification</button>
        ) : (
          <button onClick={onBack}>Back to Organizer</button>
        )}
      </header>

      {!isAnalysisPage && <div className="workspace-toolbar">
        <label className="import-button">
          Import TIFF
          <input
            type="file"
            accept=".tif,.tiff"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </label>
        {isVerificationPage ? (
          <button
            className={hueInverted ? 'tool-active' : ''}
            onClick={() => setHueInverted(current => !current)}
            disabled={!imageData}
            aria-pressed={hueInverted}
            title="Rotate the image hue by 180 degrees"
          >Color</button>
        ) : (
          <button
            className={activeTool === 'Point' ? 'tool-active' : ''}
            onClick={() => setActiveTool(current => current === 'Point' ? null : 'Point')}
            disabled={!imageData}
            aria-pressed={activeTool === 'Point'}
          >Point</button>
        )}
        {isVerificationPage ? (
          <button
            className={edgeDetected ? 'tool-active' : ''}
            onClick={() => setEdgeDetected(current => !current)}
            disabled={!imageData}
            aria-pressed={edgeDetected}
            title="Toggle Sobel edge detection on the image"
          >Edge</button>
        ) : (
          <button
            className={activeTool === 'Line' ? 'tool-active' : ''}
            onClick={() => setActiveTool(current => current === 'Line' ? null : 'Line')}
            disabled={!imageData}
            aria-pressed={activeTool === 'Line'}
          >Line</button>
        )}
        <button
          className={activeTool === 'Polygon' ? 'tool-active' : ''}
          onClick={() => setActiveTool(current => current === 'Polygon' ? null : 'Polygon')}
          disabled={!imageData}
          aria-pressed={activeTool === 'Polygon'}
        >Polygon</button>
        <button onClick={() => mapRef.current?.undo()} disabled={!imageData}>Undo</button>
        <button onClick={() => mapRef.current?.redo()} disabled={!imageData}>Redo</button>
        {isVerificationPage ? (
          <>
            <button onClick={onOpenAnalysis}>Analysis</button>
            <button onClick={onBackToTraining}>Return to Main Project</button>
          </>
        ) : (
          <>
            <button onClick={onOpenVerification}>Verification Tool</button>
          </>
        )}
      </div>}

<<<<<<< Updated upstream
      <div className="workspace-content">
        <aside className="workspace-left">
          <LabelPanel />
          <h3>Image Information</h3>
          {imageData ? (
            <div>
              <p>File: {imageData.filename}</p>
              <p>Width: {imageData.width} px</p>
              <p>Height: {imageData.height} px</p>
              <p>Bands: {imageData.bands}</p>
              <p>Data Type: {imageData.data_type?.join(', ')}</p>
              <p>CRS: {imageData.crs}</p>
              <p>Resolution: {imageData.resolution?.join(' × ')}</p>
            </div>
          ) : (
            <p>No image loaded</p>
          )}
          <BandPanel
            imageData={imageData}
          />
        </aside>

        <main className="workspace-viewer">
          {uploading ? (
            <p>Loading TIFF image...</p>
          ) : imageData ? (
            <MapComponent
              ref={mapRef}
              imageData={imageData}
              hueInverted={isVerificationPage && hueInverted}
              edgeDetected={isVerificationPage && edgeDetected}
              activeTool={activeTool}
            />
          ) : (
            <p>No TIFF image imported</p>
          )}
=======
      {isAnalysisPage ? (
        <main className="analysis-page">
          <h2>Project Analysis</h2>
          <p className="analysis-intro">Review model performance and project metrics.</p>
          <div className="analysis-grid">
            <section className="analysis-card">
              <h3>Accuracy</h3>
              <p className="analysis-placeholder">Accuracy scores will appear here when results are available.</p>
            </section>
            <section className="analysis-card">
              <h3>Charts</h3>
              <p className="analysis-placeholder">Charts will appear here when analysis data is connected.</p>
            </section>
            <section className="analysis-card analysis-card-wide">
              <h3>Additional Metrics</h3>
              <p className="analysis-placeholder">Confusion matrix, precision, recall, and other metrics can be displayed here.</p>
            </section>
          </div>
>>>>>>> Stashed changes
        </main>
      ) : (
        <>
          <div className="workspace-content">
            <aside className="workspace-left">
              <LabelPanel />
              <section className="image-info">
                <h3>Image Information</h3>
                {imageData ? (
                  <dl className="image-info-list">
                    <div className="image-info-file"><dt>File</dt><dd title={imageData.filename}>{imageData.filename}</dd></div>
                    <div><dt>Dimensions</dt><dd>{imageData.width} × {imageData.height} px</dd></div>
                    <div><dt>Bands</dt><dd>{imageData.bands}</dd></div>
                    <div><dt>Data type</dt><dd>{imageData.data_type?.join(', ') || '—'}</dd></div>
                    <div><dt>Resolution</dt><dd>{imageData.resolution?.join(' × ') || '—'}</dd></div>
                    <div><dt>CRS</dt><dd title={imageData.crs}>{imageData.crs || '—'}</dd></div>
                  </dl>
                ) : <p className="image-info-empty">No image loaded</p>}
              </section>
              <BandPanel />
            </aside>

            <main className="workspace-viewer">
              {uploading ? (
                <p>Loading TIFF image...</p>
              ) : imageData ? (
                <MapComponent
                  ref={mapRef}
                  imageData={imageData}
                  hueInverted={isVerificationPage && hueInverted}
                  edgeDetected={isVerificationPage && edgeDetected}
                  activeTool={activeTool}
                />
              ) : <p>No TIFF image imported</p>}
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
            <span>Zoom: OpenLayers</span>
            <span>{isVerificationPage && edgeDetected ? 'Display: Edge detection' : (activeTool ? `Tool: ${activeTool}` : 'Tool: Navigate')}</span>
            <span>{isVerificationPage && hueInverted && Number(imageData?.bands) < 3
              ? 'Grayscale image: tonal inversion (no hue channel)'
              : (imageData?.crs || 'No projection')}</span>
          </footer>
        </>
      )}
    </div>
  )
}

export default TrainingWorkspace
