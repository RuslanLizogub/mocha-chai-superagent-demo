const HttpClient = require('../utils/http-client')
const { responseValidations, schemaValidations } = require('../utils/test-helpers')

/**
 * Base API Client for REST endpoints
 * Provides common functionality for all API clients
 */
class BaseApiClient {
  constructor(baseUrl, endpoint) {
    this.client = new HttpClient(baseUrl)
    this.endpoint = endpoint
    this.responseValidations = responseValidations
    this.schemaValidations = schemaValidations
  }

  /**
   * Validate successful response and return body
   * @param {Object} response - HTTP response
   * @param {number} expectedStatus - Expected status code
   * @returns {Object} Response body
   */
  validateSuccessResponse(response, expectedStatus = 200) {
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
  validateResponseTime(response, maxTime = 3000) {
    this.responseValidations.validateResponseTime(response, maxTime)
  }

  /**
   * Handle and validate client errors (4xx)
   * @param {Function} requestFn - Function that makes the request
   * @param {number} expectedStatus - Expected error status
   * @returns {Object} Error response
   */
  async expectClientError(requestFn, expectedStatus = 400) {
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
}

module.exports = BaseApiClient 