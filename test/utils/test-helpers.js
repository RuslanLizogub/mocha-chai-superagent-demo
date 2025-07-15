/**
 * Common test utilities and helper functions
 */

/**
 * Sleep utility for delays in tests
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay between retries
 * @returns {Promise} Promise that resolves with function result
 */
async function retry (fn, maxRetries = 3, delay = 1000) {
  let lastError

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i === maxRetries) {
        throw lastError
      }
      await sleep(delay * Math.pow(2, i)) // Exponential backoff
    }
  }
}

/**
 * Common response validations
 */
const responseValidations = {
  /**
   * Validate basic response structure
   * @param {Object} response - HTTP response
   */
  validateBasicResponse (response) {
    expect(response).to.exist
    expect(response).to.have.property('status')
    expect(response).to.have.property('body')
    expect(response).to.have.property('headers')
  },

  /**
   * Validate response has JSON content type
   * @param {Object} response - HTTP response
   */
  validateJsonContentType (response) {
    expect(response.headers).to.have.property('content-type')
    expect(response.headers['content-type']).to.include('application/json')
  },

  /**
   * Validate response time
   * @param {Object} response - HTTP response
   * @param {number} maxTime - Maximum allowed response time in ms
   */
  validateResponseTime (response, maxTime = 3000) {
    expect(response).to.have.responseTime(maxTime)
  },

  /**
   * Validate pagination response
   * @param {Object} response - HTTP response
   * @param {Object} options - Validation options
   */
  validatePaginationResponse (response, options = {}) {
    const { hasNextPage = false, hasPreviousPage = false } = options
    
    expect(response.body).to.have.property('data').that.is.an('array')
    expect(response.body).to.have.property('page').that.is.a('number')
    expect(response.body).to.have.property('per_page').that.is.a('number')
    expect(response.body).to.have.property('total').that.is.a('number')
    expect(response.body).to.have.property('total_pages').that.is.a('number')

    if (hasNextPage) {
      expect(response.body.page).to.be.below(response.body.total_pages)
    }

    if (hasPreviousPage) {
      expect(response.body.page).to.be.above(1)
    }
  },

  /**
   * Validate error response structure
   * @param {Object} response - HTTP response
   */
  validateErrorResponse (response) {
    expect(response.body).to.have.property('error').that.is.a('string')
    expect(response.body.error).to.not.be.empty
  }
}

/**
 * Schema validation helpers
 */
const schemaValidations = {
  /**
   * Validate user object schema
   * @param {Object} user - User object to validate
   */
  validateUserSchema (user) {
    expect(user).to.be.an('object')
    expect(user).to.have.property('id').that.is.a('number')
    expect(user).to.have.property('name').that.is.a('string')
    expect(user).to.have.property('username').that.is.a('string')
    expect(user).to.have.property('email').that.is.a('string')
    expect(user).to.have.property('phone').that.is.a('string')
    expect(user).to.have.property('website').that.is.a('string')
    expect(user).to.have.property('address').that.is.an('object')
    expect(user).to.have.property('company').that.is.an('object')
  },

  /**
   * Validate post object schema
   * @param {Object} post - Post object to validate
   */
  validatePostSchema (post) {
    expect(post).to.be.an('object')
    expect(post).to.have.property('id').that.is.a('number')
    expect(post).to.have.property('title').that.is.a('string')
    expect(post).to.have.property('body').that.is.a('string')
    expect(post).to.have.property('userId').that.is.a('number')
  },

  /**
   * Validate comment object schema
   * @param {Object} comment - Comment object to validate
   */
  validateCommentSchema (comment) {
    expect(comment).to.be.an('object')
    expect(comment).to.have.property('id').that.is.a('number')
    expect(comment).to.have.property('name').that.is.a('string')
    expect(comment).to.have.property('email').that.is.a('string')
    expect(comment).to.have.property('body').that.is.a('string')
    expect(comment).to.have.property('postId').that.is.a('number')
  }
}

/**
 * Test environment helpers
 */
const testHelpers = {
  /**
   * Get current timestamp
   * @returns {string} ISO timestamp
   */
  getCurrentTimestamp () {
    return new Date().toISOString()
  },

  /**
   * Generate test run ID
   * @returns {string} Unique test run ID
   */
  generateTestRunId () {
    return `test-run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Log test step
   * @param {string} step - Test step description
   */
  logTestStep (step) {
    console.log(`📝 Test Step: ${step}`)
  },

  /**
   * Log API call
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status
   * @param {number} duration - Response time
   */
  logApiCall (method, url, status, duration) {
    console.log(`🌐 ${method.toUpperCase()} ${url} → ${status} (${duration}ms)`)
  }
}

module.exports = {
  sleep,
  retry,
  responseValidations,
  schemaValidations,
  testHelpers
}
