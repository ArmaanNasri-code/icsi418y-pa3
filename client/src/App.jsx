import { useState } from 'react'
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true)

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

  const [message, setMessage] = useState('')

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:5050/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      })

      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      setMessage('Server error. Please try again.')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:5050/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      setMessage('Server error. Please try again.')
    }
  }

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
              type="text"
              name="username"
              placeholder="Username"
              value={loginData.username}
              onChange={handleLoginChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
            />

            <button type="submit" className="submit-button">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <input
              type="text"
              name="f_name"
              placeholder="First Name"
              value={signupData.f_name}
              onChange={handleSignupChange}
            />

            <input
              type="text"
              name="l_name"
              placeholder="Last Name"
              value={signupData.l_name}
              onChange={handleSignupChange}
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={signupData.username}
              onChange={handleSignupChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signupData.password}
              onChange={handleSignupChange}
            />

            <button type="submit" className="submit-button">
              Sign Up
            </button>
          </form>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  )
}

export default App