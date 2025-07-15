const { UsersPageObject, PostsPageObject, CommentsPageObject } = require('../page-objects')
const { testHelpers } = require('../utils/test-helpers')
const config = require('../../config/test-config')

describe('@smoke API Smoke Tests', function () {
  let usersPage, postsPage, commentsPage

  before(function () {
    usersPage = new UsersPageObject()
    postsPage = new PostsPageObject()
    commentsPage = new CommentsPageObject()
    testHelpers.logTestStep('Initializing Smoke Tests - Critical API Functionality')
  })

  describe('Critical API Endpoints Health Check', function () {
    it('should verify Users API is accessible and responsive', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Users API Health')
      
      const startTime = Date.now()
      const users = await usersPage.getAllUsers()
      const responseTime = Date.now() - startTime
      
      expect(users).to.be.an('array')
      expect(users.length).to.be.above(0)
      expect(responseTime).to.be.below(config.performance.medium)
      
      testHelpers.logTestStep(`✅ Users API: ${users.length} users retrieved in ${responseTime}ms`)
    })

    it('should verify Posts API is accessible and responsive', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Posts API Health')
      
      const startTime = Date.now()
      const posts = await postsPage.getAllPosts()
      const responseTime = Date.now() - startTime
      
      expect(posts).to.be.an('array')
      expect(posts.length).to.be.above(0)
      expect(responseTime).to.be.below(config.performance.medium)
      
      testHelpers.logTestStep(`✅ Posts API: ${posts.length} posts retrieved in ${responseTime}ms`)
    })

    it('should verify Comments API is accessible and responsive', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Comments API Health')
      
      const startTime = Date.now()
      const comments = await commentsPage.getCommentsWithPagination(1, 20)
      const responseTime = Date.now() - startTime
      
      expect(comments).to.be.an('array')
      expect(comments.length).to.equal(20)
      expect(responseTime).to.be.below(config.performance.medium)
      
      testHelpers.logTestStep(`✅ Comments API: ${comments.length} comments retrieved in ${responseTime}ms`)
    })
  })

  describe('Core CRUD Operations', function () {
    it('should verify GET operations work for all entities', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Core GET Operations')
      
      // Test single entity retrieval
      const user = await usersPage.getUserById(1)
      expect(user.id).to.equal(1)
      
      const post = await postsPage.getPostById(1)
      expect(post.id).to.equal(1)
      
      const comment = await commentsPage.getCommentById(1)
      expect(comment.id).to.equal(1)
      
      testHelpers.logTestStep('✅ All GET operations successful')
    })

    it('should verify POST operations work for all entities', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Core POST Operations')
      
      // Test entity creation
      const newUser = await usersPage.createUser({
        name: 'Smoke Test User',
        username: 'smokeuser',
        email: 'smoke@test.com'
      })
      expect(newUser.id).to.be.a('number')
      
      const newPost = await postsPage.createPost({
        title: 'Smoke Test Post',
        body: 'Smoke test content',
        userId: 1
      })
      expect(newPost.id).to.be.a('number')
      
      const newComment = await commentsPage.createComment({
        name: 'Smoke Test Comment',
        email: 'smoke@test.com',
        body: 'Smoke test comment',
        postId: 1
      })
      expect(newComment.id).to.be.a('number')
      
      testHelpers.logTestStep('✅ All POST operations successful')
    })

    it('should verify PUT operations work for all entities', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Core PUT Operations')
      
      // Test entity updates
      const updatedUser = await usersPage.updateUser(1, {
        name: 'Updated Smoke User',
        username: 'updatedsmokeuser',
        email: 'updated@test.com'
      })
      expect(updatedUser.id).to.equal(1)
      expect(updatedUser.name).to.equal('Updated Smoke User')
      
      const updatedPost = await postsPage.updatePost(1, {
        title: 'Updated Smoke Post',
        body: 'Updated smoke content',
        userId: 1
      })
      expect(updatedPost.id).to.equal(1)
      expect(updatedPost.title).to.equal('Updated Smoke Post')
      
      const updatedComment = await commentsPage.updateComment(1, {
        name: 'Updated Smoke Comment',
        email: 'updated@test.com',
        body: 'Updated smoke comment',
        postId: 1
      })
      expect(updatedComment.id).to.equal(1)
      expect(updatedComment.name).to.equal('Updated Smoke Comment')
      
      testHelpers.logTestStep('✅ All PUT operations successful')
    })

    it('should verify DELETE operations work for all entities', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Core DELETE Operations')
      
      // Test entity deletion
      const deleteUserResponse = await usersPage.deleteUser(1)
      expect(deleteUserResponse.status).to.equal(200)
      
      const deletePostResponse = await postsPage.deletePost(1)
      expect(deletePostResponse.status).to.equal(200)
      
      const deleteCommentResponse = await commentsPage.deleteComment(1)
      expect(deleteCommentResponse.status).to.equal(200)
      
      testHelpers.logTestStep('✅ All DELETE operations successful')
    })
  })

  describe('Data Relationships', function () {
    it('should verify user-posts relationship', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: User-Posts Relationship')
      
      const userId = 1
      const user = await usersPage.getUserById(userId)
      const userPosts = await postsPage.getPostsByUserId(userId)
      
      expect(user.id).to.equal(userId)
      expect(userPosts).to.be.an('array')
      expect(userPosts.length).to.be.above(0)
      
      userPosts.forEach(post => {
        expect(post.userId).to.equal(userId)
      })
      
      testHelpers.logTestStep(`✅ User ${userId} has ${userPosts.length} posts`)
    })

    it('should verify post-comments relationship', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Post-Comments Relationship')
      
      const postId = 1
      const post = await postsPage.getPostById(postId)
      const postComments = await commentsPage.getCommentsByPostId(postId)
      
      expect(post.id).to.equal(postId)
      expect(postComments).to.be.an('array')
      expect(postComments.length).to.be.above(0)
      
      postComments.forEach(comment => {
        expect(comment.postId).to.equal(postId)
      })
      
      testHelpers.logTestStep(`✅ Post ${postId} has ${postComments.length} comments`)
    })
  })

  describe('Error Handling', function () {
    it('should handle 404 errors gracefully', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: 404 Error Handling')
      
      try {
        await usersPage.getUserById(9999)
        expect.fail('Should have thrown 404 error')
      } catch (error) {
        expect(error.response.status).to.equal(404)
      }
      
      try {
        await postsPage.getPostById(9999)
        expect.fail('Should have thrown 404 error')
      } catch (error) {
        expect(error.response.status).to.equal(404)
      }
      
      try {
        await commentsPage.getCommentById(9999)
        expect.fail('Should have thrown 404 error')
      } catch (error) {
        expect(error.response.status).to.equal(404)
      }
      
      testHelpers.logTestStep('✅ 404 errors handled correctly')
    })
  })

  describe('Performance Baseline', function () {
    it('should meet performance baselines for critical endpoints', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Performance Baselines')
      
      const performanceTests = [
        {
          name: 'Get All Users',
          test: () => usersPage.getAllUsers(),
          threshold: config.performance.medium
        },
        {
          name: 'Get User by ID',
          test: () => usersPage.getUserById(1),
          threshold: config.performance.fast
        },
        {
          name: 'Get Posts by User',
          test: () => postsPage.getPostsByUserId(1),
          threshold: config.performance.fast
        },
        {
          name: 'Get Comments by Post',
          test: () => commentsPage.getCommentsByPostId(1),
          threshold: config.performance.fast
        }
      ]
      
      for (const perfTest of performanceTests) {
        const startTime = Date.now()
        await perfTest.test()
        const responseTime = Date.now() - startTime
        
        expect(responseTime).to.be.below(perfTest.threshold, 
          `${perfTest.name} took ${responseTime}ms, expected < ${perfTest.threshold}ms`)
        
        testHelpers.logTestStep(`✅ ${perfTest.name}: ${responseTime}ms (< ${perfTest.threshold}ms)`)
      }
    })
  })

  describe('Data Integrity', function () {
    it('should verify basic data structure integrity', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Data Structure Integrity')
      
      // Check user structure
      const user = await usersPage.getUserById(1)
      expect(user).to.have.all.keys(['id', 'name', 'username', 'email', 'address', 'phone', 'website', 'company'])
      
      // Check post structure
      const post = await postsPage.getPostById(1)
      expect(post).to.have.all.keys(['userId', 'id', 'title', 'body'])
      
      // Check comment structure
      const comment = await commentsPage.getCommentById(1)
      expect(comment).to.have.all.keys(['postId', 'id', 'name', 'email', 'body'])
      
      testHelpers.logTestStep('✅ All data structures are intact')
    })

    it('should verify data type consistency', async function () {
      testHelpers.logTestStep('🔥 Smoke Test: Data Type Consistency')
      
      const user = await usersPage.getUserById(1)
      expect(user.id).to.be.a('number')
      expect(user.name).to.be.a('string')
      expect(user.email).to.be.a('string')
      
      const post = await postsPage.getPostById(1)
      expect(post.id).to.be.a('number')
      expect(post.userId).to.be.a('number')
      expect(post.title).to.be.a('string')
      
      const comment = await commentsPage.getCommentById(1)
      expect(comment.id).to.be.a('number')
      expect(comment.postId).to.be.a('number')
      expect(comment.email).to.be.a('string')
      
      testHelpers.logTestStep('✅ All data types are consistent')
    })
  })

  after(function () {
    testHelpers.logTestStep('🎉 Smoke Tests Completed Successfully!')
    console.log('\n='.repeat(50))
    console.log('🔥 SMOKE TEST SUMMARY 🔥')
    console.log('✅ All critical API endpoints are functional')
    console.log('✅ CRUD operations work correctly')
    console.log('✅ Data relationships are intact')
    console.log('✅ Error handling works as expected')
    console.log('✅ Performance meets baseline requirements')
    console.log('✅ Data integrity is maintained')
    console.log('='.repeat(50))
  })
})
