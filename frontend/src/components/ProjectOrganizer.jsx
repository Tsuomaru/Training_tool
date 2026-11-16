
import { useState } from 'react'

function ProjectOrganizer({ projects, onCreateProject, onOpenProject }) {
  const [showForm, setShowForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [search, setSearch] = useState('')

  function handleCreate() {
    if (projectName.trim() === '') {
      alert('Please enter a project name')
      return
    }

    onCreateProject(projectName.trim())
    setProjectName('')
    setShowForm(false)
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="organizer">
      <aside className="organizer-sidebar">
        <h2>Projects</h2>

        <button onClick={() => setShowForm(true)}>
          New Project
        </button>
        <button>Open Project</button>
        <button>Import Project</button>
      </aside>

      <main className="organizer-main">
        <h1>Project Organizer</h1>

        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        {showForm && (
          <div className="project-form">
            <h3>Create New Project</h3>

            <input
              type="text"
              placeholder="Project name"
              value={projectName}
              onChange={event => setProjectName(event.target.value)}
            />

            <button onClick={handleCreate}>Create</button>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        )}

        <div className="project-list-header">
        <strong>Projects</strong>
        <strong>Status</strong>
        </div>

        <div className="project-list">
          {filteredProjects.map(project => (
            
            <div
              className="project-item"
              key={project.id}
              onClick={() => onOpenProject(project)}
            >
              <strong>{project.name}</strong>
              <span>
                {project.status} {project.trainingAttempt}
              </span>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <p>No projects found.</p>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProjectOrganizer
