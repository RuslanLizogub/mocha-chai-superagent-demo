const BasePageObject = require('./base-page-object')
const config = require('../../config/test-config')

/**
 * Users Page Object
 * Handles all user-related API operations
 */
class UsersPageObject extends BasePageObject {
  constructor () {
    super(config.baseUrls.jsonplaceholder)
    this.endpoint = '/users'
  }

  /**
   * Get all users
   * @returns {Promise<Array>} Array of users
   */
  async getAllUsers () {
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
  async getUserById (userId) {
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
  async createUser (userData) {
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
  async updateUser (userId, userData) {
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
  async patchUser (userId, userData) {
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
  async deleteUser (userId) {
    const response = await this.client.delete(`${this.endpoint}/${userId}`)
    this.validateSuccessResponse(response)
    
    return response
  }

  /**
   * Verify user doesn't exist
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Error response
   */
  async verifyUserNotFound (userId) {
    return this.expectClientError(
      () => this.client.get(`${this.endpoint}/${userId}`),
      404
    )
  }

  /**
   * Search users by name
   * @param {string} name - Name to search for
   * @returns {Promise<Array>} Matching users
   */
  async searchUsersByName (name) {
    const users = await this.getAllUsers()
    return users.filter(user => 
      user.name.toLowerCase().includes(name.toLowerCase())
    )
  }

  /**
   * Get user's posts
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User's posts
   */
  async getUserPosts (userId) {
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
  async getUserAlbums (userId) {
    const response = await this.client.get(`${this.endpoint}/${userId}/albums`)
    const albums = this.validateSuccessResponse(response)
    
    expect(albums).to.be.an('array')
    albums.forEach(album => {
      expect(album.userId).to.equal(userId)
    })
    
    return albums
  }

  /**
   * Validate user creation with invalid data
   * @param {Object} invalidData - Invalid user data
   * @returns {Promise<Object>} Error response
   */
  async createUserWithInvalidData (invalidData) {
    return this.expectClientError(
      () => this.client.post(this.endpoint, invalidData),
      400
    )
  }

  /**
   * Get users with performance validation
   * @param {number} maxResponseTime - Maximum allowed response time
   * @returns {Promise<Array>} Users array
   */
  async getAllUsersWithPerformanceCheck (maxResponseTime = config.performance.fast) {
    const response = await this.client.get(this.endpoint)
    const users = this.validateSuccessResponse(response)
    
    this.validateResponseTime(response, maxResponseTime)
    
    return users
  }
}

module.exports = UsersPageObject
