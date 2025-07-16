const { commentsApi } = require('../api-clients')
const { generateRandomComment } = require('../utils/data-generators')
const { testHelpers } = require('../utils/test-helpers')
const config = require('../../config/test-config')

describe('Comments API Tests', function () {
  before(function () {
    testHelpers.logTestStep('Initializing Comments API Tests')
  })

  describe('GET /comments', function () {
    it('@smoke should get all comments successfully', async function () {
      testHelpers.logTestStep('Getting all comments')
      
      const comments = await commentsApi.getAll()
      
      expect(comments).to.have.length(500) // JSONPlaceholder has 500 comments
      comments.forEach(comment => {
        expect(comment).to.have.all.keys(['postId', 'id', 'name', 'email', 'body'])
        expect(comment.postId).to.be.a('number').and.be.at.least(1)
        expect(comment.name).to.be.a('string').that.is.not.empty
        expect(comment.email).to.be.a('string').that.includes('@')
        expect(comment.body).to.be.a('string').that.is.not.empty
      })
    })

    it('@performance should get all comments within performance threshold', async function () {
      testHelpers.logTestStep('Testing comments API performance')
      
      const comments = await commentsApi.getAllWithPerformanceCheck(config.performance.medium)
      
      expect(comments).to.have.length.above(0)
    })

    it('@regression should get comments with pagination', async function () {
      const page = 1
      const limit = 20
      testHelpers.logTestStep(`Getting comments with pagination: page ${page}, limit ${limit}`)
      
      const comments = await commentsApi.getWithPagination(page, limit)
      
      expect(comments).to.have.length(limit)
    })

    it('@regression should get comments sorted by email', async function () {
      testHelpers.logTestStep('Getting comments sorted by email')
      
      const comments = await commentsApi.getSorted('email', 'asc')
      
      expect(comments).to.be.an('array')
      // Verify sorting for first few items
      for (let i = 1; i < Math.min(comments.length, 5); i++) {
        expect(comments[i].email.localeCompare(comments[i - 1].email)).to.be.at.least(0)
      }
    })
  })

  describe('GET /comments/:id', function () {
    it('@smoke should get comment by valid ID', async function () {
      const commentId = 1
      testHelpers.logTestStep(`Getting comment with ID: ${commentId}`)
      
      const comment = await commentsApi.getById(commentId)
      
      expect(comment.id).to.equal(commentId)
      expect(comment.name).to.be.a('string').that.is.not.empty
      expect(comment.email).to.be.a('string').that.includes('@')
      expect(comment.body).to.be.a('string').that.is.not.empty
      expect(comment.postId).to.be.a('number').and.be.at.least(1)
    })

    it('@regression should return 404 for non-existent comment', async function () {
      const invalidCommentId = 9999
      testHelpers.logTestStep(`Testing non-existent comment ID: ${invalidCommentId}`)
      
      const errorResponse = await commentsApi.verifyNotFound(invalidCommentId)
      
      expect(errorResponse.status).to.equal(404)
    })

    it('@regression should handle boundary values', async function () {
      testHelpers.logTestStep('Testing boundary comment IDs')
      
      // Test first comment
      const firstComment = await commentsApi.getById(1)
      expect(firstComment.id).to.equal(1)
      
      // Test last comment
      const lastComment = await commentsApi.getById(500)
      expect(lastComment.id).to.equal(500)
    })
  })

  describe('POST /comments', function () {
    it('@smoke should create comment with valid data', async function () {
      const commentData = generateRandomComment(1)
      testHelpers.logTestStep(`Creating comment: ${commentData.name}`)
      
      const createdComment = await commentsApi.create(commentData)
      
      expect(createdComment.id).to.be.a('number')
      expect(createdComment.name).to.equal(commentData.name)
      expect(createdComment.email).to.equal(commentData.email)
      expect(createdComment.body).to.equal(commentData.body)
      expect(createdComment.postId).to.equal(commentData.postId)
    })

    it('@regression should create comment with minimal data', async function () {
      const minimalComment = {
        name: 'Test Comment',
        email: 'test@example.com',
        body: 'Test comment body',
        postId: 1
      }
      testHelpers.logTestStep('Creating comment with minimal data')
      
      const createdComment = await commentsApi.create(minimalComment)
      
      expect(createdComment.name).to.equal(minimalComment.name)
      expect(createdComment.email).to.equal(minimalComment.email)
    })

    it('@regression should validate email format on creation', async function () {
      const commentData = generateRandomComment(1)
      testHelpers.logTestStep('Validating email format in comment creation')
      
      const createdComment = await commentsApi.create(commentData)
      
      commentsApi.validateEmail(createdComment)
    })
  })

  describe('PUT /comments/:id', function () {
    it('@smoke should update comment successfully', async function () {
      const commentId = 1
      const updatedData = generateRandomComment(2)
      testHelpers.logTestStep(`Updating comment ID: ${commentId}`)
      
      const updatedComment = await commentsApi.update(commentId, updatedData)
      
      expect(updatedComment.id).to.equal(commentId)
      expect(updatedComment.name).to.equal(updatedData.name)
      expect(updatedComment.email).to.equal(updatedData.email)
      expect(updatedComment.body).to.equal(updatedData.body)
      expect(updatedComment.postId).to.equal(updatedData.postId)
    })

    it('@regression should update non-existent comment', async function () {
      const invalidCommentId = 9999
      const commentData = generateRandomComment(1)
      testHelpers.logTestStep(`Updating non-existent comment ID: ${invalidCommentId}`)
      
      try {
        // JSONPlaceholder will return the data with the provided ID
        const result = await commentsApi.update(invalidCommentId, commentData)
        expect(result.id).to.equal(invalidCommentId)
      } catch (error) {
        // JSONPlaceholder sometimes returns 500 for non-existent resources
        expect(error.response.status).to.be.oneOf([200, 500])
        console.log('Note: JSONPlaceholder returned error for non-existent comment update')
      }
    })
  })

  describe('PATCH /comments/:id', function () {
    it('@smoke should partially update comment', async function () {
      const commentId = 1
      const partialData = { name: 'Updated Comment Name' }
      testHelpers.logTestStep(`Partially updating comment ID: ${commentId}`)
      
      const updatedComment = await commentsApi.patch(commentId, partialData)
      
      expect(updatedComment.id).to.equal(commentId)
      expect(updatedComment.name).to.equal(partialData.name)
    })

    it('@regression should patch email field', async function () {
      const commentId = 2
      const partialData = { email: 'updated@example.com' }
      testHelpers.logTestStep(`Patching email for comment ID: ${commentId}`)
      
      const updatedComment = await commentsApi.patch(commentId, partialData)
      
      expect(updatedComment.email).to.equal(partialData.email)
      commentsApi.validateEmail(updatedComment)
    })
  })

  describe('DELETE /comments/:id', function () {
    it('@smoke should delete comment successfully', async function () {
      const commentId = 1
      testHelpers.logTestStep(`Deleting comment ID: ${commentId}`)
      
      const response = await commentsApi.delete(commentId)
      
      expect(response.status).to.equal(200)
    })

    it('@regression should handle deletion of non-existent comment', async function () {
      const invalidCommentId = 9999
      testHelpers.logTestStep(`Deleting non-existent comment ID: ${invalidCommentId}`)
      
      // JSONPlaceholder returns 200 even for non-existent resources
      const response = await commentsApi.delete(invalidCommentId)
      expect(response.status).to.equal(200)
    })
  })

  describe('Comments Filtering and Search', function () {
    it('@regression should get comments by post ID', async function () {
      const postId = 1
      testHelpers.logTestStep(`Getting comments for post ID: ${postId}`)
      
      const comments = await commentsApi.getByPostId(postId)
      
      expect(comments).to.be.an('array')
      expect(comments).to.have.length(5) // Each post has 5 comments
      comments.forEach(comment => {
        expect(comment.postId).to.equal(postId)
      })
    })

    it('@regression should search comments by email', async function () {
      const searchEmail = 'hildegard.org'
      testHelpers.logTestStep(`Searching comments by email: ${searchEmail}`)
      
      const comments = await commentsApi.searchByEmail(searchEmail)
      
      expect(comments).to.be.an('array')
      comments.forEach(comment => {
        expect(comment.email.toLowerCase()).to.include(searchEmail.toLowerCase())
      })
    })

    it('@regression should get comments statistics for post', async function () {
      const postId = 1
      testHelpers.logTestStep(`Getting comment statistics for post ID: ${postId}`)
      
      const stats = await commentsApi.getStatistics(postId)
      
      expect(stats).to.have.all.keys(['total', 'uniqueEmails', 'averageBodyLength', 'longestComment', 'shortestComment'])
      expect(stats.total).to.equal(5)
      expect(stats.uniqueEmails).to.be.a('number').and.be.at.least(1)
      expect(stats.averageBodyLength).to.be.a('number').and.be.above(0)
      expect(stats.longestComment).to.be.an('object')
      expect(stats.shortestComment).to.be.an('object')
    })
  })

  describe('Comments Data Validation', function () {
    it('@regression should validate comment email formats', async function () {
      testHelpers.logTestStep('Validating comment email formats')
      
      const comments = await commentsApi.getWithPagination(1, 20)
      
      comments.forEach(comment => {
        expect(comment.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      })
    })

    it('@regression should validate comment structure', async function () {
      testHelpers.logTestStep('Validating comment data structure')
      
      const comments = await commentsApi.getWithPagination(1, 10)
      
      comments.forEach(comment => {
        expect(comment.postId).to.be.a('number').and.be.within(1, 100)
        expect(comment.id).to.be.a('number').and.be.above(0)
        expect(comment.name).to.be.a('string').and.have.length.above(0)
        expect(comment.email).to.be.a('string').and.have.length.above(0)
        expect(comment.body).to.be.a('string').and.have.length.above(0)
      })
    })

    it('@regression should validate name length constraints', async function () {
      testHelpers.logTestStep('Validating comment name lengths')
      
      const comments = await commentsApi.getWithPagination(1, 10)
      
      comments.forEach(comment => {
        expect(comment.name.length).to.be.within(1, 100) // Reasonable name length
      })
    })

    it('@regression should validate body content quality', async function () {
      testHelpers.logTestStep('Validating comment body content')
      
      const comments = await commentsApi.getWithPagination(1, 10)
      
      comments.forEach(comment => {
        expect(comment.body.length).to.be.above(10) // Body should have meaningful content
        expect(comment.body.trim()).to.equal(comment.body) // No leading/trailing whitespace
        expect(comment.body).to.not.match(/^\s*$/) // Not just whitespace
      })
    })
  })

  describe('Comments Relationships', function () {
    it('@regression should validate post-comment relationship', async function () {
      testHelpers.logTestStep('Validating post-comment relationships')
      
      const postId = 5
      const comments = await commentsApi.getByPostId(postId)
      
      comments.forEach(comment => {
        expect(comment.postId).to.equal(postId)
      })
    })

    it('@regression should verify comment distribution across posts', async function () {
      testHelpers.logTestStep('Verifying comment distribution across posts')
      
      const postIds = [1, 2, 3, 4, 5]
      const commentCounts = []
      
      for (const postId of postIds) {
        const comments = await commentsApi.getByPostId(postId)
        commentCounts.push(comments.length)
      }
      
      // All posts should have the same number of comments (5 each)
      commentCounts.forEach(count => {
        expect(count).to.equal(5)
      })
    })
  })

  describe('Comments Performance', function () {
    it('@performance should handle multiple comment requests efficiently', async function () {
      testHelpers.logTestStep('Testing multiple comment requests performance')
      
      const startTime = Date.now()
      
      const promises = []
      for (let i = 1; i <= 5; i++) {
        promises.push(commentsApi.getByPostId(i))
      }
      
      const results = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      expect(totalTime).to.be.below(config.performance.slow)
      expect(results).to.have.length(5)
      results.forEach(comments => {
        expect(comments).to.have.length(5)
      })
    })
  })
})
