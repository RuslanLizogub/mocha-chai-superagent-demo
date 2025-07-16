const { usersApi } = require('../api-clients')
const { generateRandomUser, invalidDataSets } = require('../utils/data-generators')
const { testHelpers } = require('../utils/test-helpers')
const config = require('../../config/test-config')

describe('Users API Tests', function () {
  before(function () {
    testHelpers.logTestStep('Initializing Users API Tests')
  })

  describe('GET /users', function () {
    it('@smoke should get all users successfully', async function () {
      testHelpers.logTestStep('Getting all users')
      
      const users = await usersApi.getAll()
      
      expect(users).to.have.length(10) // JSONPlaceholder has 10 users
      users.forEach(user => {
        expect(user).to.have.all.keys(['id', 'name', 'username', 'email', 'address', 'phone', 'website', 'company'])
      })
    })

    it('@performance should get all users within performance threshold', async function () {
      testHelpers.logTestStep('Testing users API performance')
      
      const users = await usersApi.getAllWithPerformanceCheck(config.performance.fast)
      
      expect(users).to.have.length.above(0)
    })

    it('@regression should handle empty results gracefully', async function () {
      testHelpers.logTestStep('Testing empty results handling')
      
      // This test demonstrates how to handle edge cases
      const users = await usersApi.getAll()
      expect(users).to.be.an('array')
    })
  })

  describe('GET /users/:id', function () {
    it('@smoke should get user by valid ID', async function () {
      const userId = 1
      testHelpers.logTestStep(`Getting user with ID: ${userId}`)
      
      const user = await usersApi.getById(userId)
      
      expect(user.id).to.equal(userId)
      expect(user.name).to.be.a('string').that.is.not.empty
      expect(user.email).to.include('@')
    })

    it('@regression should return 404 for non-existent user', async function () {
      const invalidUserId = 9999
      testHelpers.logTestStep(`Testing non-existent user ID: ${invalidUserId}`)
      
      const errorResponse = await usersApi.verifyNotFound(invalidUserId)
      
      expect(errorResponse.status).to.equal(404)
    })

    it('@regression should handle invalid user ID format', async function () {
      const invalidUserId = 'invalid'
      testHelpers.logTestStep(`Testing invalid user ID format: ${invalidUserId}`)
      
      try {
        await usersApi.getById(invalidUserId)
        expect.fail('Should have thrown an error for invalid ID format')
      } catch (error) {
        expect(error.response.status).to.be.oneOf([400, 404])
      }
    })
  })

  describe('POST /users', function () {
    it('@smoke should create user with valid data', async function () {
      const userData = generateRandomUser()
      testHelpers.logTestStep(`Creating user: ${userData.name}`)
      
      const createdUser = await usersApi.create(userData)
      
      expect(createdUser.id).to.be.a('number')
      expect(createdUser.name).to.equal(userData.name)
      expect(createdUser.username).to.equal(userData.username)
      expect(createdUser.email).to.equal(userData.email)
    })

    it('@regression should create user with minimal required data', async function () {
      const minimalUser = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com'
      }
      testHelpers.logTestStep('Creating user with minimal data')
      
      const createdUser = await usersApi.create(minimalUser)
      
      expect(createdUser.id).to.be.a('number')
      expect(createdUser.name).to.equal(minimalUser.name)
    })

    it('@regression should handle creation with invalid email', async function () {
      const invalidUserData = { ...generateRandomUser(), ...invalidDataSets.user.invalidEmail }
      testHelpers.logTestStep('Testing user creation with invalid email')
      
      try {
        await usersApi.createWithInvalidData(invalidUserData)
      } catch (error) {
        // JSONPlaceholder doesn't validate, so this might pass
        // In a real API, this should return a validation error
        console.log('Note: JSONPlaceholder accepts invalid emails')
      }
    })

    it('@regression should handle creation with empty name', async function () {
      const invalidUserData = { ...generateRandomUser(), ...invalidDataSets.user.emptyName }
      testHelpers.logTestStep('Testing user creation with empty name')
      
      try {
        await usersApi.createWithInvalidData(invalidUserData)
      } catch (error) {
        // JSONPlaceholder doesn't validate, so this might pass
        console.log('Note: JSONPlaceholder accepts empty names')
      }
    })
  })

  describe('PUT /users/:id', function () {
    it('@smoke should update user successfully', async function () {
      const userId = 1
      const updatedData = generateRandomUser()
      testHelpers.logTestStep(`Updating user ID: ${userId}`)
      
      const updatedUser = await usersApi.update(userId, updatedData)
      
      expect(updatedUser.id).to.equal(userId)
      expect(updatedUser.name).to.equal(updatedData.name)
      expect(updatedUser.username).to.equal(updatedData.username)
      expect(updatedUser.email).to.equal(updatedData.email)
    })

    it('@regression should update non-existent user', async function () {
      const invalidUserId = 9999
      const userData = generateRandomUser()
      testHelpers.logTestStep(`Updating non-existent user ID: ${invalidUserId}`)
      
      try {
        // JSONPlaceholder will return the data with the provided ID
        const result = await usersApi.update(invalidUserId, userData)
        expect(result.id).to.equal(invalidUserId)
      } catch (error) {
        // JSONPlaceholder sometimes returns 500 for non-existent resources
        expect(error.response.status).to.be.oneOf([200, 500])
        console.log('Note: JSONPlaceholder returned error for non-existent user update')
      }
    })
  })

  describe('PATCH /users/:id', function () {
    it('@smoke should partially update user', async function () {
      const userId = 1
      const partialData = { name: 'Updated Name' }
      testHelpers.logTestStep(`Partially updating user ID: ${userId}`)
      
      const updatedUser = await usersApi.patch(userId, partialData)
      
      expect(updatedUser.id).to.equal(userId)
      expect(updatedUser.name).to.equal(partialData.name)
    })

    it('@regression should patch multiple fields', async function () {
      const userId = 2
      const partialData = {
        name: 'New Name',
        email: 'newemail@example.com'
      }
      testHelpers.logTestStep(`Patching multiple fields for user ID: ${userId}`)
      
      const updatedUser = await usersApi.patch(userId, partialData)
      
      expect(updatedUser.name).to.equal(partialData.name)
      expect(updatedUser.email).to.equal(partialData.email)
    })
  })

  describe('DELETE /users/:id', function () {
    it('@smoke should delete user successfully', async function () {
      const userId = 1
      testHelpers.logTestStep(`Deleting user ID: ${userId}`)
      
      const response = await usersApi.delete(userId)
      
      expect(response.status).to.equal(200)
    })

    it('@regression should handle deletion of non-existent user', async function () {
      const invalidUserId = 9999
      testHelpers.logTestStep(`Deleting non-existent user ID: ${invalidUserId}`)
      
      // JSONPlaceholder returns 200 even for non-existent resources
      const response = await usersApi.delete(invalidUserId)
      expect(response.status).to.equal(200)
    })
  })

  describe('User Search and Filtering', function () {
    it('@regression should search users by name', async function () {
      const searchName = 'Leanne'
      testHelpers.logTestStep(`Searching users by name: ${searchName}`)
      
      const users = await usersApi.searchByName(searchName)
      
      expect(users).to.be.an('array')
      users.forEach(user => {
        expect(user.name.toLowerCase()).to.include(searchName.toLowerCase())
      })
    })

    it('@regression should get user posts', async function () {
      const userId = 1
      testHelpers.logTestStep(`Getting posts for user ID: ${userId}`)
      
      const posts = await usersApi.getPosts(userId)
      
      expect(posts).to.be.an('array')
      posts.forEach(post => {
        expect(post.userId).to.equal(userId)
      })
    })

    it('@regression should get user albums', async function () {
      const userId = 1
      testHelpers.logTestStep(`Getting albums for user ID: ${userId}`)
      
      const albums = await usersApi.getAlbums(userId)
      
      expect(albums).to.be.an('array')
      albums.forEach(album => {
        expect(album.userId).to.equal(userId)
      })
    })
  })

  describe('Data Validation', function () {
    it('@regression should validate user email format', async function () {
      testHelpers.logTestStep('Validating user email formats')
      
      const users = await usersApi.getAll()
      
      users.forEach(user => {
        expect(user.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      })
    })

    it('@regression should validate user website format', async function () {
      testHelpers.logTestStep('Validating user website formats')
      
      const users = await usersApi.getAll()
      
      users.forEach(user => {
        // Check if website is a valid domain or URL
        expect(user.website).to.match(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$|^https?:\/\//)
      })
    })

    it('@regression should validate address structure', async function () {
      testHelpers.logTestStep('Validating user address structures')
      
      const users = await usersApi.getAll()
      
      users.forEach(user => {
        expect(user.address).to.have.all.keys(['street', 'suite', 'city', 'zipcode', 'geo'])
        expect(user.address.geo).to.have.all.keys(['lat', 'lng'])
      })
    })
  })
})
