// Global test setup
const chai = require('chai')

// Global assertion styles
global.expect = chai.expect
global.assert = chai.assert
global.should = chai.should()

// Add custom chai assertions if needed
chai.use(function (chai, utils) {
  // Custom assertion for checking response time
  chai.Assertion.addMethod('responseTime', function (expectedTime) {
    const obj = this._obj
    const actualTime = obj.duration || obj.responseTime
    
    this.assert(
      actualTime <= expectedTime,
      `expected response time to be <= ${expectedTime}ms but got ${actualTime}ms`,
      `expected response time to be > ${expectedTime}ms but got ${actualTime}ms`,
      expectedTime,
      actualTime
    )
  })

  // Custom assertion for checking status code ranges
  chai.Assertion.addMethod('successStatus', function () {
    const obj = this._obj
    const status = obj.status || obj.statusCode
    
    this.assert(
      status >= 200 && status < 300,
      `expected status to be success (2xx) but got ${status}`,
      `expected status not to be success (2xx) but got ${status}`,
      'success status (2xx)',
      status
    )
  })

  chai.Assertion.addMethod('clientErrorStatus', function () {
    const obj = this._obj
    const status = obj.status || obj.statusCode
    
    this.assert(
      status >= 400 && status < 500,
      `expected status to be client error (4xx) but got ${status}`,
      `expected status not to be client error (4xx) but got ${status}`,
      'client error status (4xx)',
      status
    )
  })
})

// Global error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
