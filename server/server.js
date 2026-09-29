const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const userSchema = new mongoose.Schema({
  f_name: {
    type: String,
    required: true,
  },
  l_name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
})

const User = mongoose.model('User', userSchema)

app.post('/signup', async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body

    if (!f_name || !l_name || !username || !password) {
      return res.status(400).json({
        message: 'All signup fields are required.',
      })
    }

    const existingUser = await User.findOne({ username })

    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists.',
      })
    }

    const newUser = new User({
      f_name,
      l_name,
      username,
      password,
    })

    await newUser.save()

    res.status(201).json({
      message: 'User created successfully.',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error.',
    })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required.',
      })
    }

    const user = await User.findOne({ username })

    if (!user) {
      return res.status(400).json({
        message: 'Username does not exist.',
      })
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: 'Incorrect password.',
      })
    }

    res.status(200).json({
      message: 'Login successful.',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server error.',
    })
  }
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')

    app.listen(5050, () => {
  console.log('Server running on port 5050')
})
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
  })