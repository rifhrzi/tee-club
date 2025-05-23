# Testing Guide

## Overview
This project now includes comprehensive automated tests for the authentication and cart system using Jest and React Testing Library.

## Test Structure

### 📁 Test Organization
```
__tests__/
├── utils/
│   └── test-utils.tsx          # Testing utilities and mocks
├── auth/
│   └── authentication.test.tsx # Authentication flow tests
├── cart/
│   └── cart-store.test.tsx     # Cart store functionality tests
├── components/
│   ├── QuickAddToCart.test.tsx # Quick add to cart component tests
│   └── DirectLoginLink.test.tsx # Checkout button component tests
└── integration/
    └── user-flow.test.tsx      # End-to-end user journey tests
```

## Test Categories

### 🔐 **Authentication Tests**
- **Session state handling** (loading, authenticated, unauthenticated)
- **Authentication logic** (allow/deny access)
- **Redirect functionality** for unauthenticated users

### 🛒 **Cart Store Tests**
- **Add/remove products** from cart
- **Update quantities** and clear cart
- **Authentication checks** with skipAuthCheck option
- **Store initialization** and debugging

### 🔘 **Component Tests**
- **QuickAddToCart**: Single-click behavior, authentication handling
- **DirectLoginLink**: Checkout flow, loading states, redirects
- **Button interactions** and state management

### 🔄 **Integration Tests**
- **Complete user journeys** (shop → cart → checkout)
- **Session synchronization** across components
- **Error handling** and edge cases
- **Loading state management**

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch mode)
npm run test:ci
```

### Specific Test Categories
```bash
# Run only authentication tests
npm test auth

# Run only cart tests
npm test cart

# Run only component tests
npm test components

# Run only integration tests
npm test integration
```

## Test Features

### ✅ **What We Test**

#### **Authentication Flow**
- ✅ Session state transitions (loading → authenticated/unauthenticated)
- ✅ Authentication checks for cart operations
- ✅ Redirect behavior for unauthenticated users
- ✅ Session synchronization across components

#### **Cart Functionality**
- ✅ Adding products to cart (with/without authentication)
- ✅ Removing products and updating quantities
- ✅ Cart persistence and initialization
- ✅ Authentication bypass with skipAuthCheck

#### **Button Behavior**
- ✅ Single-click functionality (no double-click required)
- ✅ Loading state handling and button disabling
- ✅ Authentication-based button behavior
- ✅ Error handling and edge cases

#### **User Experience**
- ✅ Complete shopping flow (browse → add → checkout)
- ✅ Smooth authentication transitions
- ✅ Proper loading states and feedback
- ✅ Error recovery and graceful degradation

### 🔧 **Test Utilities**

#### **Mock Session States**
```javascript
// Authenticated user
mockAuthenticatedSession = {
  data: { user: { email: 'test@example.com' } },
  status: 'authenticated'
}

// Unauthenticated user
mockUnauthenticatedSession = {
  data: null,
  status: 'unauthenticated'
}

// Loading state
mockLoadingSession = {
  data: null,
  status: 'loading'
}
```

#### **Helper Functions**
```javascript
// Render components with authentication state
renderWithProviders(<Component />, {
  sessionState: mockAuthenticatedSession
})

// Create mock products and cart items
const product = createMockProduct()
const cartItem = createMockCartItem()
```

## Test Coverage

### 📊 **Coverage Goals**
- **Authentication logic**: 100% coverage
- **Cart operations**: 100% coverage
- **Component interactions**: 95%+ coverage
- **Integration flows**: 90%+ coverage

### 📈 **Coverage Report**
Run `npm run test:coverage` to see detailed coverage:
- **Statements**: Target 95%+
- **Branches**: Target 90%+
- **Functions**: Target 95%+
- **Lines**: Target 95%+

## Best Practices

### ✅ **Writing Tests**
1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Mock external dependencies**
4. **Test both happy path and edge cases**
5. **Keep tests isolated and independent**

### ✅ **Test Organization**
1. **Group related tests in describe blocks**
2. **Use beforeEach for common setup**
3. **Clear mocks between tests**
4. **Use meaningful assertions**

### ✅ **Debugging Tests**
1. **Use screen.debug() to see rendered output**
2. **Check console logs for debugging info**
3. **Use waitFor for async operations**
4. **Verify mock function calls**

## Continuous Integration

### 🚀 **CI/CD Integration**
The test suite is designed for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v1
```

### 📋 **Pre-commit Hooks**
Tests run automatically before commits to ensure code quality.

## Troubleshooting

### 🐛 **Common Issues**

#### **Mock Issues**
- Ensure NextAuth and router mocks are properly set up
- Clear mocks between tests with `jest.clearAllMocks()`

#### **Async Operations**
- Use `waitFor` for async state changes
- Mock timers for setTimeout/setInterval

#### **Component Rendering**
- Use `renderWithProviders` for components needing authentication
- Mock localStorage and other browser APIs

### 🔍 **Debugging Tips**
1. **Add console.log in tests** to debug values
2. **Use screen.debug()** to see component output
3. **Check mock function calls** with `expect().toHaveBeenCalledWith()`
4. **Verify test isolation** by running tests individually

## Future Enhancements

### 🎯 **Planned Improvements**
- **E2E tests** with Playwright/Cypress
- **Visual regression tests** for UI components
- **Performance tests** for cart operations
- **Accessibility tests** for components

### 📝 **Test Maintenance**
- **Regular test review** and updates
- **Coverage monitoring** and improvement
- **Test performance** optimization
- **Documentation updates**

## Summary

This comprehensive test suite ensures:
- ✅ **Reliable authentication** without redirect loops
- ✅ **Single-click functionality** for all buttons
- ✅ **Robust cart operations** with proper error handling
- ✅ **Smooth user experience** across the entire application
- ✅ **Confidence in deployments** with automated testing

The tests provide a safety net for future development and ensure the authentication and cart systems work reliably for all users.
