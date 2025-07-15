const request = require('superagent')
const config = require('../../config/test-config')

/**
 * Base HTTP Client for API requests
 * Provides a wrapper around superagent with common functionality
 */
class HttpClient {
  constructor (baseUrl = config.baseUrls.jsonplaceholder) {
    this.baseUrl = baseUrl
    this.defaultHeaders = config.defaultHeaders
    this.timeout = config.timeout
  }

  /**
   * Set default headers for all requests
   * @param {Object} headers - Headers object
   */
  setDefaultHeaders (headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers }
  }

  /**
   * Set authorization header
   * @param {string} token - Bearer token
   */
  setAuthToken (token) {
    this.setDefaultHeaders({ Authorization: `Bearer ${token}` })
  }

  /**
   * Build full URL
   * @param {string} endpoint - API endpoint
   * @returns {string} Full URL
   */
  buildUrl (endpoint) {
    return `${this.baseUrl}${endpoint}`
  }

  /**
   * Add timing information to response
   * @param {Object} response - Superagent response
   * @param {number} startTime - Request start time in milliseconds
   * @returns {Object} Response with timing info
   */
  addTimingInfo (response, startTime) {
    const endTime = Date.now()
    response.duration = endTime - startTime
    return response
  }

  /**
   * Handle request errors
   * @param {Error} error - Request error
   * @param {number} startTime - Request start time in milliseconds
   */
  handleError (error, startTime) {
    if (error.response) {
      // Add timing info to error response
      this.addTimingInfo(error.response, startTime)
      throw error
    } else if (error.timeout) {
      throw new Error(`Request timeout after ${this.timeout}ms`)
    } else {
      throw new Error(`Network error: ${error.message}`)
    }
  }

  /**
   * Perform GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} headers - Additional headers
   * @returns {Promise} Request promise
   */
  async get (endpoint, headers = {}) {
    const startTime = Date.now()
    try {
      const response = await request
        .get(this.buildUrl(endpoint))
        .set({ ...this.defaultHeaders, ...headers })
        .timeout(this.timeout)

      return this.addTimingInfo(response, startTime)
    } catch (error) {
      this.handleError(error, startTime)
    }
  }

  /**
   * Perform POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} headers - Additional headers
   * @returns {Promise} Request promise
   */
  async post (endpoint, data = {}, headers = {}) {
    const startTime = Date.now()
    try {
      const response = await request
        .post(this.buildUrl(endpoint))
        .send(data)
        .set({ ...this.defaultHeaders, ...headers })
        .timeout(this.timeout)

      return this.addTimingInfo(response, startTime)
    } catch (error) {
      this.handleError(error, startTime)
    }
  }

  /**
   * Perform PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} headers - Additional headers
   * @returns {Promise} Request promise
   */
  async put (endpoint, data = {}, headers = {}) {
    const startTime = Date.now()
    try {
      const response = await request
        .put(this.buildUrl(endpoint))
        .send(data)
        .set({ ...this.defaultHeaders, ...headers })
        .timeout(this.timeout)

      return this.addTimingInfo(response, startTime)
    } catch (error) {
      this.handleError(error, startTime)
    }
  }

  /**
   * Perform PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} headers - Additional headers
   * @returns {Promise} Request promise
   */
  async patch (endpoint, data = {}, headers = {}) {
    const startTime = Date.now()
    try {
      const response = await request
        .patch(this.buildUrl(endpoint))
        .send(data)
        .set({ ...this.defaultHeaders, ...headers })
        .timeout(this.timeout)

      return this.addTimingInfo(response, startTime)
    } catch (error) {
      this.handleError(error, startTime)
    }
  }

  /**
   * Perform DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} headers - Additional headers
   * @returns {Promise} Request promise
   */
  async delete (endpoint, headers = {}) {
    const startTime = Date.now()
    try {
      const response = await request
        .delete(this.buildUrl(endpoint))
        .set({ ...this.defaultHeaders, ...headers })
        .timeout(this.timeout)

      return this.addTimingInfo(response, startTime)
    } catch (error) {
      this.handleError(error, startTime)
    }
  }
}

module.exports = HttpClient
