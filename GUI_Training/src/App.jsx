
import { useState, useEffect } from 'react'
import TrainingWorkspace from './components/TrainingWorkspace'

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
        <TrainingWorkspace
          project={currentProject}
          onBack={() => setCurrentProject(null)}
        />
      )}
    </>
  )
}

export default App
