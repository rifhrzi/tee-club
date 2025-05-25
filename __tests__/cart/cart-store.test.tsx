import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useCartStore from '@/store/cartStore'
import { createMockProduct } from '../utils/test-utils'

// Mock the authRedirect utility
jest.mock('@/utils/authRedirect', () => ({
  redirectToSignup: jest.fn(),
}))

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCartStore.getState().clearCart()
    jest.clearAllMocks()
    
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

    // Mock document.cookie for authentication checks
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  describe('Cart Operations', () => {
    test('should add product to cart with skipAuthCheck', () => {
      const { result } = renderHook(() => useCartStore())
      const mockProduct = createMockProduct()

      act(() => {
        result.current.addToCart(mockProduct, { skipAuthCheck: true })
      })

      expect(result.current.cart).toHaveLength(1)
      expect(result.current.cart[0].product.id).toBe(mockProduct.id)
      expect(result.current.cart[0].quantity).toBe(1)
    })

    test('should increase quantity when adding same product', () => {
      const { result } = renderHook(() => useCartStore())
      const mockProduct = createMockProduct()

      act(() => {
        result.current.addToCart(mockProduct, { skipAuthCheck: true })
        result.current.addToCart(mockProduct, { skipAuthCheck: true })
      })

      expect(result.current.cart).toHaveLength(1)
      expect(result.current.cart[0].quantity).toBe(2)
    })

    test('should remove product from cart', () => {
      const { result } = renderHook(() => useCartStore())
      const mockProduct = createMockProduct()

      act(() => {
        result.current.addToCart(mockProduct, { skipAuthCheck: true })
      })

      expect(result.current.cart).toHaveLength(1)

      act(() => {
        result.current.removeFromCart(mockProduct.id)
      })

      expect(result.current.cart).toHaveLength(0)
    })

    test('should update product quantity', () => {
      const { result } = renderHook(() => useCartStore())
      const mockProduct = createMockProduct()

      act(() => {
        result.current.addToCart(mockProduct, { skipAuthCheck: true })
      })

      act(() => {
        result.current.updateQuantity(mockProduct.id, 5)
      })

      expect(result.current.cart[0].quantity).toBe(5)
    })

    test('should clear entire cart', () => {
      const { result } = renderHook(() => useCartStore())
      const mockProduct1 = createMockProduct({ id: 'product-1' })
      const mockProduct2 = createMockProduct({ id: 'product-2' })

      act(() => {
        result.current.addToCart(mockProduct1, { skipAuthCheck: true })
        result.current.addToCart(mockProduct2, { skipAuthCheck: true })
      })

      expect(result.current.cart).toHaveLength(2)

      act(() => {
        result.current.clearCart()
      })

      expect(result.current.cart).toHaveLength(0)
    })
  })

  describe('Authentication Checks', () => {
    test('should skip authentication when skipAuthCheck is true', () => {
      const { result } = renderHook(() => useCartStore())
      const mockProduct = createMockProduct()

      // Mock unauthenticated state (no cookies)
      document.cookie = ''

      act(() => {
        result.current.addToCart(mockProduct, { skipAuthCheck: true })
      })

      // Should still add to cart despite no authentication
      expect(result.current.cart).toHaveLength(1)
    })

    test('should perform authentication check when skipAuthCheck is false', () => {
      const { result } = renderHook(() => useCartStore())
      const mockProduct = createMockProduct()
      const { redirectToSignup } = require('@/utils/authRedirect')

      // Mock unauthenticated state (no cookies)
      document.cookie = ''

      act(() => {
        result.current.addToCart(mockProduct, { skipAuthCheck: false })
      })

      // Should not add to cart and should redirect
      expect(result.current.cart).toHaveLength(0)
      expect(redirectToSignup).toHaveBeenCalled()
    })

    test('should allow adding to cart when authenticated', () => {
      const { result } = renderHook(() => useCartStore())
      const mockProduct = createMockProduct()

      // Mock authenticated state with NextAuth cookie
      document.cookie = 'next-auth.session-token=valid-token'

      act(() => {
        result.current.addToCart(mockProduct, { skipAuthCheck: false })
      })

      // Should add to cart when authenticated
      expect(result.current.cart).toHaveLength(1)
    })
  })

  describe('Store Initialization', () => {
    test('should initialize store', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.initializeStore()
      })

      expect(result.current.initialized).toBe(true)
    })

    test('should debug cart state', () => {
      const { result } = renderHook(() => useCartStore())
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      act(() => {
        result.current.debugCart()
      })

      expect(consoleSpy).toHaveBeenCalledWith('CartStore Debug:')
      consoleSpy.mockRestore()
    })
  })
})
