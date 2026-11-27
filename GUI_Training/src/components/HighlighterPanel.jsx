import { useRef, useState } from 'react'

export const DEFAULT_HIGHLIGHT_SIZE = 20
export const MIN_HIGHLIGHT_SIZE = 4
export const MAX_HIGHLIGHT_SIZE = 80

export const DEFAULT_HIGHLIGHT_LAYERS = [
  { id: 'highlight-1', name: 'Highlight 1', color: '#ffeb3b', visible: true },
  { id: 'highlight-2', name: 'Highlight 2', color: '#ff4081', visible: true },
  { id: 'highlight-3', name: 'Highlight 3', color: '#40c4ff', visible: true }
]

// Overlay pinned to the upper-right of the map while the Highlighter tool is active.
function HighlighterPanel({
  layers,
  activeId,
  size,
  onSelectLayer,
  onChangeLayer,
  onChangeSize
}) {
  const [collapsed, setCollapsed] = useState(false)
  const colorInputs = useRef({})

  return (
    <div
      className="highlighter-panel"
      // keep map interactions from firing underneath the panel
      onPointerDown={event => event.stopPropagation()}
      onWheel={event => event.stopPropagation()}
    >
      <button
        type="button"
        className="highlighter-panel-header"
        onClick={() => setCollapsed(current => !current)}
        aria-expanded={!collapsed}
      >
        <span>Highlighter</span>
        <span aria-hidden="true">{collapsed ? '▸' : '▾'}</span>
      </button>

      {!collapsed && (
        <div className="highlighter-panel-body">
          <ul className="highlighter-layer-list">
            {layers.map(layer => (
              <li
                key={layer.id}
                className={`highlighter-layer${layer.id === activeId ? ' is-active' : ''}`}
              >
                <label className="highlighter-layer-name">
                  <input
                    type="radio"
                    name="active-highlight-layer"
                    checked={layer.id === activeId}
                    onChange={() => {
                      onSelectLayer(layer.id)
                      // drawing on a hidden layer would be invisible, so reveal it
                      if (!layer.visible) onChangeLayer(layer.id, { visible: true })
                    }}
                  />
                  <span
                    className="highlighter-swatch"
                    style={{ backgroundColor: layer.color }}
                    aria-hidden="true"
                  />
                  {layer.name}
                </label>

                <div className="highlighter-layer-actions">
                  <button
                    type="button"
                    onClick={() => onChangeLayer(layer.id, { visible: !layer.visible })}
                    aria-pressed={!layer.visible}
                    title={layer.visible ? 'Hide this layer' : 'Show this layer'}
                  >
                    {layer.visible ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => colorInputs.current[layer.id]?.click()}
                    title="Change this layer's color"
                  >
                    Color
                  </button>
                  <input
                    ref={element => { colorInputs.current[layer.id] = element }}
                    type="color"
                    value={layer.color}
                    onChange={event => onChangeLayer(layer.id, { color: event.target.value })}
                    className="highlighter-color-input"
                    aria-label={`${layer.name} color`}
                    tabIndex={-1}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="highlighter-size">
            <label htmlFor="highlighter-size-input">
              Stroke size <strong>{size}px</strong>
            </label>
            <input
              id="highlighter-size-input"
              type="range"
              min={MIN_HIGHLIGHT_SIZE}
              max={MAX_HIGHLIGHT_SIZE}
              value={size}
              onChange={event => onChangeSize(Number(event.target.value))}
            />
            {/* <p className="highlighter-hint">Applies to strokes you draw next.</p> */}
          </div>
        </div>
      )}
    </div>
  )
}

export default HighlighterPanel
