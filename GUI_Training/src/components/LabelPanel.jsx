import { useState } from 'react'

function LabelPanel() {
  const [classes, setClasses] = useState([])
  const [newClassName, setNewClassName] = useState('')
  const [newSubclassName, setNewSubclassName] = useState('')

  function addClass() {
    const name = newClassName.trim()
    if (!name) return

    setClasses(previous => [...previous, {
      id: crypto.randomUUID(),
      name,
      visible: true,
      expanded: true,
      subclasses: []
    }])
    setNewClassName('')
  }

  function addSubclass(classId) {
    const name = newSubclassName.trim()
    if (!name) return

    const subclass = { id: crypto.randomUUID(), name, visible: true }
    setClasses(previous => previous.map(labelClass =>
      labelClass.id === classId
        ? { ...labelClass, subclasses: [...labelClass.subclasses, subclass] }
        : labelClass
    ))
    setNewSubclassName('')
  }

  function toggleVisibility(classId, subclassId = null) {
    setClasses(previous => previous.map(labelClass => {
      if (labelClass.id !== classId) return labelClass
      if (subclassId === null) return { ...labelClass, visible: !labelClass.visible }
      return {
        ...labelClass,
        subclasses: labelClass.subclasses.map(subclass =>
          subclass.id === subclassId ? { ...subclass, visible: !subclass.visible } : subclass
        )
      }
    }))
  }

  function toggleExpanded(classId) {
    setClasses(previous => previous.map(labelClass =>
      labelClass.id === classId ? { ...labelClass, expanded: !labelClass.expanded } : labelClass
    ))
  }

  return (
    <section className="label-panel">
      <h3>Label Classes</h3>
      <form className="label-add-row" onSubmit={event => { event.preventDefault(); addClass() }}>
        <input
          aria-label="Class name"
          placeholder="New class name"
          value={newClassName}
          onChange={event => setNewClassName(event.target.value)}
        />
        <button type="submit" className="label-add-button">Add</button>
      </form>

      {classes.length === 0 ? (
        <p className="label-empty">No classes yet</p>
      ) : (
        <ul className="label-class-list">
          {classes.map(labelClass => (
            <li className="label-class" key={labelClass.id}>
              <div className="label-class-heading">
                <button
                  type="button"
                  className="label-expand-button"
                  onClick={() => toggleExpanded(labelClass.id)}
                  aria-label={`${labelClass.expanded ? 'Collapse' : 'Expand'} ${labelClass.name}`}
                  aria-expanded={labelClass.expanded}
                >{labelClass.expanded ? '▾' : '▸'}</button>
                <strong title={labelClass.name}>{labelClass.name}</strong>
                <input
                  className="label-visibility"
                  type="checkbox"
                  checked={labelClass.visible}
                  onChange={() => toggleVisibility(labelClass.id)}
                  aria-label={`Show ${labelClass.name}`}
                />
              </div>

              {labelClass.expanded && (
                <div className="label-subclasses">
                  {labelClass.subclasses.map(subclass => (
                    <div className="label-subclass" key={subclass.id}>
                      <span title={subclass.name}>{subclass.name}</span>
                      <input
                        className="label-visibility"
                        type="checkbox"
                        checked={subclass.visible}
                        onChange={() => toggleVisibility(labelClass.id, subclass.id)}
                        aria-label={`Show ${subclass.name}`}
                      />
                    </div>
                  ))}
                  <form className="label-subclass-add" onSubmit={event => { event.preventDefault(); addSubclass(labelClass.id) }}>
                    <input
                      aria-label={`Subclass name for ${labelClass.name}`}
                      placeholder="New subclass"
                      value={newSubclassName}
                      onChange={event => setNewSubclassName(event.target.value)}
                    />
                    <button type="submit">Add</button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default LabelPanel
