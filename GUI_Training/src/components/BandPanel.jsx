// import { useState } from 'react'

// function BandPanel({imageData}) {
//   // const [redBand, setRedBand] = useState([])
//   // const [greenBand, setRedBand] = useState([])
//   // const [blueBand, setRedBand] = useState([])
//   // const [redStrength, setRedStrength] = useState([])
//   // const [greenStrength, setRedStrength] = useState([])
//   // const [blueStrength, setRedStrength] = useState([])

//   const [bands, setBands] = useState([])
//   const [bandStrengths, setBandStrengths] = useState([])

    
//   return (
//     <div className="band-panel">
//       <h3>Bands</h3>
//         <div>
//           <b>R:</b>
//           <select 
//             defaultValue={imageData?.band_names[0]?.value}
//             onChange={e => {
//               setBands(prevBands => {
//                 const newBands = [...prevBands]
//                 newBands[0] = e.target.value
//                 return newBands
//               })
//               console.log(bands[0])
//             }}
//           >
//             {imageData?.band_names.map((band_name, index) => (
//               <option key={index} value={band_name}>
//                   {band_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <b>G:</b>
//           <select
//             defaultValue={imageData?.band_names[1]?.value}
//           >
//             {imageData?.band_names.map((band_name, index) => (
//               <option key={index} value={band_name}>
//                   {band_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <b>B:</b>
//           <select 
//             defaultValue={imageData?.band_names[2]?.value}
//           >
//             {imageData?.band_names.map((band_name, index) => (
//               <option key={index} value={band_name}>
//                   {band_name}
//               </option>
//             ))}
//           </select>
//         </div>
//     </div>
//   )
// }

// export default BandPanel

// The three display channels. `key` matches the keys of bandSelection.
const CHANNELS = [
  { key: 'r', label: 'R' },
  { key: 'g', label: 'G' },
  { key: 'b', label: 'B' }
]

// bandSelection holds 1-based band numbers, e.g. { r: 1, g: 2, b: 3 }.
// The selection lives in TrainingWorkspace so the map can use it too.
function BandPanel({ imageData, bandSelection, onBandChange, bandStrengths, onStrengthChange }) {
  return (
    <div className="band-panel">
      <h3>Bands</h3>
      {CHANNELS.map(channel => (
        <div key={channel.key}>
          <b>{channel.label}:</b>
          <select
            value={bandSelection[channel.key]}
            disabled={!imageData}
            onChange={e => onBandChange(channel.key, Number(e.target.value))}
          >
            {imageData?.band_names.map((band_name, index) => (
              <option key={index} value={index + 1}>
                {band_name}
              </option>
            ))}
          </select>
          <div class="slidecontainer">
            <input 
              type="range" 
              min="1" max="200" 
              value={bandStrengths[channel.key]} 
              class="slider"
              onChange={e => onStrengthChange(channel.key, Number(e.target.value))}>
            </input>
          </div>
        </div>
      ))}
    </div>
  )
}

export default BandPanel
