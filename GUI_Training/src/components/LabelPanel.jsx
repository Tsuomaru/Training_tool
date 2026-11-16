
import { useState } from 'react'

function LabelPanel() {
  const [classes, setClasses] = useState([])
  const [newClassName, setNewClassName] = useState('')
  const [newSubclassName, setNewSubclassName] = useState('')

  function addClass() {
    if (!newClassName.trim()) return

    const newClass = {
      id: crypto.randomUUID(),
      name: newClassName.trim(),
      visible: true,
      expanded: true,
      subclasses: []
    }

    setClasses([...classes, newClass])
    setNewClassName('')
  }

  function addSubclass(classId) {
    if (!newSubclassName.trim()) return

    const subclass = {
      id: crypto.randomUUID(),
      name: newSubclassName.trim(),
      visible: true
    }

    setClasses(classes.map(labelClass =>
      labelClass.id === classId
        ? {
            ...labelClass,
            subclasses: [...labelClass.subclasses, subclass]
          }
        : labelClass
    ))

    setNewSubclassName('')
  }

  function toggleVisibility(classId, subclassId = null) {
    setClasses(classes.map(labelClass => {
      if (labelClass.id !== classId) return labelClass

      if (subclassId === null) {
        return { ...labelClass, visible: !labelClass.visible }
      }

      return {
        ...labelClass,
        subclasses: labelClass.subclasses.map(subclass =>
          subclass.id === subclassId
            ? { ...subclass, visible: !subclass.visible }
            : subclass
        )
      }
    }))
  }

  function toggleExpanded(classId) {
    setClasses(classes.map(labelClass =>
      labelClass.id === classId
        ? { ...labelClass, expanded: !labelClass.expanded }
        : labelClass
    ))
  }

  return (
    <div className="label-panel">
      <h3>Label Classes</h3>

      <input
        placeholder="Class name"
        value={newClassName}
        onChange={e => setNewClassName(e.target.value)}
      />
      <button onClick={addClass}>Add Class</button>

      {classes.map(labelClass => (
        <div key={labelClass.id}>

          <div>
            <button onClick={() => toggleExpanded(labelClass.id)}>
              {labelClass.expanded ? '▼' : '▶'}
            </button>

            <strong>{labelClass.name}</strong>

           <input
                type="checkbox"
                checked={labelClass.visible}
                onChange={() => toggleVisibility(labelClass.id)}
/>
          </div>

          {labelClass.expanded && (
            <div style={{ paddingLeft: '20px' }}>

            {labelClass.subclasses.map(subclass => (
                <div key={subclass.id}>
                <span>{subclass.name}</span>

                <input
                type="checkbox"
                checked={subclass.visible}
                onChange={() =>
                    toggleVisibility(labelClass.id, subclass.id)
                }
                />
            </div>
            ))}

              <input
                placeholder="Subclass name"
                value={newSubclassName}
                onChange={e => setNewSubclassName(e.target.value)}
              />
                <button onClick={() => addSubclass(labelClass.id)}>
                    Add Subclass
                    </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default LabelPanel
