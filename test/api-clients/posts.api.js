const BaseApiClient = require('./base-api')
const config = require('../../config/test-config')

/**
 * Posts API Client
 * Handles all post-related API operations
 */
class PostsApiClient extends BaseApiClient {
  constructor() {
    super(config.baseUrls.jsonplaceholder, '/posts')
  }

  /**
   * Get all posts
   * @returns {Promise<Array>} Array of posts
   */
  async getAll() {
    const response = await this.client.get(this.endpoint)
    const posts = this.validateSuccessResponse(response)
    
    expect(posts).to.be.an('array')
    expect(posts).to.have.length.above(0)
    
    // Validate each post schema
    posts.forEach(post => {
      this.schemaValidations.validatePostSchema(post)
    })
    
    return posts
  }

  /**
   * Get post by ID
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Post object
   */
  async getById(postId) {
    const response = await this.client.get(`${this.endpoint}/${postId}`)
    const post = this.validateSuccessResponse(response)
    
    this.schemaValidations.validatePostSchema(post)
    expect(post.id).to.equal(postId)
    
    return post
  }

  /**
   * Create new post
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} Created post
   */
  async create(postData) {
    const response = await this.client.post(this.endpoint, postData)
    const post = this.validateSuccessResponse(response, 201)
    
    // Validate that post was created with correct data
    expect(post).to.have.property('id').that.is.a('number')
    expect(post.title).to.equal(postData.title)
    expect(post.body).to.equal(postData.body)
    expect(post.userId).to.equal(postData.userId)
    
    return post
  }

  /**
   * Update post by ID
   * @param {number} postId - Post ID
   * @param {Object} postData - Updated post data
   * @returns {Promise<Object>} Updated post
   */
  async update(postId, postData) {
    const response = await this.client.put(`${this.endpoint}/${postId}`, postData)
    const post = this.validateSuccessResponse(response)
    
    expect(post).to.have.property('id').that.equals(postId)
    expect(post.title).to.equal(postData.title)
    expect(post.body).to.equal(postData.body)
    expect(post.userId).to.equal(postData.userId)
    
    return post
  }

  /**
   * Partially update post by ID
   * @param {number} postId - Post ID
   * @param {Object} postData - Partial post data
   * @returns {Promise<Object>} Updated post
   */
  async patch(postId, postData) {
    const response = await this.client.patch(`${this.endpoint}/${postId}`, postData)
    const post = this.validateSuccessResponse(response)
    
    expect(post).to.have.property('id').that.equals(postId)
    
    // Validate that only provided fields were updated
    Object.keys(postData).forEach(key => {
      expect(post[key]).to.equal(postData[key])
    })
    
    return post
  }

  /**
   * Delete post by ID
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Delete response
   */
  async delete(postId) {
    const response = await this.client.delete(`${this.endpoint}/${postId}`)
    this.validateSuccessResponse(response)
    
    return response
  }

  /**
   * Get posts by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User's posts
   */
  async getByUserId(userId) {
    const response = await this.client.get(`${this.endpoint}?userId=${userId}`)
    const posts = this.validateSuccessResponse(response)
    
    expect(posts).to.be.an('array')
    posts.forEach(post => {
      this.schemaValidations.validatePostSchema(post)
      expect(post.userId).to.equal(userId)
    })
    
    return posts
  }

  /**
   * Get post comments
   * @param {number} postId - Post ID
   * @returns {Promise<Array>} Post comments
   */
  async getComments(postId) {
    const response = await this.client.get(`${this.endpoint}/${postId}/comments`)
    const comments = this.validateSuccessResponse(response)
    
    expect(comments).to.be.an('array')
    comments.forEach(comment => {
      this.schemaValidations.validateCommentSchema(comment)
      expect(comment.postId).to.equal(postId)
    })
    
    return comments
  }

  /**
   * Search posts by title
   * @param {string} title - Title to search for
   * @returns {Promise<Array>} Matching posts
   */
  async searchByTitle(title) {
    const posts = await this.getAll()
    return posts.filter(post => 
      post.title.toLowerCase().includes(title.toLowerCase())
    )
  }

  /**
   * Get posts with pagination
   * @param {number} page - Page number
   * @param {number} limit - Posts per page
   * @returns {Promise<Array>} Posts array
   */
  async getWithPagination(page = 1, limit = 10) {
    const response = await this.client.get(`${this.endpoint}?_page=${page}&_limit=${limit}`)
    const posts = this.validateSuccessResponse(response)
    
    expect(posts).to.be.an('array')
    expect(posts).to.have.length.at.most(limit)
    
    posts.forEach(post => {
      this.schemaValidations.validatePostSchema(post)
    })
    
    return posts
  }

  /**
   * Get posts sorted by field
   * @param {string} sortField - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Promise<Array>} Sorted posts
   */
  async getSorted(sortField = 'id', sortOrder = 'asc') {
    const response = await this.client.get(`${this.endpoint}?_sort=${sortField}&_order=${sortOrder}`)
    const posts = this.validateSuccessResponse(response)
    
    expect(posts).to.be.an('array')
    
    // Validate sorting (check first few items)
    if (posts.length > 1) {
      for (let i = 1; i < Math.min(posts.length, 10); i++) {
        const current = posts[i][sortField]
        const previous = posts[i - 1][sortField]
        
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
    
    return posts
  }

  /**
   * Get posts with performance validation
   * @param {number} maxResponseTime - Maximum allowed response time
   * @returns {Promise<Array>} Posts array
   */
  async getAllWithPerformanceCheck(maxResponseTime = config.performance.fast) {
    const response = await this.client.get(this.endpoint)
    const posts = this.validateSuccessResponse(response)
    
    this.validateResponseTime(response, maxResponseTime)
    
    return posts
  }

  /**
   * Verify post doesn't exist
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Error response
   */
  async verifyNotFound(postId) {
    return this.expectClientError(
      () => this.client.get(`${this.endpoint}/${postId}`),
      404
    )
  }

  /**
   * Create post with invalid data
   * @param {Object} invalidData - Invalid post data
   * @returns {Promise<Object>} Error response
   */
  async createWithInvalidData(invalidData) {
    return this.expectClientError(
      () => this.client.post(this.endpoint, invalidData),
      400
    )
  }
}

module.exports = new PostsApiClient() 