
import { useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:5050'

function App() {
  const [page, setPage] = useState('auth')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  const [signupData, setSignupData] = useState({
    f_name: '',
    l_name: '',
    username: '',
    password: '',
  })

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  })

  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedUser, setSelectedUser] = useState('')

  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    status: 'Planning',
    project_lead_id: '',
  })

  const notify = (text, isError = false) => {
    setMessage(text)
    setError(isError)
  }

  const request = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Request failed.')
    }

    return data
  }

  const loadUsers = async () => {
    try {
      const data = await request('/users')
      setUsers(data)
    } catch (err) {
      notify(err.message, true)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await request('/projects')
      setProjects(data)
    } catch (err) {
      notify(err.message, true)
    }
  }

  const loadMembers = async (projectId) => {
    if (!projectId) {
      setMembers([])
      return
    }

    try {
      const data = await request(`/projects/${projectId}/members`)
      setMembers(data)
    } catch (err) {
      notify(err.message, true)
    }
  }

  useEffect(() => {
    if (page !== 'auth') {
      loadUsers()
      loadProjects()
    }
  }, [page])

  useEffect(() => {
    if (page === 'members') {
      loadMembers(selectedProject)
    }
  }, [selectedProject, page])

  const handleSignup = async (e) => {
    e.preventDefault()

    try {
      const data = await request('/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })

      notify(data.message)
      setSignupData({
        f_name: '',
        l_name: '',
        username: '',
        password: '',
      })

      await loadUsers()
    } catch (err) {
      notify(err.message, true)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      await request('/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      })

      notify('Login successful.')
      setPage('projects')
    } catch (err) {
      notify(err.message, true)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()

    try {
      const data = await request('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      })

      notify(data.message)

      setProjectData({
        name: '',
        description: '',
        status: 'Planning',
        project_lead_id: '',
      })

      await loadProjects()
    } catch (err) {
      notify(err.message, true)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()

    if (!selectedProject || !selectedUser) {
      notify('Please select a project and user.', true)
      return
    }

    try {
      const data = await request(
        `/projects/${selectedProject}/members`,
        {
          method: 'POST',
          body: JSON.stringify({ user_id: selectedUser }),
        }
      )

      notify(data.message)
      setSelectedUser('')
      await loadMembers(selectedProject)
    } catch (err) {
      notify(err.message, true)
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      const data = await request(
        `/projects/${selectedProject}/members/${userId}`,
        { method: 'DELETE' }
      )

      notify(data.message)
      await loadMembers(selectedProject)
    } catch (err) {
      notify(err.message, true)
    }
  }

  const userName = (user) => {
    if (!user) return 'Unknown user'
    return `${user.f_name} ${user.l_name} (${user.username})`
  }

  const changePage = (nextPage) => {
    setPage(nextPage)
    setMessage('')
  }

  const currentProject = projects.find(
    (project) => project._id === selectedProject
  )

  if (page === 'auth') {
    return (
      <div className="container">
        <div className="form-box">
          <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

          <div className="toggle-buttons">
            <button
              className={isLogin ? 'active' : ''}
              onClick={() => {
                setIsLogin(true)
                setMessage('')
              }}
            >
              Login
            </button>
            <button
              className={!isLogin ? 'active' : ''}
              onClick={() => {
                setIsLogin(false)
                setMessage('')
              }}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin}>
              <input
                placeholder="Username"
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    username: e.target.value,
                  })
                }
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
                required
              />
              <button className="submit-button" type="submit">
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              {['f_name', 'l_name', 'username', 'password'].map(
                (field) => (
                  <input
                    key={field}
                    type={field === 'password' ? 'password' : 'text'}
                    placeholder={
                      {
                        f_name: 'First Name',
                        l_name: 'Last Name',
                        username: 'Username',
                        password: 'Password',
                      }[field]
                    }
                    value={signupData[field]}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        [field]: e.target.value,
                      })
                    }
                    required
                  />
                )
              )}
              <button className="submit-button" type="submit">
                Sign Up
              </button>
            </form>
          )}

          {message && (
            <p className={error ? 'message error' : 'message success'}>
              {message}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Project Management</h1>
          <p>ICSI 418Y - Programming Assignment 3</p>
        </div>

        <button
          className="logout-button"
          onClick={() => {
            setLoginData({ username: '', password: '' })
            changePage('auth')
          }}
        >
          Logout
        </button>
      </header>

      <nav className="navbar">
        <button
          className={page === 'projects' ? 'active' : ''}
          onClick={() => changePage('projects')}
        >
          View Projects
        </button>
        <button
          className={page === 'create' ? 'active' : ''}
          onClick={() => changePage('create')}
        >
          Create Project
        </button>
        <button
          className={page === 'members' ? 'active' : ''}
          onClick={() => changePage('members')}
        >
          Manage Members
        </button>
      </nav>

      <main className="dashboard-content">
        {message && (
          <p className={error ? 'message error' : 'message success'}>
            {message}
          </p>
        )}

        {page === 'create' && (
          <section className="panel">
            <h2>Create Project</h2>
            <p>Fill in the details to create a new project.</p>

            <form onSubmit={handleCreateProject}>
              <label>Project Name</label>
              <input
                value={projectData.name}
                onChange={(e) =>
                  setProjectData({
                    ...projectData,
                    name: e.target.value,
                  })
                }
                placeholder="Enter project name"
                required
              />

              <label>Description</label>
              <textarea
                value={projectData.description}
                onChange={(e) =>
                  setProjectData({
                    ...projectData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the project"
                required
              />

              <label>Status</label>
              <select
                value={projectData.status}
                onChange={(e) =>
                  setProjectData({
                    ...projectData,
                    status: e.target.value,
                  })
                }
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>

              <label>Project Lead</label>
              <select
                value={projectData.project_lead_id}
                onChange={(e) =>
                  setProjectData({
                    ...projectData,
                    project_lead_id: e.target.value,
                  })
                }
                required
              >
                <option value="">Select a registered user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {userName(user)}
                  </option>
                ))}
              </select>

              <button className="submit-button" type="submit">
                Create Project
              </button>
            </form>
          </section>
        )}

        {page === 'projects' && (
          <section>
            <div className="section-heading">
              <h2>All Projects</h2>
              <button onClick={loadProjects}>Refresh</button>
            </div>

            {projects.length === 0 ? (
              <div className="panel">
                <p>No projects yet. Create your first project!</p>
              </div>
            ) : (
              <div className="project-grid">
                {projects.map((project) => (
                  <div className="project-card" key={project._id}>
                    <div className="card-title-row">
                      <h3>{project.name}</h3>
                      <span className="status-badge">
                        {project.status}
                      </span>
                    </div>

                    <p>{project.description}</p>

                    <div className="project-lead">
                      <strong>Project Lead:</strong>
                      <p>{userName(project.project_lead_id)}</p>
                    </div>

                    <button
                      className="secondary-button"
                      onClick={() => {
                        setSelectedProject(project._id)
                        changePage('members')
                      }}
                    >
                      Manage Members
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {page === 'members' && (
          <section className="panel">
            <h2>Manage Project Members</h2>

            <label>Select Project</label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value)
                setSelectedUser('')
                setMembers([])
                setMessage('')
              }}
            >
              <option value="">Choose a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>

            {selectedProject && (
              <>
                <h3>Current Members</h3>

                {members.length === 0 ? (
                  <p>No members found.</p>
                ) : (
                  <div className="member-list">
                    {members.map((membership) => {
                      const user = membership.user_id

                      if (!user) return null

                      const isLead =
                        String(currentProject?.project_lead_id?._id) ===
                        String(user._id)

                      return (
                        <div
                          className="member-row"
                          key={membership._id}
                        >
                          <span>
                            {userName(user)}
                            {isLead && (
                              <strong className="lead-label">
                                Project Lead
                              </strong>
                            )}
                          </span>

                          {!isLead && (
                            <button
                              className="remove-button"
                              onClick={() =>
                                handleRemoveMember(user._id)
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <h3>Add Member</h3>

                <form onSubmit={handleAddMember}>
                  <label>Registered User</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {userName(user)}
                      </option>
                    ))}
                  </select>

                  <button className="submit-button" type="submit">
                    Add Member
                  </button>
                </form>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
