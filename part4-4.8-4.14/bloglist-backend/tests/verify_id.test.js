const { test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('../utils/test_helper')
const config = require('../utils/config') 


before(async () => {
  console.log('Connecting to test database...')
  await mongoose.connect(config.MONGODB_URI)
  console.log('Connected!')
})


beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})


test('id is returned as id', { timeout: 30000 }, async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogs = response.body
  blogs.forEach(blog => {
    assert.ok(blog.id)  
    assert.strictEqual(typeof blog.id, 'string')
  })
})


after(async () => {
  console.log('Closing database connection...')
  await mongoose.connection.close()
})

