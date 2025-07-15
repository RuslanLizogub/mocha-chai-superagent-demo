const HttpClient = require('../utils/http-client')
const { responseValidations, schemaValidations } = require('../utils/test-helpers')

/**
 * Base Page Object class for API endpoints
 * Provides common functionality for all API page objects
 */
class BasePageObject {
  constructor (baseUrl) {
    this.client = new HttpClient(baseUrl)
    this.responseValidations = responseValidations
    this.schemaValidations = schemaValidations
  }

  /**
   * Set authentication token
   * @param {string} token - Bearer token
   */
  setAuthToken (token) {
    this.client.setAuthToken(token)
  }

  /**
   * Set custom headers
   * @param {Object} headers - Headers object
   */
  setHeaders (headers) {
    this.client.setDefaultHeaders(headers)
  }

  /**
   * Validate response and return body
   * @param {Object} response - HTTP response
   * @param {number} expectedStatus - Expected status code
   * @returns {Object} Response body
   */
  validateAndGetBody (response, expectedStatus = 200) {
    this.responseValidations.validateBasicResponse(response)
    expect(response.status).to.equal(expectedStatus)
    
    if (expectedStatus < 400) {
      this.responseValidations.validateJsonContentType(response)
    }
    
    return response.body
  }

  /**
   * Validate response time
   * @param {Object} response - HTTP response
   * @param {number} maxTime - Maximum allowed time in ms
   */
  validateResponseTime (response, maxTime = 3000) {
    this.responseValidations.validateResponseTime(response, maxTime)
  }

  /**
   * Common validation for successful operations
   * @param {Object} response - HTTP response
   * @param {number} expectedStatus - Expected status code
   * @returns {Object} Response body
   */
  validateSuccessResponse (response, expectedStatus = 200) {
    const body = this.validateAndGetBody(response, expectedStatus)
    this.validateResponseTime(response)
    return body
  }

  /**
   * Common validation for error responses
   * @param {Object} response - HTTP response
   * @param {number} expectedStatus - Expected error status code
   * @returns {Object} Response body
   */
  validateErrorResponse (response, expectedStatus = 400) {
    const body = this.validateAndGetBody(response, expectedStatus)
    this.responseValidations.validateErrorResponse(body)
    return body
  }

  /**
   * Handle and validate client errors (4xx)
   * @param {Function} requestFn - Function that makes the request
   * @param {number} expectedStatus - Expected error status
   * @returns {Object} Error response
   */
  async expectClientError (requestFn, expectedStatus = 400) {
    try {
      await requestFn()
      throw new Error('Expected request to fail but it succeeded')
    } catch (error) {
      if (error.response) {
        expect(error.response).to.have.clientErrorStatus()
        expect(error.response.status).to.equal(expectedStatus)
        return error.response
      }
      throw error
    }
  }

  /**
   * Perform request with retry logic
   * @param {Function} requestFn - Function that makes the request
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Object} Response
   */
  async requestWithRetry (requestFn, maxRetries = 3) {
    const { retry } = require('../utils/test-helpers')
    return retry(requestFn, maxRetries)
  }
}

module.exports = BasePageObject
