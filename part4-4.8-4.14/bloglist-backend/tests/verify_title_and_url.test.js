const { test, after, before, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)
const helper = require('../utils/test_helper')
const config = require('../utils/config')

before(async () => {
  await mongoose.connect(config.MONGODB_URI)
  console.log('Connected!')
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('if title and url are missing, respond with 400 Bad Request', async () => {
  const NewBlog = {
    author: 'Author Name',
    likes: 5,
  }
  
  const response = await api
    .post('/api/blogs')
    .send(NewBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.status, 400)
  assert.strictEqual(response.body.error, 'Title and URL are required')
})

test('if title is missing, respond with 400 Bad Request', async () => {
  const NewBlog = {
    author: 'Author Name',
    url: 'http://example.com',
    likes: 5,
  }

  const response = await api
    .post('/api/blogs')
    .send(NewBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.status, 400)
  assert.strictEqual(response.body.error, 'Title is required')
})

test('if url is missing, respond with 400 Bad Request', async () => {
  const NewBlog = {
    author: 'Author Name',
    title: 'Blog Title',
    likes: 5,
  }

  const response = await api
    .post('/api/blogs')
    .send(NewBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.status, 400)
  assert.strictEqual(response.body.error, 'URL is required')
})

after(async () => {
  console.log('Closing database connection...')
  await mongoose.connection.close()
})
