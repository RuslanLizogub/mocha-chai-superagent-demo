const BasePageObject = require('./base-page-object')
const config = require('../../config/test-config')

/**
 * Posts Page Object
 * Handles all post-related API operations
 */
class PostsPageObject extends BasePageObject {
  constructor () {
    super(config.baseUrls.jsonplaceholder)
    this.endpoint = '/posts'
  }

  /**
   * Get all posts
   * @returns {Promise<Array>} Array of posts
   */
  async getAllPosts () {
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
  async getPostById (postId) {
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
  async createPost (postData) {
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
  async updatePost (postId, postData) {
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
  async patchPost (postId, postData) {
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
  async deletePost (postId) {
    const response = await this.client.delete(`${this.endpoint}/${postId}`)
    this.validateSuccessResponse(response)
    
    return response
  }

  /**
   * Get posts by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User's posts
   */
  async getPostsByUserId (userId) {
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
  async getPostComments (postId) {
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
  async searchPostsByTitle (title) {
    const posts = await this.getAllPosts()
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
  async getPostsWithPagination (page = 1, limit = 10) {
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
   * Verify post doesn't exist
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Error response
   */
  async verifyPostNotFound (postId) {
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
  async createPostWithInvalidData (invalidData) {
    return this.expectClientError(
      () => this.client.post(this.endpoint, invalidData),
      400
    )
  }

  /**
   * Get posts with performance validation
   * @param {number} maxResponseTime - Maximum allowed response time
   * @returns {Promise<Array>} Posts array
   */
  async getAllPostsWithPerformanceCheck (maxResponseTime = config.performance.fast) {
    const response = await this.client.get(this.endpoint)
    const posts = this.validateSuccessResponse(response)
    
    this.validateResponseTime(response, maxResponseTime)
    
    return posts
  }

  /**
   * Get posts sorted by field
   * @param {string} sortField - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Promise<Array>} Sorted posts
   */
  async getPostsSorted (sortField = 'id', sortOrder = 'asc') {
    const response = await this.client.get(`${this.endpoint}?_sort=${sortField}&_order=${sortOrder}`)
    const posts = this.validateSuccessResponse(response)
    
    expect(posts).to.be.an('array')
    
    // Validate sorting
    if (posts.length > 1) {
      for (let i = 1; i < posts.length; i++) {
        if (sortOrder === 'asc') {
          expect(posts[i][sortField]).to.be.at.least(posts[i - 1][sortField])
        } else {
          expect(posts[i][sortField]).to.be.at.most(posts[i - 1][sortField])
        }
      }
    }
    
    return posts
  }
}

module.exports = PostsPageObject
