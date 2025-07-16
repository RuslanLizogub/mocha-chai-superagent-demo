/**
 * API Clients Index
 * Centralized export for all API clients
 */

const postsApi = require('./posts.api')
const usersApi = require('./users.api')
const commentsApi = require('./comments.api')

module.exports = {
  postsApi,
  usersApi,
  commentsApi
} 