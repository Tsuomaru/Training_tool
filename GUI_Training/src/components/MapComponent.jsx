import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import ImageLayer from 'ol/layer/Image.js'
import ImageStatic from 'ol/source/ImageStatic.js'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import Stroke from 'ol/style/Stroke.js'
import Style from 'ol/style/Style.js'
import Draw from 'ol/interaction/Draw.js'
import { get as getProjection } from 'ol/proj.js'
import Projection from 'ol/proj/Projection.js'
import 'ol/ol.css'
import TileLayer from 'ol/layer/Tile'
// import TileLayer from 'ol/layer/WebGLTile.js'
import GeoTIFF from 'ol/source/GeoTIFF.js'

function createHighlightStyle(color = 'yellow', opacity = 0.5, width = 20) {
  return new Style({
    stroke: new Stroke({
      color: color,
      width: width,
      lineCap: 'round',
      lineJoin: 'round'
    })
  })
}

const MapComponent = forwardRef(function MapComponent(
  { imageData, hueInverted = false, edgeDetected = false, activeTool = null,
    bandSelection = {r:1,g:2,b:3} },
  ref
) {
  const mapElement = useRef(null)
  const mapInstance = useRef(null)
  const vectorSource = useRef(null)
  const rasterLayerRef = useRef(null)
  const rasterExtentRef = useRef(null)
  const rasterProjectionRef = useRef(null)
  const drawInteraction = useRef(null)
  const undoStack = useRef([])
  const redoStack = useRef([])
  const [mapReady, setMapReady] = useState(false)

  useImperativeHandle(ref, () => ({
    undo() {
      const feature = undoStack.current.pop()
      if (!feature || !vectorSource.current) return
      vectorSource.current.removeFeature(feature)
      redoStack.current.push(feature)
    },
    redo() {
      const feature = redoStack.current.pop()
      if (!feature || !vectorSource.current) return
      vectorSource.current.addFeature(feature)
      undoStack.current.push(feature)
    },
    getZoom() {
      return mapInstance.current?.getView().getZoom() ?? null
    }
  }), [])

  useEffect(() => {
    if (!imageData?.preview || !mapElement.current) return undefined

    const width = Number(imageData.width) || 1
    const height = Number(imageData.height) || 1
    const projectionFromMetadata = imageData.crs
      ? getProjection(imageData.crs)
      : null

    // Use the GeoTIFF's real coordinate system when OpenLayers knows it.
    // Otherwise, use image-pixel coordinates so the raster is still viewable.
    const projection = projectionFromMetadata || new Projection({
      code: 'IMAGE_PIXELS',
      units: 'pixels',
      extent: [0, 0, width, height]
    })
    const extent = projectionFromMetadata && imageData.bounds?.length === 4
      ? imageData.bounds.map(Number)
      : [0, 0, width, height]

    const rasterSource = new ImageStatic({
      url: imageData.preview,
      imageExtent: extent,
      imageSize: [
        Number(imageData.preview_width) || Math.min(width, 1200),
        Number(imageData.preview_height) || Math.min(height, 1200)
      ],
      projection,
      interpolate: true
    })

    const rasterLayer = new ImageLayer({
      source: rasterSource,
      className: 'raster-layer'
    })
    rasterLayerRef.current = rasterLayer
    rasterExtentRef.current = extent
    rasterProjectionRef.current = projection

    // Using GeoTIFF + TileLayer to allow band manupulation
    // const source = new GeoTIFF({
    //   source: [{ url: imageData.url }],
    //   convertToRGB: 'auto',
    //   transition: 0
    // })
    // const rasterLayer = new TileLayer({ source })

    const annotations = new VectorSource()
    const annotationLayer = new VectorLayer({ source: annotations })
    vectorSource.current = annotations
    undoStack.current = []
    redoStack.current = []

    const map = new Map({
      target: mapElement.current,
      layers: [rasterLayer, annotationLayer],
      view: new View({
        projection,
        center: [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2],
        extent,
        showFullExtent: true,
        zoom: 1,
        minZoom: -4,
        maxZoom: 24
      })
    })

    map.updateSize()
    const mapSize = map.getSize()
    if (mapSize) {
      map.getView().fit(extent, { size: mapSize, padding: [24, 24, 24, 24] })
    }
    mapInstance.current = map
    setMapReady(true)

    return () => {
      setMapReady(false)
      if (drawInteraction.current) {
        map.removeInteraction(drawInteraction.current)
        drawInteraction.current = null
      }
      map.setTarget(undefined)
      mapInstance.current = null
      vectorSource.current = null
      rasterLayerRef.current = null
      rasterExtentRef.current = null
      rasterProjectionRef.current = null
    }
  }, [imageData])

  useEffect(() => {
    const rasterLayer = rasterLayerRef.current
    const extent = rasterExtentRef.current
    const projection = rasterProjectionRef.current
    if (!rasterLayer || !extent || !projection || !imageData?.preview || !mapReady) return undefined

    let cancelled = false

    // Restore the original preview whenever edge detection is switched off.
    if (!edgeDetected) {
      rasterLayer.setSource(new ImageStatic({
        url: imageData.preview,
        imageExtent: extent,
        imageSize: [
          Number(imageData.preview_width) || Math.min(Number(imageData.width) || 1, 1200),
          Number(imageData.preview_height) || Math.min(Number(imageData.height) || 1, 1200)
        ],
        projection,
        interpolate: true
      }))
      return undefined
    }

    // Sobel edge detection runs on a browser canvas and only changes the preview.
    const image = new Image()
    image.onload = () => {
      if (cancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context.drawImage(image, 0, 0)
      const source = context.getImageData(0, 0, canvas.width, canvas.height)
      const input = source.data
      const output = context.createImageData(canvas.width, canvas.height)
      const gray = new Float32Array(canvas.width * canvas.height)

      for (let i = 0, pixel = 0; i < input.length; i += 4, pixel++) {
        gray[pixel] = 0.299 * input[i] + 0.587 * input[i + 1] + 0.114 * input[i + 2]
      }

      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const topLeft = (y - 1) * canvas.width + x - 1
          const top = topLeft + 1
          const topRight = topLeft + 2
          const left = y * canvas.width + x - 1
          const right = left + 2
          const bottomLeft = (y + 1) * canvas.width + x - 1
          const bottom = bottomLeft + 1
          const bottomRight = bottomLeft + 2

          const gx = -gray[topLeft] + gray[topRight] - 2 * gray[left] + 2 * gray[right] - gray[bottomLeft] + gray[bottomRight]
          const gy = -gray[topLeft] - 2 * gray[top] - gray[topRight] + gray[bottomLeft] + 2 * gray[bottom] + gray[bottomRight]
          const magnitude = Math.min(255, Math.hypot(gx, gy))
          const outputIndex = (y * canvas.width + x) * 4
          output.data[outputIndex] = magnitude
          output.data[outputIndex + 1] = magnitude
          output.data[outputIndex + 2] = magnitude
          output.data[outputIndex + 3] = 255
        }
      }

      if (cancelled) return
      context.putImageData(output, 0, 0)
      rasterLayer.setSource(new ImageStatic({
        url: canvas.toDataURL('image/png'),
        imageExtent: extent,
        imageSize: [canvas.width, canvas.height],
        projection,
        interpolate: true
      }))
    }
    image.onerror = () => console.error('Could not load the image preview for edge detection.')
    image.src = imageData.preview

    return () => {
      cancelled = true
      image.onload = null
      image.onerror = null
    }
  }, [edgeDetected, imageData, mapReady])

  // create the highlighter layer
  const highlightSource = useRef(new VectorSource()).current
    const highlightLayer = useRef(
      new VectorLayer({
        source: highlightSource,
        style: createHighlightStyle(),
        opacity: 0.5
      })
    ).current

  useEffect(() => {
    const map = mapInstance.current
    if (!map || !mapReady) return
    map.addLayer(highlightLayer)
    return () => map.removeLayer(highlightLayer)
  }, [mapReady])

  useEffect(() => {
    const map = mapInstance.current
    if (!map || !mapReady) return undefined

    if (drawInteraction.current) {
      map.removeInteraction(drawInteraction.current)
      drawInteraction.current = null
    }

    const drawType = {
      Point: 'Point',
      Line: 'LineString',
      Polygon: 'Polygon',
      Highlighter: 'Highlighter'
    }[activeTool]

    if (!drawType || !vectorSource.current) return undefined

    // use highlighter if highlighter, otherwise do normal new draw routine
    const draw = 
      drawType === 'Highlighter'
        ? new Draw({
            source: highlightSource,
            type: 'LineString',
            freehand: true,
            style: createHighlightStyle(),
            stopClick: true,
          })
        : new Draw({ source: vectorSource.current, type: drawType })
    
    if (drawType === 'Highlighter') {
      draw.getOverlay().setOpacity(0.5)
    }

    draw.on('drawend', event => {
      undoStack.current.push(event.feature)
      redoStack.current = []
    })

    map.addInteraction(draw)
    drawInteraction.current = draw

    return () => {
      map.removeInteraction(draw)
      if (drawInteraction.current === draw) drawInteraction.current = null
    }
  }, [activeTool, mapReady])

  return (
    <div
      ref={mapElement}
      className={`openlayers-map${hueInverted && Number(imageData?.bands) >= 3 ? ' hue-inverted' : ''}${hueInverted && Number(imageData?.bands) < 3 ? ' tone-inverted' : ''}`}
      aria-label="GeoTIFF map viewport"
    />
  )
})

export default MapComponent
