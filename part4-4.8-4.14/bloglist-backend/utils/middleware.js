const logger = require('./logger')

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
  }

  if (error.name === 'ValidationError') {
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
  }

  return response.status(500).json({ error: 'Internal server error' })
}
module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}
