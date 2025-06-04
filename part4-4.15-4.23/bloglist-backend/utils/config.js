require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
})

const MONGODB_URI = process.env.NODE_ENV === 'test'   
  ? process.env.TEST_MONGODB_URI  
  : process.env.MONGODB_URI

const PORT = process.env.PORT

const SECRET = process.env.NODE_ENV === 'test'
  ? process.env.TEST_SECRET
  : process.env.SECRET

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET
}
