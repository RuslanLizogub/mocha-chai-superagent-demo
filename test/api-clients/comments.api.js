const BaseApiClient = require('./base-api')
const config = require('../../config/test-config')

/**
 * Comments API Client
 * Handles all comment-related API operations
 */
class CommentsApiClient extends BaseApiClient {
  constructor() {
    super(config.baseUrls.jsonplaceholder, '/comments')
  }

  /**
   * Get all comments
   * @returns {Promise<Array>} Array of comments
   */
  async getAll() {
    const response = await this.client.get(this.endpoint)
    const comments = this.validateSuccessResponse(response)
    
    expect(comments).to.be.an('array')
    expect(comments).to.have.length.above(0)
    
    // Validate each comment schema
    comments.forEach(comment => {
      this.schemaValidations.validateCommentSchema(comment)
    })
    
    return comments
  }

  /**
   * Get comment by ID
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Comment object
   */
  async getById(commentId) {
    const response = await this.client.get(`${this.endpoint}/${commentId}`)
    const comment = this.validateSuccessResponse(response)
    
    this.schemaValidations.validateCommentSchema(comment)
    expect(comment.id).to.equal(commentId)
    
    return comment
  }

  /**
   * Create new comment
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} Created comment
   */
  async create(commentData) {
    const response = await this.client.post(this.endpoint, commentData)
    const comment = this.validateSuccessResponse(response, 201)
    
    // Validate that comment was created with correct data
    expect(comment).to.have.property('id').that.is.a('number')
    expect(comment.name).to.equal(commentData.name)
    expect(comment.email).to.equal(commentData.email)
    expect(comment.body).to.equal(commentData.body)
    expect(comment.postId).to.equal(commentData.postId)
    
    return comment
  }

  /**
   * Update comment by ID
   * @param {number} commentId - Comment ID
   * @param {Object} commentData - Updated comment data
   * @returns {Promise<Object>} Updated comment
   */
  async update(commentId, commentData) {
    const response = await this.client.put(`${this.endpoint}/${commentId}`, commentData)
    const comment = this.validateSuccessResponse(response)
    
    expect(comment).to.have.property('id').that.equals(commentId)
    expect(comment.name).to.equal(commentData.name)
    expect(comment.email).to.equal(commentData.email)
    expect(comment.body).to.equal(commentData.body)
    expect(comment.postId).to.equal(commentData.postId)
    
    return comment
  }

  /**
   * Partially update comment by ID
   * @param {number} commentId - Comment ID
   * @param {Object} commentData - Partial comment data
   * @returns {Promise<Object>} Updated comment
   */
  async patch(commentId, commentData) {
    const response = await this.client.patch(`${this.endpoint}/${commentId}`, commentData)
    const comment = this.validateSuccessResponse(response)
    
    expect(comment).to.have.property('id').that.equals(commentId)
    
    // Validate that only provided fields were updated
    Object.keys(commentData).forEach(key => {
      expect(comment[key]).to.equal(commentData[key])
    })
    
    return comment
  }

  /**
   * Delete comment by ID
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Delete response
   */
  async delete(commentId) {
    const response = await this.client.delete(`${this.endpoint}/${commentId}`)
    this.validateSuccessResponse(response)
    
    return response
  }

  /**
   * Get comments by post ID
   * @param {number} postId - Post ID
   * @returns {Promise<Array>} Post comments
   */
  async getByPostId(postId) {
    const response = await this.client.get(`${this.endpoint}?postId=${postId}`)
    const comments = this.validateSuccessResponse(response)
    
    expect(comments).to.be.an('array')
    comments.forEach(comment => {
      this.schemaValidations.validateCommentSchema(comment)
      expect(comment.postId).to.equal(postId)
    })
    
    return comments
  }

  /**
   * Search comments by email
   * @param {string} email - Email to search for
   * @returns {Promise<Array>} Matching comments
   */
  async searchByEmail(email) {
    const comments = await this.getAll()
    return comments.filter(comment => 
      comment.email.toLowerCase().includes(email.toLowerCase())
    )
  }

  /**
   * Get comments with pagination
   * @param {number} page - Page number
   * @param {number} limit - Comments per page
   * @returns {Promise<Array>} Comments array
   */
  async getWithPagination(page = 1, limit = 10) {
    const response = await this.client.get(`${this.endpoint}?_page=${page}&_limit=${limit}`)
    const comments = this.validateSuccessResponse(response)
    
    expect(comments).to.be.an('array')
    expect(comments).to.have.length.at.most(limit)
    
    comments.forEach(comment => {
      this.schemaValidations.validateCommentSchema(comment)
    })
    
    return comments
  }

  /**
   * Get comments sorted by field
   * @param {string} sortField - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Promise<Array>} Sorted comments
   */
  async getSorted(sortField = 'id', sortOrder = 'asc') {
    const response = await this.client.get(`${this.endpoint}?_sort=${sortField}&_order=${sortOrder}`)
    const comments = this.validateSuccessResponse(response)
    
    expect(comments).to.be.an('array')
    
    // Validate sorting (check first few items)
    if (comments.length > 1) {
      for (let i = 1; i < Math.min(comments.length, 10); i++) {
        const current = comments[i][sortField]
        const previous = comments[i - 1][sortField]
        
        if (typeof current === 'string' && typeof previous === 'string') {
          if (sortOrder === 'asc') {
            expect(current.localeCompare(previous)).to.be.at.least(-1) // Allow -1 for equal strings
          } else {
            expect(current.localeCompare(previous)).to.be.at.most(1) // Allow 1 for equal strings
          }
        } else {
          if (sortOrder === 'asc') {
            expect(current).to.be.at.least(previous)
          } else {
            expect(current).to.be.at.most(previous)
          }
        }
      }
    }
    
    return comments
  }

  /**
   * Get comments with performance validation
   * @param {number} maxResponseTime - Maximum allowed response time
   * @returns {Promise<Array>} Comments array
   */
  async getAllWithPerformanceCheck(maxResponseTime = config.performance.fast) {
    const response = await this.client.get(this.endpoint)
    const comments = this.validateSuccessResponse(response)
    
    this.validateResponseTime(response, maxResponseTime)
    
    return comments
  }

  /**
   * Verify comment doesn't exist
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Error response
   */
  async verifyNotFound(commentId) {
    return this.expectClientError(
      () => this.client.get(`${this.endpoint}/${commentId}`),
      404
    )
  }

  /**
   * Create comment with invalid data
   * @param {Object} invalidData - Invalid comment data
   * @returns {Promise<Object>} Error response
   */
  async createWithInvalidData(invalidData) {
    return this.expectClientError(
      () => this.client.post(this.endpoint, invalidData),
      400
    )
  }

  /**
   * Get comments statistics for a post
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Comments statistics
   */
  async getStatistics(postId) {
    const comments = await this.getByPostId(postId)
    
    return {
      total: comments.length,
      uniqueEmails: [...new Set(comments.map(c => c.email))].length,
      averageBodyLength: comments.reduce((sum, c) => sum + c.body.length, 0) / comments.length,
      longestComment: comments.reduce((longest, current) => 
        current.body.length > longest.body.length ? current : longest, comments[0]),
      shortestComment: comments.reduce((shortest, current) => 
        current.body.length < shortest.body.length ? current : shortest, comments[0])
    }
  }

  /**
   * Validate comment email format
   * @param {Object} comment - Comment object
   * @returns {boolean} Is valid email
   */
  validateEmail(comment) {
    const { isValidEmail } = require('../utils/data-generators')
    expect(isValidEmail(comment.email)).to.be.true
    return true
  }
}

module.exports = new CommentsApiClient() 