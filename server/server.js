
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const userSchema = new mongoose.Schema({
  f_name: { type: String, required: true },
  l_name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

const User = mongoose.model('User', userSchema)

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Planning', 'Active', 'Completed'],
  },
  project_lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const Project = mongoose.model('Project', projectSchema)

const projectMembershipSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

projectMembershipSchema.index(
  { project_id: 1, user_id: 1 },
  { unique: true }
)

const ProjectMembership = mongoose.model(
  'ProjectMembership',
  projectMembershipSchema
)

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
    res.status(500).json({ message: 'Server error.' })
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
    res.status(500).json({ message: 'Server error.' })
  }
})

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error.' })
  }
})

app.post('/projects', async (req, res) => {
  try {
    const { name, description, status, project_lead_id } = req.body

    if (
      !name?.trim() ||
      !description?.trim() ||
      !status ||
      !project_lead_id
    ) {
      return res.status(400).json({
        message: 'All project fields are required.',
      })
    }

    if (!['Planning', 'Active', 'Completed'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid project status.',
      })
    }

    if (!mongoose.isValidObjectId(project_lead_id)) {
      return res.status(400).json({
        message: 'Invalid project lead ID.',
      })
    }

    const lead = await User.findById(project_lead_id)

    if (!lead) {
      return res.status(404).json({
        message: 'Project lead does not exist.',
      })
    }

    const project = new Project({
      name: name.trim(),
      description: description.trim(),
      status,
      project_lead_id,
    })

    await project.save()

    try {
      await ProjectMembership.create({
        project_id: project._id,
        user_id: project_lead_id,
      })
    } catch (error) {
      await Project.findByIdAndDelete(project._id)
      throw error
    }

    res.status(201).json({
      message: 'Project created successfully.',
      project,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error.' })
  }
})

app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().populate(
      'project_lead_id',
      'f_name l_name username'
    )

    res.json(projects)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error.' })
  }
})

app.get('/projects/:projectId/members', async (req, res) => {
  try {
    const { projectId } = req.params

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        message: 'Invalid project ID.',
      })
    }

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({
        message: 'Project does not exist.',
      })
    }

    const members = await ProjectMembership.find({
      project_id: projectId,
    }).populate('user_id', 'f_name l_name username')

    res.json(members)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error.' })
  }
})

app.post('/projects/:projectId/members', async (req, res) => {
  try {
    const { projectId } = req.params
    const { user_id } = req.body

    if (
      !mongoose.isValidObjectId(projectId) ||
      !mongoose.isValidObjectId(user_id)
    ) {
      return res.status(400).json({
        message: 'Invalid project or user ID.',
      })
    }

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({
        message: 'Project does not exist.',
      })
    }

    const user = await User.findById(user_id)

    if (!user) {
      return res.status(404).json({
        message: 'User does not exist.',
      })
    }

    const existingMember = await ProjectMembership.findOne({
      project_id: projectId,
      user_id,
    })

    if (existingMember) {
      return res.status(400).json({
        message: 'User is already a member of this project.',
      })
    }

    await ProjectMembership.create({
      project_id: projectId,
      user_id,
    })

    res.status(201).json({
      message: 'Member added successfully.',
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'User is already a member of this project.',
      })
    }

    console.error(error)
    res.status(500).json({ message: 'Server error.' })
  }
})

app.delete('/projects/:projectId/members/:userId', async (req, res) => {
  try {
    const { projectId, userId } = req.params

    if (
      !mongoose.isValidObjectId(projectId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({
        message: 'Invalid project or user ID.',
      })
    }

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({
        message: 'Project does not exist.',
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        message: 'User does not exist.',
      })
    }

    if (project.project_lead_id.toString() === userId) {
      return res.status(400).json({
        message: 'The project lead cannot be removed.',
      })
    }

    const membership = await ProjectMembership.findOneAndDelete({
      project_id: projectId,
      user_id: userId,
    })

    if (!membership) {
      return res.status(404).json({
        message: 'User is not a member of this project.',
      })
    }

    res.json({
      message: 'Member removed successfully.',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error.' })
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
