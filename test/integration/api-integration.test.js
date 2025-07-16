const { usersApi, postsApi, commentsApi } = require('../api-clients')
const { generateRandomUser, generateRandomPost, generateRandomComment } = require('../utils/data-generators')
const { testHelpers } = require('../utils/test-helpers')

describe('Integration Tests - User, Posts, and Comments Flow', function () {
  before(function () {
    testHelpers.logTestStep('Initializing Integration Tests')
  })

  describe('Complete User Journey', function () {
    it('@integration should verify user-posts-comments relationship', async function () {
      const userId = 1
      testHelpers.logTestStep(`Testing complete relationship for user ID: ${userId}`)
      
      // Step 1: Get user details
      const user = await usersApi.getById(userId)
      expect(user.id).to.equal(userId)
      
      // Step 2: Get user's posts
      const userPosts = await usersApi.getPosts(userId)
      expect(userPosts).to.be.an('array')
      expect(userPosts.length).to.be.above(0)
      
      // Step 3: Get posts directly and verify they match
      const posts = await postsApi.getByUserId(userId)
      expect(posts).to.have.length(userPosts.length)
      
      // Step 4: Get comments for first post
      const firstPost = posts[0]
      const postComments = await postsApi.getComments(firstPost.id)
      expect(postComments).to.be.an('array')
      
      // Step 5: Verify comment-post relationship
      const comments = await commentsApi.getByPostId(firstPost.id)
      expect(comments).to.have.length(postComments.length)
      
      testHelpers.logTestStep(`✅ Verified relationships: User ${userId} → ${posts.length} posts → ${comments.length} comments per post`)
    })

    it('@integration should create and link user, post, and comment', async function () {
      testHelpers.logTestStep('Testing creation flow: User → Post → Comment')
      
      // Step 1: Create a new user
      const userData = generateRandomUser()
      const newUser = await usersApi.create(userData)
      expect(newUser.id).to.be.a('number')
      
      // Step 2: Create a post for this user
      const postData = generateRandomPost(newUser.id)
      const newPost = await postsApi.create(postData)
      expect(newPost.userId).to.equal(newUser.id)
      
      // Step 3: Create a comment for this post
      const commentData = generateRandomComment(newPost.id)
      const newComment = await commentsApi.create(commentData)
      expect(newComment.postId).to.equal(newPost.id)
      
      testHelpers.logTestStep(`✅ Created chain: User ${newUser.id} → Post ${newPost.id} → Comment ${newComment.id}`)
    })
  })

  describe('Data Consistency Tests', function () {
    it('@integration should verify all users have posts', async function () {
      testHelpers.logTestStep('Verifying all users have posts')
      
      const users = await usersApi.getAll()
      
      for (const user of users.slice(0, 3)) { // Test first 3 users for performance
        const userPosts = await postsApi.getByUserId(user.id)
        expect(userPosts.length).to.be.above(0, `User ${user.id} should have posts`)
        
        // Verify all posts belong to this user
        userPosts.forEach(post => {
          expect(post.userId).to.equal(user.id)
        })
      }
    })

    it('@integration should verify all posts have comments', async function () {
      testHelpers.logTestStep('Verifying all posts have comments')
      
      const posts = await postsApi.getAll()
      
      for (const post of posts.slice(0, 5)) { // Test first 5 posts for performance
        const postComments = await commentsApi.getByPostId(post.id)
        expect(postComments.length).to.be.above(0, `Post ${post.id} should have comments`)
        
        // Verify all comments belong to this post
        postComments.forEach(comment => {
          expect(comment.postId).to.equal(post.id)
        })
      }
    })

    it('@integration should verify comment email consistency', async function () {
      testHelpers.logTestStep('Verifying comment email consistency')
      
      const comments = await commentsApi.getAll()
      const emailDomains = new Set()
      
      comments.slice(0, 50).forEach(comment => {
        const emailParts = comment.email.split('@')
        expect(emailParts).to.have.length(2)
        emailDomains.add(emailParts[1])
      })
      
      expect(emailDomains.size).to.be.above(1) // Should have multiple domains
      testHelpers.logTestStep('Found ' + emailDomains.size + ' unique email domains')
    })
  })

  describe('Cross-Entity Operations', function () {
    it('@integration should update user and verify post relationship', async function () {
      const userId = 2
      testHelpers.logTestStep(`Testing user update impact on posts for user ID: ${userId}`)
      
      // Get original user and posts
      const originalUser = await usersApi.getById(userId)
      const userPosts = await postsApi.getByUserId(userId)
      
      // Update user
      const updatedUserData = { ...originalUser, name: 'Updated Test User' }
      await usersApi.update(userId, updatedUserData)
      
      // Verify posts still belong to user
      const postsAfterUpdate = await postsApi.getByUserId(userId)
      expect(postsAfterUpdate).to.have.length(userPosts.length)
      
      postsAfterUpdate.forEach(post => {
        expect(post.userId).to.equal(userId)
      })
    })

    it('@integration should delete post and verify comment handling', async function () {
      const postId = 10
      testHelpers.logTestStep(`Testing post deletion impact on comments for post ID: ${postId}`)
      
      // Get original comments
      const originalComments = await commentsApi.getByPostId(postId)
      expect(originalComments.length).to.be.above(0)
      
      // Delete post
      await postsApi.delete(postId)
      
      // In JSONPlaceholder, comments will still exist (it's a mock API)
      // In a real API, this might cascade delete or return empty
      const commentsAfterDelete = await commentsApi.getByPostId(postId)
      
      // This test documents the behavior - in real API you'd test actual cascade behavior
      testHelpers.logTestStep(`Comments after post deletion: ${commentsAfterDelete.length} (JSONPlaceholder behavior)`)
    })
  })

  describe('Bulk Operations', function () {
    it('@integration should handle multiple user operations efficiently', async function () {
      testHelpers.logTestStep('Testing bulk user operations')
      
      const startTime = Date.now()
      
      // Get multiple users in parallel
      const userIds = [1, 2, 3, 4, 5]
      const userPromises = userIds.map(id => usersApi.getById(id))
      const users = await Promise.all(userPromises)
      
      expect(users).to.have.length(userIds.length)
      
      // Get all their posts in parallel
      const postPromises = users.map(user => postsApi.getByUserId(user.id))
      const allPosts = await Promise.all(postPromises)
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      expect(totalTime).to.be.below(5000) // Should complete within 5 seconds
      expect(allPosts).to.have.length(users.length)
      
      const totalPostCount = allPosts.reduce((sum, posts) => sum + posts.length, 0)
      testHelpers.logTestStep(`Processed ${users.length} users with ${totalPostCount} total posts in ${totalTime}ms`)
    })

    it('@integration should create multiple related entities', async function () {
      testHelpers.logTestStep('Testing multiple entity creation')
      
      const userData = generateRandomUser()
      const newUser = await usersApi.create(userData)
      
      // Create multiple posts for this user
      const postPromises = []
      for (let i = 0; i < 3; i++) {
        const postData = generateRandomPost(newUser.id)
        postData.title = `Test Post ${i + 1} for ${newUser.name}`
        postPromises.push(postsApi.create(postData))
      }
      
      const newPosts = await Promise.all(postPromises)
      expect(newPosts).to.have.length(3)
      
      // Create comments for each post
      const commentPromises = []
      newPosts.forEach(post => {
        for (let i = 0; i < 2; i++) {
          const commentData = generateRandomComment(post.id)
          commentData.name = `Comment ${i + 1} on ${post.title}`
          commentPromises.push(commentsApi.create(commentData))
        }
      })
      
      const newComments = await Promise.all(commentPromises)
      expect(newComments).to.have.length(6) // 3 posts × 2 comments each
      
      testHelpers.logTestStep(`Created 1 user → 3 posts → 6 comments`)
    })
  })

  describe('Error Handling Integration', function () {
    it('@integration should handle cascading errors gracefully', async function () {
      testHelpers.logTestStep('Testing error handling across entities')
      
      try {
        // Try to get non-existent user
        await usersApi.getById(9999)
      } catch (error) {
        expect(error.response.status).to.equal(404)
      }
      
      try {
        // Try to get posts for non-existent user
        const posts = await postsApi.getByUserId(9999)
        expect(posts).to.be.an('array').that.is.empty
      } catch (error) {
        // Handle if API returns error for non-existent user posts
        expect(error.response.status).to.be.oneOf([404, 400])
      }
    })

    it('@integration should validate data integrity across entities', async function () {
      testHelpers.logTestStep('Validating data integrity across all entities')
      
      // Get sample data from each entity
      const users = await usersApi.getAll()
      const posts = await postsApi.getAll()
      const comments = await commentsApi.getAll()
      
      // Verify data consistency
      const userIds = users.map(u => u.id)
      const postUserIds = [...new Set(posts.map(p => p.userId))]
      const postIds = posts.map(p => p.id)
      const commentPostIds = [...new Set(comments.map(c => c.postId))]
      
      // All post userIds should exist in users
      postUserIds.forEach(userId => {
        expect(userIds).to.include(userId, `Post userId ${userId} should exist in users`)
      })
      
      // All comment postIds should exist in posts
      commentPostIds.forEach(postId => {
        expect(postIds).to.include(postId, `Comment postId ${postId} should exist in posts`)
      })
      
      testHelpers.logTestStep(`✅ Data integrity verified across ${users.length} users, ${posts.length} posts, ${comments.length} comments`)
    })
  })
})
