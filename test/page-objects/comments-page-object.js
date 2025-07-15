const BasePageObject = require('./base-page-object')
const config = require('../../config/test-config')

/**
 * Comments Page Object
 * Handles all comment-related API operations
 */
class CommentsPageObject extends BasePageObject {
  constructor () {
    super(config.baseUrls.jsonplaceholder)
    this.endpoint = '/comments'
  }

  /**
   * Get all comments
   * @returns {Promise<Array>} Array of comments
   */
  async getAllComments () {
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
  async getCommentById (commentId) {
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
  async createComment (commentData) {
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
  async updateComment (commentId, commentData) {
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
  async patchComment (commentId, commentData) {
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
  async deleteComment (commentId) {
    const response = await this.client.delete(`${this.endpoint}/${commentId}`)
    this.validateSuccessResponse(response)
    
    return response
  }

  /**
   * Get comments by post ID
   * @param {number} postId - Post ID
   * @returns {Promise<Array>} Post comments
   */
  async getCommentsByPostId (postId) {
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
  async searchCommentsByEmail (email) {
    const comments = await this.getAllComments()
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
  async getCommentsWithPagination (page = 1, limit = 10) {
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
   * Verify comment doesn't exist
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Error response
   */
  async verifyCommentNotFound (commentId) {
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
  async createCommentWithInvalidData (invalidData) {
    return this.expectClientError(
      () => this.client.post(this.endpoint, invalidData),
      400
    )
  }

  /**
   * Get comments with performance validation
   * @param {number} maxResponseTime - Maximum allowed response time
   * @returns {Promise<Array>} Comments array
   */
  async getAllCommentsWithPerformanceCheck (maxResponseTime = config.performance.fast) {
    const response = await this.client.get(this.endpoint)
    const comments = this.validateSuccessResponse(response)
    
    this.validateResponseTime(response, maxResponseTime)
    
    return comments
  }

  /**
   * Get comments sorted by field
   * @param {string} sortField - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Promise<Array>} Sorted comments
   */
  async getCommentsSorted (sortField = 'id', sortOrder = 'asc') {
    const response = await this.client.get(`${this.endpoint}?_sort=${sortField}&_order=${sortOrder}`)
    const comments = this.validateSuccessResponse(response)
    
    expect(comments).to.be.an('array')
    
    // Validate sorting
    if (comments.length > 1) {
      for (let i = 1; i < comments.length; i++) {
        if (sortOrder === 'asc') {
          expect(comments[i][sortField]).to.be.at.least(comments[i - 1][sortField])
        } else {
          expect(comments[i][sortField]).to.be.at.most(comments[i - 1][sortField])
        }
      }
    }
    
    return comments
  }

  /**
   * Validate comment email format
   * @param {Object} comment - Comment object
   * @returns {boolean} Is valid email
   */
  validateCommentEmail (comment) {
    const { isValidEmail } = require('../utils/data-generators')
    expect(isValidEmail(comment.email)).to.be.true
    return true
  }

  /**
   * Get comments statistics for a post
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Comments statistics
   */
  async getCommentsStatistics (postId) {
    const comments = await this.getCommentsByPostId(postId)
    
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
}

module.exports = CommentsPageObject
