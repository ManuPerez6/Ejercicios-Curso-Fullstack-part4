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

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Post blog testing',
    author: 'Manu',
    url: 'https://Blogs.com',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDB()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  
  const titles = blogsAtEnd.map(b => b.title)
  assert(titles.includes('Post blog testing'))
})

after(async () => {
  await mongoose.connection.close()
  console.log('Closing connection...')
})
