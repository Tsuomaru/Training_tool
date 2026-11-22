
import BandPanel from './BandPanel'
import LabelPanel from './LabelPanel'
import MapComponent from './MapComponent'
import { useEffect, useRef, useState } from 'react'

function defaultBandSelection(bandCount) {
  const count = Number(bandCount) || 1
  return { r: Math.min(3, count), g: Math.min(2, count), b: 1 }
}

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
  const [bandSelection, setBandSelection] = useState(defaultBandSelection(1))
  const [labelClasses, setLabelClasses] = useState([])

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
      setImageData({ ...data, file: file }) // append reference to the file itself (should maybe add a url if it's being stored on the backend)
      setBandSelection(defaultBandSelection(data.bands))

      
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

  function toggleHue() {
    setHueInverted(current => !current)
  }

  function toggleEdgeDetection() {
    setEdgeDetected(current => !current)
  }

  // channel is 'r', 'g' or 'b'; bandNumber is 1-based
  function changeBand(channel, bandNumber) {
    setBandSelection(current => ({ ...current, [channel]: bandNumber }))
  }

  return (
    <div className="training-workspace">
      <header className="workspace-header">
        <h2>
          {project.name}
          {isVerificationPage ? ' — Verification' : isAnalysisPage ? ' — Analysis' : ''}
        </h2>

        {isVerificationPage ? (
          <button onClick={onBackToTraining}>
            Back to Main Project
          </button>
        ) : isAnalysisPage ? (
          <button onClick={onBackToVerification}>
            Back to Verification
          </button>
        ) : (
          <button onClick={onBack}>
            Back to Organizer
          </button>
        )}
      </header>

      {!isAnalysisPage && (
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

          {isVerificationPage ? (
            <button
              className={hueInverted ? 'tool-active' : ''}
              onClick={() => setHueInverted(current => !current)}
              disabled={!imageData}
              aria-pressed={hueInverted}
              title="Rotate the image hue by 180 degrees"
            >
              Color
            </button>
          ) : (
            <button
              className={activeTool === 'Point' ? 'tool-active' : ''}
              onClick={() => setActiveTool(current => current === 'Point' ? null : 'Point')}
              disabled={!imageData}
              aria-pressed={activeTool === 'Point'}
            >
              Point
            </button>
          )}

          {isVerificationPage ? (
            <button
              className={edgeDetected ? 'tool-active' : ''}
              onClick={() => setEdgeDetected(current => !current)}
              disabled={!imageData}
              aria-pressed={edgeDetected}
              title="Toggle Sobel edge detection on the image"
            >
              Edge
            </button>
          ) : (
            <button
              className={activeTool === 'Line' ? 'tool-active' : ''}
              onClick={() => setActiveTool(current => current === 'Line' ? null : 'Line')}
              disabled={!imageData}
              aria-pressed={activeTool === 'Line'}
            >
              Line
            </button>
          )}

          <button
            className={activeTool === 'Polygon' ? 'tool-active' : ''}
            onClick={() => setActiveTool(current => current === 'Polygon' ? null : 'Polygon')}
            disabled={!imageData}
            aria-pressed={activeTool === 'Polygon'}
          >
            Polygon
          </button>

          <button onClick={() => mapRef.current?.undo()} disabled={!imageData}>
            Undo
          </button>

          <button onClick={() => mapRef.current?.redo()} disabled={!imageData}>
            Redo
          </button>

          {isVerificationPage ? (
            <>
              <button onClick={onOpenAnalysis}>
                Analysis
              </button>
              <button onClick={onBackToTraining}>
                Return to Main Project
              </button>
            </>
          ) : (
            <button onClick={onOpenVerification}>
              Verification Tool
            </button>
          )}
        </div>
      )}

      {isAnalysisPage ? (
        <main className="analysis-page">
          <h2>Project Analysis</h2>
          <p className="analysis-intro">
            Review prediction metrics and performance for each label class.
          </p>

          <div className="analysis-grid">
            <section className="analysis-card analysis-card-wide">
              <h3>Overall performance</h3>
              <div className="metric-grid">
                <div className="metric-tile"><span>Overall accuracy</span><strong>NA</strong></div>
                <div className="metric-tile"><span>Correct predictions</span><strong>NA</strong></div>
                <div className="metric-tile"><span>Incorrect predictions</span><strong>NA</strong></div>
                <div className="metric-tile"><span>Macro F1 score</span><strong>NA</strong></div>
              </div>
            </section>

            <section className="analysis-card analysis-card-wide">
              <div className="analysis-card-heading">
                <div>
                  <h3>Class performance</h3>
                  <p>Precision, recall, and F1 score for each label class.</p>
                </div>
                <span className="analysis-count">{labelClasses.length} {labelClasses.length === 1 ? 'class' : 'classes'}</span>
              </div>
              <div className="analysis-table-wrap">
                <table className="analysis-table">
                  <thead><tr><th scope="col">Class</th><th scope="col">Precision</th><th scope="col">Recall</th><th scope="col">F1 score</th></tr></thead>
                  <tbody>
                    {labelClasses.length ? labelClasses.map(labelClass => (
                      <tr key={labelClass.id}><th scope="row">{labelClass.name}</th><td>NA</td><td>NA</td><td>NA</td></tr>
                    )) : <tr><td className="analysis-empty-row" colSpan="4">Add label classes in the project or verification page to see them here.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="analysis-card analysis-card-wide">
              <div className="analysis-card-heading">
                <div>
                  <h3>Confusion matrix</h3>
                  <p>Rows show actual classes; columns show predicted classes.</p>
                </div>
              </div>
              {labelClasses.length ? (
                <div className="confusion-matrix-wrap">
                  <table className="confusion-matrix">
                    <thead><tr><th className="matrix-corner" scope="col">Actual / Predicted</th>{labelClasses.map(labelClass => <th key={labelClass.id} scope="col">{labelClass.name}</th>)}</tr></thead>
                    <tbody>{labelClasses.map(actualClass => (
                      <tr key={actualClass.id}>
                        <th scope="row">{actualClass.name}</th>
                        {labelClasses.map(predictedClass => <td key={predictedClass.id} aria-label={`${actualClass.name} predicted as ${predictedClass.name}`}>—</td>)}
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="analysis-empty-note">Add label classes to create the confusion matrix axes.</p>}
            </section>
          </div>
        </main>
      ) : (
        <>
          <div className="workspace-content">
            <aside className="workspace-left">
              <LabelPanel classes={labelClasses} setClasses={setLabelClasses} />

              <section className="image-info">
                <h3>Image Information</h3>

                {imageData ? (
                  <dl className="image-info-list">
                    <div className="image-info-file">
                      <dt>File</dt>
                      <dd title={imageData.filename}>{imageData.filename}</dd>
                    </div>

                    <div>
                      <dt>Dimensions</dt>
                      <dd>{imageData.width} × {imageData.height} px</dd>
                    </div>

                    <div>
                      <dt>Bands</dt>
                      <dd>{imageData.bands}</dd>
                    </div>

                    <div>
                      <dt>Data type</dt>
                      <dd>{imageData.data_type?.join(', ') || '—'}</dd>
                    </div>

                    <div>
                      <dt>Resolution</dt>
                      <dd>{imageData.resolution?.join(' × ') || '—'}</dd>
                    </div>

                    <div>
                      <dt>CRS</dt>
                      <dd title={imageData.crs}>{imageData.crs || '—'}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="image-info-empty">No image loaded</p>
                )}
              </section>

              <BandPanel
                imageData={imageData}
                bandSelection={bandSelection}
                onBandChange={changeBand}
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
                  bandSelection={bandSelection}
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
            <span>Zoom: OpenLayers</span>

            <span>
              {isVerificationPage && edgeDetected
                ? 'Display: Edge detection'
                : activeTool
                  ? `Tool: ${activeTool}`
                  : 'Tool: Navigate'}
            </span>

            <span>
              {isVerificationPage && hueInverted && Number(imageData?.bands) < 3
                ? 'Grayscale image: tonal inversion (no hue channel)'
                : (imageData?.crs || 'No projection')}
            </span>
          </footer>
        </>
      )}
    </div>
  )
}

export default TrainingWorkspace
