const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'Blog de prueba',
    author: 'Manu',
    url: 'https://blog.com',
    likes: 10,
  },
]

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
  blogsInDB,
  totalLikes,
  favoriteBlog
}
