const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const initialBlogs = [
  {
    title: 'Blog de prueba',
    author: 'Manu',
    url: 'https://blog.com',
    likes: 10,
  },
]

const initialUsers = [
  {
    username: "hellas",
    name: "Arto Hellas",
    passwordHash: bcrypt.hashSync('alainen', 10) 
  },
]

const getAuthToken = async (api, username, password) => {
  const loginResponse = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)

  const token = loginResponse.body.token
  if (!token) {
    throw new Error('Token was not returned from /api/login')
  }

  return token
}

const blogsInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map(note => note.toJSON())
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const dummy = (blogs) => {
  return 1
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  return blogs.reduce((prev, current) => {
    return (prev.likes > current.likes) ? prev : current
  })
}

module.exports = {
  dummy,
  initialBlogs,
  initialUsers,
  getAuthToken,
  blogsInDB,
  totalLikes,
  favoriteBlog
}
