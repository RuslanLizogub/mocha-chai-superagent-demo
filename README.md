# Mocha, Chai & SuperAgent API Testing Framework

🚀 **Professional API Testing Framework** demonstrating best practices for API test automation using Mocha, Chai, SuperAgent, and API Client pattern.

## 📋 Table of Contents

- [Description](#-description)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Installation](#-installation)
- [Running Tests](#-running-tests)
- [Project Structure](#-project-structure)
- [API Client Pattern](#-api-client-pattern)
- [Configuration](#️-configuration)
- [Usage Examples](#-usage-examples)
- [Best Practices](#-best-practices)
- [Extending the Framework](#-extending-the-framework)
- [Metrics and Reporting](#-metrics-and-reporting)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Description

This project is a full-featured API testing framework built on modern JavaScript technologies. The framework uses JSONPlaceholder API as a test API and demonstrates a professional approach to test automation using the API Client pattern specifically designed for API testing.

## ✨ Features

- 🏗️ **API Client Pattern** - Structured architecture with separation of concerns for API testing
- 🧪 **Complete CRUD Coverage** - Create, Read, Update, Delete tests
- 🎭 **Multiple Test Types** - Smoke, Regression, Integration, Performance
- 🔧 **Reusable Utilities** - Data generators, helpers, validators
- 📊 **Detailed Reporting** - Mocha reporters with comprehensive logs
- ⚡ **Performance** - Parallel execution and response time checks
- 🛡️ **Error Handling** - Graceful error handling and negative testing
- 🔍 **Data Validation** - Schema validation and data integrity checks
- 📋 **Linting** - ESLint for code quality
- 🏷️ **Test Tags** - Flexible test execution management

## 🏛️ Architecture

```
test/
├── api/                    # API tests by entities
│   ├── users.test.js      # User tests
│   ├── posts.test.js      # Post tests
│   └── comments.test.js   # Comment tests
├── integration/           # Integration tests
├── smoke/                 # Smoke tests
├── api-clients/          # API client classes
│   ├── base-api.js       # Base API client
│   ├── users.api.js      # Users API client
│   ├── posts.api.js      # Posts API client
│   ├── comments.api.js   # Comments API client
│   └── index.js          # API clients exports
├── utils/                 # Utilities and helpers
│   ├── http-client.js     # HTTP client
│   ├── data-generators.js # Test data generators
│   └── test-helpers.js    # Helper functions
└── setup/                 # Test setup
    └── test-setup.js      # Global settings
```

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mocha-chai-superagent-demo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify installation:**
   ```bash
   npm run lint
   ```

## 🧪 Running Tests

### All tests
```bash
npm test
```

### Smoke tests (critical)
```bash
npm run test:smoke
```

### Regression tests
```bash
npm run test:regression
```

### Integration tests
```bash
npm run test:integration
```

### API tests only
```bash
npm run test:api
```

### Tests in watch mode
```bash
npm run test:watch
```

### Generate reports
```bash
# JSON report
npm run test:json

# HTML report
npm run test:html

# JUnit XML report (for CI/CD)
npm run test:junit
```

### Code quality
```bash
# Check linting
npm run lint:check

# Fix linting issues
npm run lint

# Clean reports and artifacts
npm run clean
```

### Run individual test files
```bash
# Only user tests
npx mocha test/api/users.test.js

# Only integration tests
npx mocha test/integration/api-integration.test.js
```

## 📁 Project Structure

### Configuration Files

- **`.mocharc.json`** - Mocha configuration
- **`.eslintrc.json`** - Linting rules
- **`config/test-config.js`** - Main test configuration

### Main Components

#### HTTP Client (`test/utils/http-client.js`)
SuperAgent wrapper with:
- Automatic header addition
- Error handling
- Response time measurement
- Support for all HTTP methods

#### API Clients (`test/api-clients/`)
Encapsulate API logic:
- **BaseApiClient** - Base class with common functionality
- **UsersApiClient** - User operations
- **PostsApiClient** - Post operations
- **CommentsApiClient** - Comment operations

#### Data Generators (`test/utils/data-generators.js`)
- Random data generation for tests
- Invalid data sets for negative testing
- Validation utilities

## 🎭 API Client Pattern

### Usage Example

```javascript
const { usersApi } = require('../api-clients')

describe('Users API', function() {
  it('should get all users', async function() {
    const users = await usersApi.getAll()
    expect(users).to.be.an('array')
  })

  it('should create user', async function() {
    const userData = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com'
    }
    
    const newUser = await usersApi.create(userData)
    expect(newUser.id).to.be.a('number')
  })
})
```

### API Client Methods

#### UsersApiClient
- `getAll()` - Get all users
- `getById(id)` - Get user by ID
- `create(userData)` - Create user
- `update(id, userData)` - Update user
- `delete(id)` - Delete user
- `getPosts(id)` - Get user posts

#### PostsApiClient
- `getAll()` - Get all posts
- `getById(id)` - Get post by ID
- `create(postData)` - Create post
- `getByUserId(userId)` - Get posts by user ID
- `getComments(postId)` - Get post comments

#### CommentsApiClient
- `getAll()` - Get all comments
- `getById(id)` - Get comment by ID
- `create(commentData)` - Create comment
- `getByPostId(postId)` - Get comments by post ID

## ⚙️ Configuration

### Main Configuration (`config/test-config.js`)

```javascript
const config = {
  baseUrls: {
    jsonplaceholder: 'https://jsonplaceholder.typicode.com',
    reqres: 'https://reqres.in/api'
  },
  timeout: 10000,
  performance: {
    fast: 500,
    medium: 1000,
    slow: 3000
  }
}
```

### Environment Setup

You can easily switch between different APIs or environments by changing the base URLs in the configuration.

## 💡 Usage Examples

### Creating tests with data generation

```javascript
const { generateRandomUser } = require('../utils/data-generators')

it('should create user with random data', async function() {
  const userData = generateRandomUser()
  const newUser = await usersApi.create(userData)
  
  expect(newUser.name).to.equal(userData.name)
  expect(newUser.email).to.equal(userData.email)
})
```

### Performance test

```javascript
it('should respond quickly', async function() {
  const users = await usersApi.getAllWithPerformanceCheck(500)
  
  expect(users).to.be.an('array')
})
```

### Schema validation

```javascript
it('should validate user schema', async function() {
  const user = await usersApi.getById(1)
  
  // Schema validation is automatically performed in API clients
  expect(user).to.have.all.keys(['id', 'name', 'username', 'email', 'address', 'phone', 'website', 'company'])
})
```

### Integration test

```javascript
it('should test user-posts-comments flow', async function() {
  // Get user
  const user = await usersApi.getById(1)
  
  // Get user's posts
  const posts = await postsApi.getByUserId(user.id)
  
  // Get comments for first post
  const comments = await commentsApi.getByPostId(posts[0].id)
  
  expect(comments).to.be.an('array')
})
```

## 🏆 Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests in `describe` blocks
- Add tags (@smoke, @regression) for execution management

### 2. Test Data
- Use generators to create test data
- Don't rely on existing data in API
- Clean up created data after tests (if API supports)

### 3. Error Handling
- Test both successful and unsuccessful scenarios
- Check proper error codes
- Validate error structure

### 4. Performance
- Set reasonable timeouts
- Measure response times
- Use parallel execution where possible

### 5. Maintenance
- Add logging for debugging
- Use clear error messages
- Document complex logic

### 6. API Client Pattern
- One client per API resource
- Consistent method naming (getAll, getById, create, update, delete)
- Built-in validation and error handling
- Reusable across test files

## 🔧 Extending the Framework

### Adding a new API
1. Create a new API client class extending BaseApiClient
2. Add base URL to configuration
3. Create tests for the new API

### Adding a new validation type
1. Add a new method to `schemaValidations`
2. Use in API clients
3. Cover with tests

### Adding new utilities
1. Create a new file in `test/utils/`
2. Export functions
3. Import where needed

## 📈 Metrics and Reporting

The framework supports various types of reports:
- **Console output** - Detailed logs in console
- **JSON reports** - Machine-readable reports
- **JUnit XML** - For CI/CD integration (extension)
- **HTML reports** - Beautiful reports (extension)

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Add tests for new features
4. Make sure all tests pass
5. Create a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file.

---

**🎯 This framework demonstrates a professional approach to API testing using the API Client pattern and can serve as a foundation for real projects.**
