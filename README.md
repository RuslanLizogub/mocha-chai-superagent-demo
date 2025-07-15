# Mocha, Chai & SuperAgent API Testing Framework

🚀 **Professional API Testing Framework** demonstrating best practices for API test automation using Mocha, Chai, SuperAgent, and PageObject pattern.

## 📋 Table of Contents

- [Description](#-description)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Installation](#-installation)
- [Running Tests](#-running-tests)
- [Project Structure](#-project-structure)
- [PageObject Pattern](#-pageobject-pattern)
- [Configuration](#️-configuration)
- [Usage Examples](#-usage-examples)
- [Best Practices](#-best-practices)
- [Extending the Framework](#-extending-the-framework)
- [Metrics and Reporting](#-metrics-and-reporting)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Description

This project is a full-featured API testing framework built on modern JavaScript technologies. The framework uses JSONPlaceholder API as a test API and demonstrates a professional approach to test automation.

## ✨ Features

- 🏗️ **PageObject Pattern** - Structured architecture with separation of concerns
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
├── page-objects/          # PageObject classes
│   ├── base-page-object.js
│   ├── users-page-object.js
│   ├── posts-page-object.js
│   └── comments-page-object.js
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

#### PageObjects (`test/page-objects/`)
Encapsulate API logic:
- **BasePageObject** - Base class with common functionality
- **UsersPageObject** - User operations
- **PostsPageObject** - Post operations
- **CommentsPageObject** - Comment operations

#### Data Generators (`test/utils/data-generators.js`)
- Random data generation for tests
- Invalid data sets for negative testing
- Validation utilities

## 🎭 PageObject Pattern

### Usage Example

```javascript
const { UsersPageObject } = require('../page-objects')

describe('Users API', function() {
  let usersPage

  before(function() {
    usersPage = new UsersPageObject()
  })

  it('should get all users', async function() {
    const users = await usersPage.getAllUsers()
    expect(users).to.be.an('array')
  })

  it('should create user', async function() {
    const userData = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com'
    }
    
    const newUser = await usersPage.createUser(userData)
    expect(newUser.id).to.be.a('number')
  })
})
```

### PageObject Methods

#### UsersPageObject
- `getAllUsers()` - Get all users
- `getUserById(id)` - Get user by ID
- `createUser(userData)` - Create user
- `updateUser(id, userData)` - Update user
- `deleteUser(id)` - Delete user
- `getUserPosts(id)` - Get user posts

#### PostsPageObject
- `getAllPosts()` - Get all posts
- `getPostById(id)` - Get post by ID
- `createPost(postData)` - Create post
- `getPostsByUserId(userId)` - Get posts by user ID
- `getPostComments(postId)` - Get post comments

#### CommentsPageObject
- `getAllComments()` - Get all comments
- `getCommentById(id)` - Get comment by ID
- `createComment(commentData)` - Create comment
- `getCommentsByPostId(postId)` - Get comments by post ID

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
  const newUser = await usersPage.createUser(userData)
  
  expect(newUser.name).to.equal(userData.name)
  expect(newUser.email).to.equal(userData.email)
})
```

### Performance test

```javascript
it('should respond quickly', async function() {
  const response = await usersPage.client.get('/users')
  
  expect(response).to.have.responseTime(500)
  expect(response).to.have.successStatus()
})
```

### Schema validation

```javascript
it('should validate user schema', async function() {
  const user = await usersPage.getUserById(1)
  
  usersPage.schemaValidations.validateUserSchema(user)
})
```

### Integration test

```javascript
it('should test user-posts-comments flow', async function() {
  // Create user
  const user = await usersPage.createUser(userData)
  
  // Create post for user
  const post = await postsPage.createPost({
    ...postData,
    userId: user.id
  })
  
  // Create comment for post
  const comment = await commentsPage.createComment({
    ...commentData,
    postId: post.id
  })
  
  expect(comment.postId).to.equal(post.id)
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

## 🔧 Extending the Framework

### Adding a new API
1. Create a new PageObject class
2. Add base URL to configuration
3. Create tests for the new API

### Adding a new validation type
1. Add a new method to `schemaValidations`
2. Use in PageObjects
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

**🎯 This framework demonstrates a professional approach to API testing and can serve as a foundation for real projects.**
