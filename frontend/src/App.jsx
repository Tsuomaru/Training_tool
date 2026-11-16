
import { useState, useEffect } from 'react'

import ProjectOrganizer from './components/ProjectOrganizer'
import './App.css'

function App() {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch('/api/projects')

        if (!response.ok) {
          throw new Error('Failed to load projects')
        }

        const savedProjects = await response.json()
        setProjects(savedProjects)

      } catch (error) {
        console.error(error)
      }
    }

    loadProjects()
  }, [])

  async function createProject(name) {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const newProject = await response.json()

      setProjects(previous => [...previous, newProject])
      setCurrentProject(newProject)

    } catch (error) {
      console.error(error)
      alert('Could not save project')
    }
  }

  return (
    <>
      {currentProject === null ? (
        <ProjectOrganizer
          projects={projects}
          onCreateProject={createProject}
          onOpenProject={setCurrentProject}
        />
      ) : (
        <div className="container">
          <h2>Project: {currentProject.name}</h2>

          <button onClick={() => setCurrentProject(null)}>
            Back to Organizer
          </button>

          <h3>Image Viewer</h3>
          <div className="image-viewer">
            No image imported
          </div>

          <h3>Labels</h3>
          <button>Add Label</button>
        </div>
      )}
    </>
  )
}

export default App
