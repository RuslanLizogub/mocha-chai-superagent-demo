/**
 * Page Objects Index
 * Centralized export for all page objects
 */

const BasePageObject = require('./base-page-object')
const UsersPageObject = require('./users-page-object')
const PostsPageObject = require('./posts-page-object')
const CommentsPageObject = require('./comments-page-object')

module.exports = {
  BasePageObject,
  UsersPageObject,
  PostsPageObject,
  CommentsPageObject
}
