import { useState } from 'react'

function BandPanel({imageData}) {
  // const [redBand, setRedBand] = useState([])
  // const [greenBand, setRedBand] = useState([])
  // const [blueBand, setRedBand] = useState([])
  // const [redStrength, setRedStrength] = useState([])
  // const [greenStrength, setRedStrength] = useState([])
  // const [blueStrength, setRedStrength] = useState([])

  const [bands, setBands] = useState([])
  const [bandStrengths, setBandStrengths] = useState([])

    
  return (
    <div className="band-panel">
      <h3>Bands</h3>
        <div>
          <b>R:</b>
          <select 
            defaultValue={imageData?.band_names[0]?.value}
            onChange={e => {
              setBands(prevBands => {
                const newBands = [...prevBands]
                newBands[0] = e.target.value
                return newBands
              })
              console.log(bands[0])
            }}
          >
            {imageData?.band_names.map((band_name, index) => (
              <option key={index} value={band_name}>
                  {band_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <b>G:</b>
          <select
            defaultValue={imageData?.band_names[1]?.value}
          >
            {imageData?.band_names.map((band_name, index) => (
              <option key={index} value={band_name}>
                  {band_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <b>B:</b>
          <select 
            defaultValue={imageData?.band_names[2]?.value}
          >
            {imageData?.band_names.map((band_name, index) => (
              <option key={index} value={band_name}>
                  {band_name}
              </option>
            ))}
          </select>
        </div>
    </div>
  )
}

export default BandPanel
