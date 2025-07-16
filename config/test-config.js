// Base configuration for API tests
const config = {
  // Base URLs for different environments
  baseUrls: {
    jsonplaceholder: 'https://jsonplaceholder.typicode.com',
    reqres: 'https://reqres.in/api'
  },

  // Default timeout for requests
  timeout: 10000,

  // Default headers
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  // Test data
  testData: {
    users: {
      validUser: {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org'
      },
      invalidUser: {
        name: '',
        username: '',
        email: 'invalid-email',
        phone: '',
        website: ''
      }
    },
    posts: {
      validPost: {
        title: 'Test Post Title',
        body: 'This is a test post body content for API testing.',
        userId: 1
      },
      invalidPost: {
        title: '',
        body: '',
        userId: null
      }
    }
  },

  // Expected response times (in milliseconds)
  performance: {
    fast: 500,
    medium: 1500, // Increased to accommodate network latency
    slow: 3000
  }
}

module.exports = config
