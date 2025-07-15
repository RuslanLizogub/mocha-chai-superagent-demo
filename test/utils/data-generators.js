/**
 * Test data generators and utilities
 */

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
function generateRandomString (length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate random email
 * @param {string} domain - Email domain
 * @returns {string} Random email
 */
function generateRandomEmail (domain = 'example.com') {
  const username = generateRandomString(8).toLowerCase()
  return `${username}@${domain}`
}

/**
 * Generate random number within range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
function generateRandomNumber (min = 1, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate random user data
 * @returns {Object} User object
 */
function generateRandomUser () {
  const firstName = generateRandomString(6)
  const lastName = generateRandomString(8)
  
  return {
    name: `${firstName} ${lastName}`,
    username: generateRandomString(8).toLowerCase(),
    email: generateRandomEmail(),
    phone: `${generateRandomNumber(100, 999)}-${generateRandomNumber(100, 999)}-${generateRandomNumber(1000, 9999)}`,
    website: `${generateRandomString(8).toLowerCase()}.com`,
    address: {
      street: `${generateRandomNumber(1, 9999)} ${generateRandomString(8)} St`,
      suite: `Apt. ${generateRandomNumber(1, 999)}`,
      city: generateRandomString(8),
      zipcode: `${generateRandomNumber(10000, 99999)}`,
      geo: {
        lat: (Math.random() * 180 - 90).toFixed(4),
        lng: (Math.random() * 360 - 180).toFixed(4)
      }
    },
    company: {
      name: `${generateRandomString(8)} Inc`,
      catchPhrase: `${generateRandomString(5)} ${generateRandomString(7)} ${generateRandomString(6)}`,
      bs: `${generateRandomString(6)} ${generateRandomString(8)} ${generateRandomString(7)}`
    }
  }
}

/**
 * Generate random post data
 * @param {number} userId - User ID
 * @returns {Object} Post object
 */
function generateRandomPost (userId = 1) {
  return {
    title: generateRandomString(20),
    body: generateRandomString(100),
    userId: userId
  }
}

/**
 * Generate random comment data
 * @param {number} postId - Post ID
 * @returns {Object} Comment object
 */
function generateRandomComment (postId = 1) {
  return {
    name: generateRandomString(15),
    email: generateRandomEmail(),
    body: generateRandomString(80),
    postId: postId
  }
}

/**
 * Generate invalid data sets for negative testing
 */
const invalidDataSets = {
  user: {
    emptyName: { name: '', username: 'test', email: 'test@example.com' },
    invalidEmail: { name: 'Test User', username: 'test', email: 'invalid-email' },
    longName: { name: 'a'.repeat(1000), username: 'test', email: 'test@example.com' },
    specialChars: { name: '!@#$%^&*()', username: '!@#$%', email: 'test@example.com' },
    nullValues: { name: null, username: null, email: null }
  },
  post: {
    emptyTitle: { title: '', body: 'Test body', userId: 1 },
    emptyBody: { title: 'Test title', body: '', userId: 1 },
    invalidUserId: { title: 'Test title', body: 'Test body', userId: 'invalid' },
    negativeUserId: { title: 'Test title', body: 'Test body', userId: -1 },
    nullValues: { title: null, body: null, userId: null }
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
function isValidUrl (url) {
  try {
    new URL(url) // eslint-disable-line no-new
    return true
  } catch {
    return false
  }
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

module.exports = {
  generateRandomString,
  generateRandomEmail,
  generateRandomNumber,
  generateRandomUser,
  generateRandomPost,
  generateRandomComment,
  invalidDataSets,
  isValidEmail,
  isValidUrl,
  deepClone
}
