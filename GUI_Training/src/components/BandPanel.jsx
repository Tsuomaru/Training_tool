import { useState } from 'react'

function BandPanel() {
    // const [redBand, setRedBand] = useState([])
    // const [greenBand, setRedBand] = useState([])
    // const [blueBand, setRedBand] = useState([])
    // const [redStrength, setRedStrength] = useState([])
    // const [greenStrength, setRedStrength] = useState([])
    // const [blueStrength, setRedStrength] = useState([])

    const [bands, setBands] = useState({})
    const [bandStrengths, setBandStrengths] = useState({})

    
    return (
    <div className="band-panel">
      <h3>Bands</h3>

      <b>R:</b>
      <select>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
      <b>G:</b>
      <select>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
      <b>B:</b>
      <select>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
    </div>
  )
}

export default BandPanel
