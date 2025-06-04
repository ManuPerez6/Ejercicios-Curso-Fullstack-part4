const { test, after, before, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const api = supertest(app)
const helper = require('../utils/test_helper')
const config = require('../utils/config')


before(async () => {
  await mongoose.connect(config.MONGODB_URI)
  console.log('Connected')
})

beforeEach(async () => {
  await User.deleteMany({})
  await User.insertMany(helper.initialUsers)
})

test('a valid user can be created with a unique username', async () => {
  const newUser = {
    username: 'newuser',
    name: 'New User',
    password: 'password123',
  }

  const response = await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.username, newUser.username)

  const usersAtEnd = await User.find({})
  assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1)
})

test('creation fails with proper status code and message if username is already taken', async () => {
  const newUser = {
    username: 'hellas',
    name: 'Arto Hellas',
    password: 'alainen',
  }
  const response = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)
  assert.strictEqual(response.body.error, 'expected username to be unique')
  const usersAtEnd = await User.find({})
  assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
})

test('creation fails with 400 Bad Request if username is too short', async () => {
  const newUser = {
    username: 'ab',
    name: 'Short User',
    password: 'password123',
  }

  const response = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)
  assert.strictEqual(response.body.error, 'User validation failed: username: Username must be at least 3 characters long')
  const usersAtEnd = await User.find({})
  assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
})

test('creation fails with 400 Bad Request if password is too short', async () => {
  const newUser = {
    username: 'shortpass',
    name: 'Short Password User',
    password: 'ab',
  }

  const response = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)
  assert.strictEqual(response.body.error, 'Password must be at least 3 characters long')
  const usersAtEnd = await User.find({})
  assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
})

test('a blog can be added with a valid token', async () => {
  const token = await helper.getAuthToken(api, 'hellas', 'alainen')

  const newBlog = {
    title: 'Blog with token',
    author: 'Token Author',
    url: 'http://tokenblog.com',
    likes: 10
  }
  console.log("Secret Key: ", config.SECRET)
  console.log("Token: ", `${token}`)
  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.title, newBlog.title)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, 1)
})

test('adding a blog fails with 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'No Token',
    url: 'http://unauthorized.com',
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.error, 'token missing')
})

after(async () => {
  console.log('Closing database connection...')
  await mongoose.connection.close()
  console.log('Database connection closed.')
})
