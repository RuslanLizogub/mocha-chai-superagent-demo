const { PostsPageObject } = require('../page-objects')
const { generateRandomPost, invalidDataSets } = require('../utils/data-generators')
const { testHelpers } = require('../utils/test-helpers')
const config = require('../../config/test-config')

describe('Posts API Tests', function () {
  let postsPage

  before(function () {
    postsPage = new PostsPageObject()
    testHelpers.logTestStep('Initializing Posts API Tests')
  })

  describe('GET /posts', function () {
    it('@smoke should get all posts successfully', async function () {
      testHelpers.logTestStep('Getting all posts')
      
      const posts = await postsPage.getAllPosts()
      
      expect(posts).to.have.length(100) // JSONPlaceholder has 100 posts
      posts.forEach(post => {
        expect(post).to.have.all.keys(['userId', 'id', 'title', 'body'])
        expect(post.userId).to.be.a('number').and.be.at.least(1)
        expect(post.title).to.be.a('string').that.is.not.empty
        expect(post.body).to.be.a('string').that.is.not.empty
      })
    })

    it('@performance should get all posts within performance threshold', async function () {
      testHelpers.logTestStep('Testing posts API performance')
      
      const posts = await postsPage.getAllPostsWithPerformanceCheck(config.performance.medium)
      
      expect(posts).to.have.length.above(0)
    })

    it('@regression should get posts with pagination', async function () {
      const page = 1
      const limit = 10
      testHelpers.logTestStep(`Getting posts with pagination: page ${page}, limit ${limit}`)
      
      const posts = await postsPage.getPostsWithPagination(page, limit)
      
      expect(posts).to.have.length(limit)
      posts.forEach(post => {
        expect(post.id).to.be.at.most(limit)
      })
    })

    it('@regression should get posts sorted by title', async function () {
      testHelpers.logTestStep('Getting posts sorted by title')
      
      const posts = await postsPage.getPostsSorted('title', 'asc')
      
      expect(posts).to.be.an('array')
      // Verify sorting
      for (let i = 1; i < Math.min(posts.length, 10); i++) {
        expect(posts[i].title.localeCompare(posts[i - 1].title)).to.be.at.least(0)
      }
    })
  })

  describe('GET /posts/:id', function () {
    it('@smoke should get post by valid ID', async function () {
      const postId = 1
      testHelpers.logTestStep(`Getting post with ID: ${postId}`)
      
      const post = await postsPage.getPostById(postId)
      
      expect(post.id).to.equal(postId)
      expect(post.title).to.be.a('string').that.is.not.empty
      expect(post.body).to.be.a('string').that.is.not.empty
      expect(post.userId).to.be.a('number').and.be.at.least(1)
    })

    it('@regression should return 404 for non-existent post', async function () {
      const invalidPostId = 9999
      testHelpers.logTestStep(`Testing non-existent post ID: ${invalidPostId}`)
      
      const errorResponse = await postsPage.verifyPostNotFound(invalidPostId)
      
      expect(errorResponse.status).to.equal(404)
    })

    it('@regression should handle boundary values', async function () {
      testHelpers.logTestStep('Testing boundary post IDs')
      
      // Test first post
      const firstPost = await postsPage.getPostById(1)
      expect(firstPost.id).to.equal(1)
      
      // Test last post
      const lastPost = await postsPage.getPostById(100)
      expect(lastPost.id).to.equal(100)
    })
  })

  describe('POST /posts', function () {
    it('@smoke should create post with valid data', async function () {
      const postData = generateRandomPost(1)
      testHelpers.logTestStep(`Creating post: ${postData.title}`)
      
      const createdPost = await postsPage.createPost(postData)
      
      expect(createdPost.id).to.be.a('number')
      expect(createdPost.title).to.equal(postData.title)
      expect(createdPost.body).to.equal(postData.body)
      expect(createdPost.userId).to.equal(postData.userId)
    })

    it('@regression should create post with minimal data', async function () {
      const minimalPost = {
        title: 'Test Title',
        body: 'Test Body',
        userId: 1
      }
      testHelpers.logTestStep('Creating post with minimal data')
      
      const createdPost = await postsPage.createPost(minimalPost)
      
      expect(createdPost.title).to.equal(minimalPost.title)
      expect(createdPost.body).to.equal(minimalPost.body)
      expect(createdPost.userId).to.equal(minimalPost.userId)
    })

    it('@regression should handle creation with empty title', async function () {
      const invalidPostData = { ...generateRandomPost(1), ...invalidDataSets.post.emptyTitle }
      testHelpers.logTestStep('Testing post creation with empty title')
      
      try {
        await postsPage.createPostWithInvalidData(invalidPostData)
      } catch (error) {
        // JSONPlaceholder doesn't validate, so this might pass
        console.log('Note: JSONPlaceholder accepts empty titles')
      }
    })

    it('@regression should handle creation with invalid userId', async function () {
      const invalidPostData = { ...generateRandomPost(1), ...invalidDataSets.post.invalidUserId }
      testHelpers.logTestStep('Testing post creation with invalid userId')
      
      try {
        await postsPage.createPostWithInvalidData(invalidPostData)
      } catch (error) {
        // JSONPlaceholder doesn't validate, so this might pass
        console.log('Note: JSONPlaceholder accepts invalid userIds')
      }
    })
  })

  describe('PUT /posts/:id', function () {
    it('@smoke should update post successfully', async function () {
      const postId = 1
      const updatedData = generateRandomPost(2)
      testHelpers.logTestStep(`Updating post ID: ${postId}`)
      
      const updatedPost = await postsPage.updatePost(postId, updatedData)
      
      expect(updatedPost.id).to.equal(postId)
      expect(updatedPost.title).to.equal(updatedData.title)
      expect(updatedPost.body).to.equal(updatedData.body)
      expect(updatedPost.userId).to.equal(updatedData.userId)
    })

    it('@regression should update non-existent post', async function () {
      const invalidPostId = 9999
      const postData = generateRandomPost(1)
      testHelpers.logTestStep(`Updating non-existent post ID: ${invalidPostId}`)
      
      // JSONPlaceholder will return the data with the provided ID
      const result = await postsPage.updatePost(invalidPostId, postData)
      expect(result.id).to.equal(invalidPostId)
    })
  })

  describe('PATCH /posts/:id', function () {
    it('@smoke should partially update post', async function () {
      const postId = 1
      const partialData = { title: 'Updated Title' }
      testHelpers.logTestStep(`Partially updating post ID: ${postId}`)
      
      const updatedPost = await postsPage.patchPost(postId, partialData)
      
      expect(updatedPost.id).to.equal(postId)
      expect(updatedPost.title).to.equal(partialData.title)
    })

    it('@regression should patch multiple fields', async function () {
      const postId = 2
      const partialData = {
        title: 'New Title',
        body: 'New Body Content'
      }
      testHelpers.logTestStep(`Patching multiple fields for post ID: ${postId}`)
      
      const updatedPost = await postsPage.patchPost(postId, partialData)
      
      expect(updatedPost.title).to.equal(partialData.title)
      expect(updatedPost.body).to.equal(partialData.body)
    })
  })

  describe('DELETE /posts/:id', function () {
    it('@smoke should delete post successfully', async function () {
      const postId = 1
      testHelpers.logTestStep(`Deleting post ID: ${postId}`)
      
      const response = await postsPage.deletePost(postId)
      
      expect(response.status).to.equal(200)
    })

    it('@regression should handle deletion of non-existent post', async function () {
      const invalidPostId = 9999
      testHelpers.logTestStep(`Deleting non-existent post ID: ${invalidPostId}`)
      
      // JSONPlaceholder returns 200 even for non-existent resources
      const response = await postsPage.deletePost(invalidPostId)
      expect(response.status).to.equal(200)
    })
  })

  describe('Posts Filtering and Search', function () {
    it('@regression should get posts by user ID', async function () {
      const userId = 1
      testHelpers.logTestStep(`Getting posts for user ID: ${userId}`)
      
      const posts = await postsPage.getPostsByUserId(userId)
      
      expect(posts).to.be.an('array')
      expect(posts).to.have.length(10) // Each user has 10 posts
      posts.forEach(post => {
        expect(post.userId).to.equal(userId)
      })
    })

    it('@regression should search posts by title', async function () {
      const searchTitle = 'qui'
      testHelpers.logTestStep(`Searching posts by title: ${searchTitle}`)
      
      const posts = await postsPage.searchPostsByTitle(searchTitle)
      
      expect(posts).to.be.an('array')
      posts.forEach(post => {
        expect(post.title.toLowerCase()).to.include(searchTitle.toLowerCase())
      })
    })

    it('@regression should get post comments', async function () {
      const postId = 1
      testHelpers.logTestStep(`Getting comments for post ID: ${postId}`)
      
      const comments = await postsPage.getPostComments(postId)
      
      expect(comments).to.be.an('array')
      expect(comments).to.have.length(5) // Each post has 5 comments
      comments.forEach(comment => {
        expect(comment.postId).to.equal(postId)
        expect(comment).to.have.all.keys(['postId', 'id', 'name', 'email', 'body'])
      })
    })
  })

  describe('Posts Data Validation', function () {
    it('@regression should validate post structure', async function () {
      testHelpers.logTestStep('Validating post data structure')
      
      const posts = await postsPage.getAllPosts()
      
      posts.slice(0, 10).forEach(post => {
        expect(post.userId).to.be.a('number').and.be.within(1, 10)
        expect(post.id).to.be.a('number').and.be.above(0)
        expect(post.title).to.be.a('string').and.have.length.above(0)
        expect(post.body).to.be.a('string').and.have.length.above(0)
      })
    })

    it('@regression should validate title length constraints', async function () {
      testHelpers.logTestStep('Validating post title lengths')
      
      const posts = await postsPage.getAllPosts()
      
      posts.slice(0, 10).forEach(post => {
        expect(post.title.length).to.be.within(1, 200) // Reasonable title length
      })
    })

    it('@regression should validate body content', async function () {
      testHelpers.logTestStep('Validating post body content')
      
      const posts = await postsPage.getAllPosts()
      
      posts.slice(0, 10).forEach(post => {
        expect(post.body.length).to.be.above(10) // Body should have meaningful content
        expect(post.body.trim()).to.equal(post.body) // No leading/trailing whitespace
      })
    })
  })

  describe('Posts Relationships', function () {
    it('@regression should validate user-post relationship', async function () {
      testHelpers.logTestStep('Validating user-post relationships')
      
      const posts = await postsPage.getPostsByUserId(1)
      
      posts.forEach(post => {
        expect(post.userId).to.equal(1)
      })
    })

    it('@regression should validate post-comment relationship', async function () {
      testHelpers.logTestStep('Validating post-comment relationships')
      
      const postId = 1
      const comments = await postsPage.getPostComments(postId)
      
      comments.forEach(comment => {
        expect(comment.postId).to.equal(postId)
      })
    })
  })
})
