const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('./config')

const requestLogger = (request, response, next) => {
  logger.info(`Method: ${request.method}`)
  logger.info(`Path:   ${request.path}`)

  if (request.method !== 'GET') {
    logger.info(`Body:   ${JSON.stringify(request.body)}`)
  }

  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Invalid ID format' })
  } else if (error.name === 'ValidationError') {
    const errors = error.errors
    const missingTitle = errors.title
    const missingUrl = errors.url

    if (missingTitle && missingUrl) {
      return response.status(400).json({ error: 'Title and URL are required' })
    } else if (missingTitle) {
      return response.status(400).json({ error: 'Title is required' })
    } else if (missingUrl) {
      return response.status(400).json({ error: 'URL is required' })
    } else {
      return response.status(400).json({ error: error.message })
    }
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({
      error: 'expected username to be unique'
    }) 
  } else if(error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'Invalid token' })
  } else if(error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'Token expired' })
  }

  return response.status(500).json({ error: 'Internal server error' })
}

const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7);
      const decodedToken = jwt.verify(token, config.SECRET);
      if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' });
      }
      request.user = decodedToken;
    } catch (error) {
      return response.status(401).json({ error: 'token invalid' });
    }
  } else {
    return response.status(401).json({ error: 'token missing' });
  }
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  userExtractor
}
