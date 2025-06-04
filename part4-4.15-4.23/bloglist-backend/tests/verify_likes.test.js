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

test('if likes is missing in request, it defaults to 0', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Author Name',
    url: 'http://example.com',
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const savedBlog = response.body
  assert.ok(savedBlog.likes !== undefined)
  assert.strictEqual(savedBlog.likes, 0)
})

after(async () => {
  console.log('Closing database connection...')
  await mongoose.connection.close()
})
