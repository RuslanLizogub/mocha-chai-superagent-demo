const BaseApiClient = require('./base-api')
const config = require('../../config/test-config')

/**
 * Users API Client
 * Handles all user-related API operations
 */
class UsersApiClient extends BaseApiClient {
  constructor() {
    super(config.baseUrls.jsonplaceholder, '/users')
  }

  /**
   * Get all users
   * @returns {Promise<Array>} Array of users
   */
  async getAll() {
    const response = await this.client.get(this.endpoint)
    const users = this.validateSuccessResponse(response)
    
    expect(users).to.be.an('array')
    expect(users).to.have.length.above(0)
    
    // Validate each user schema
    users.forEach(user => {
      this.schemaValidations.validateUserSchema(user)
    })
    
    return users
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getById(userId) {
    const response = await this.client.get(`${this.endpoint}/${userId}`)
    const user = this.validateSuccessResponse(response)
    
    this.schemaValidations.validateUserSchema(user)
    expect(user.id).to.equal(userId)
    
    return user
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const response = await this.client.post(this.endpoint, userData)
    const user = this.validateSuccessResponse(response, 201)
    
    // Validate that user was created with correct data
    expect(user).to.have.property('id').that.is.a('number')
    expect(user.name).to.equal(userData.name)
    expect(user.username).to.equal(userData.username)
    expect(user.email).to.equal(userData.email)
    
    return user
  }

  /**
   * Update user by ID
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async update(userId, userData) {
    const response = await this.client.put(`${this.endpoint}/${userId}`, userData)
    const user = this.validateSuccessResponse(response)
    
    expect(user).to.have.property('id').that.equals(userId)
    expect(user.name).to.equal(userData.name)
    expect(user.username).to.equal(userData.username)
    expect(user.email).to.equal(userData.email)
    
    return user
  }

  /**
   * Partially update user by ID
   * @param {number} userId - User ID
   * @param {Object} userData - Partial user data
   * @returns {Promise<Object>} Updated user
   */
  async patch(userId, userData) {
    const response = await this.client.patch(`${this.endpoint}/${userId}`, userData)
    const user = this.validateSuccessResponse(response)
    
    expect(user).to.have.property('id').that.equals(userId)
    
    // Validate that only provided fields were updated
    Object.keys(userData).forEach(key => {
      expect(user[key]).to.equal(userData[key])
    })
    
    return user
  }

  /**
   * Delete user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Delete response
   */
  async delete(userId) {
    const response = await this.client.delete(`${this.endpoint}/${userId}`)
    this.validateSuccessResponse(response)
    
    return response
  }

  /**
   * Search users by name
   * @param {string} name - Name to search for
   * @returns {Promise<Array>} Matching users
   */
  async searchByName(name) {
    const users = await this.getAll()
    return users.filter(user => 
      user.name.toLowerCase().includes(name.toLowerCase())
    )
  }

  /**
   * Get user's posts
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User's posts
   */
  async getPosts(userId) {
    const response = await this.client.get(`${this.endpoint}/${userId}/posts`)
    const posts = this.validateSuccessResponse(response)
    
    expect(posts).to.be.an('array')
    posts.forEach(post => {
      expect(post.userId).to.equal(userId)
    })
    
    return posts
  }

  /**
   * Get user's albums
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User's albums
   */
  async getAlbums(userId) {
    const response = await this.client.get(`${this.endpoint}/${userId}/albums`)
    const albums = this.validateSuccessResponse(response)
    
    expect(albums).to.be.an('array')
    albums.forEach(album => {
      expect(album.userId).to.equal(userId)
    })
    
    return albums
  }

  /**
   * Get users with performance validation
   * @param {number} maxResponseTime - Maximum allowed response time
   * @returns {Promise<Array>} Users array
   */
  async getAllWithPerformanceCheck(maxResponseTime = config.performance.fast) {
    const response = await this.client.get(this.endpoint)
    const users = this.validateSuccessResponse(response)
    
    this.validateResponseTime(response, maxResponseTime)
    
    return users
  }

  /**
   * Verify user doesn't exist
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Error response
   */
  async verifyNotFound(userId) {
    return this.expectClientError(
      () => this.client.get(`${this.endpoint}/${userId}`),
      404
    )
  }

  /**
   * Create user with invalid data
   * @param {Object} invalidData - Invalid user data
   * @returns {Promise<Object>} Error response
   */
  async createWithInvalidData(invalidData) {
    return this.expectClientError(
      () => this.client.post(this.endpoint, invalidData),
      400
    )
  }
}

module.exports = new UsersApiClient() 