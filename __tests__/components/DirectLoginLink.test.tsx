import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { useRouter } from 'next/navigation'
import DirectLoginLink from '@/components/DirectLoginLink'
import { 
  renderWithProviders, 
  mockAuthenticatedSession, 
  mockUnauthenticatedSession,
  mockLoadingSession,
  screen,
  userEvent,
  waitFor
} from '../utils/test-utils'

describe('DirectLoginLink Component', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
    })

    // Mock localStorage
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
  })

  describe('Authenticated User', () => {
    test('should render children normally when authenticated', () => {
      renderWithProviders(
        <DirectLoginLink>
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockAuthenticatedSession }
      )

      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument()
    })

    test('should navigate to checkout when authenticated user clicks', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(
        <DirectLoginLink href="/checkout">
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockAuthenticatedSession }
      )

      const button = screen.getByText('Proceed to Checkout')
      await user.click(button)

      expect(mockPush).toHaveBeenCalledWith('/checkout')
    })

    test('should use default href when none provided', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(
        <DirectLoginLink>
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockAuthenticatedSession }
      )

      const button = screen.getByText('Proceed to Checkout')
      await user.click(button)

      expect(mockPush).toHaveBeenCalledWith('/checkout')
    })

    test('should not navigate when session is loading', async () => {
      const user = userEvent.setup()
      
      // Start with loading, then switch to authenticated
      const { rerender } = renderWithProviders(
        <DirectLoginLink>
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockLoadingSession }
      )

      const button = screen.getByRole('button')
      await user.click(button)

      // Should not navigate while loading
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Unauthenticated User', () => {
    test('should redirect to login when unauthenticated user clicks', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(
        <DirectLoginLink href="/checkout">
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockUnauthenticatedSession }
      )

      const button = screen.getByText('Proceed to Checkout')
      await user.click(button)

      expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fcheckout')
    })

    test('should store redirect path in localStorage', async () => {
      const user = userEvent.setup()
      const mockSetItem = jest.fn()
      
      Object.defineProperty(window, 'localStorage', {
        value: { ...localStorage, setItem: mockSetItem },
        writable: true,
      })
      
      renderWithProviders(
        <DirectLoginLink href="/checkout">
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockUnauthenticatedSession }
      )

      const button = screen.getByText('Proceed to Checkout')
      await user.click(button)

      expect(mockSetItem).toHaveBeenCalledWith('auth_redirect', '/checkout')
    })

    test('should not redirect when session is loading', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(
        <DirectLoginLink>
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockLoadingSession }
      )

      const button = screen.getByRole('button')
      await user.click(button)

      // Should not redirect while loading
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    test('should show loading state when session is loading', () => {
      renderWithProviders(
        <DirectLoginLink>
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockLoadingSession }
      )

      expect(screen.getByText('Checking auth...')).toBeInTheDocument()
    })

    test('should show redirecting state when redirecting', async () => {
      const user = userEvent.setup()
      
      const { rerender } = renderWithProviders(
        <DirectLoginLink>
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockUnauthenticatedSession }
      )

      const button = screen.getByText('Proceed to Checkout')
      await user.click(button)

      // After clicking, should show redirecting state
      await waitFor(() => {
        expect(screen.getByText('Redirecting...')).toBeInTheDocument()
      })
    })

    test('should disable button during loading', () => {
      renderWithProviders(
        <DirectLoginLink>
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockLoadingSession }
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Single Click Behavior', () => {
    test('should work with single click for authenticated users', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(
        <DirectLoginLink href="/checkout">
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockAuthenticatedSession }
      )

      const button = screen.getByText('Proceed to Checkout')
      
      // Single click should work
      await user.click(button)
      
      expect(mockPush).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/checkout')
    })

    test('should work with single click for unauthenticated users', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(
        <DirectLoginLink href="/checkout">
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockUnauthenticatedSession }
      )

      const button = screen.getByText('Proceed to Checkout')
      
      // Single click should redirect to login
      await user.click(button)
      
      expect(mockPush).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fcheckout')
    })

    test('should prevent multiple clicks during redirect', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(
        <DirectLoginLink href="/checkout">
          <button>Proceed to Checkout</button>
        </DirectLoginLink>,
        { sessionState: mockUnauthenticatedSession }
      )

      const button = screen.getByText('Proceed to Checkout')
      
      // Multiple rapid clicks should only result in one redirect
      await user.click(button)
      await user.click(button)
      await user.click(button)
      
      expect(mockPush).toHaveBeenCalledTimes(1)
    })
  })
})
