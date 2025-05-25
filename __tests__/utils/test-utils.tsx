import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { useSession } from 'next-auth/react'

// Mock session states
export const mockAuthenticatedSession = {
  data: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    },
    expires: '2024-12-31',
  },
  status: 'authenticated' as const,
}

export const mockUnauthenticatedSession = {
  data: null,
  status: 'unauthenticated' as const,
}

export const mockLoadingSession = {
  data: null,
  status: 'loading' as const,
}

// Helper to mock useSession with different states
export const mockUseSession = (sessionState: any) => {
  const useSessionMock = useSession as jest.MockedFunction<typeof useSession>
  useSessionMock.mockReturnValue(sessionState)
}

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  sessionState?: any
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { sessionState = mockUnauthenticatedSession, ...renderOptions } = options

  // Mock the session state
  mockUseSession(sessionState)

  // Mock localStorage for cart
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockLocalStorage,
  }
}

// Helper to create mock products
export const createMockProduct = (overrides = {}) => ({
  id: 'test-product-1',
  name: 'Test Product',
  description: 'A test product',
  price: 29.99,
  stock: 10,
  images: ['test-image.jpg'],
  variants: [],
  ...overrides,
})

// Helper to create mock cart items
export const createMockCartItem = (overrides = {}) => ({
  product: createMockProduct(),
  quantity: 1,
  ...overrides,
})

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
