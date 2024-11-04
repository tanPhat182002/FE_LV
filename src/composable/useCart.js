// composables/useCart.js
import { ref, onMounted, onUnmounted } from 'vue'
import { CartService } from '@/services/cart.service'

export function useCart() {
  const cartCount = ref(0)
  const cartItems = ref([])
  const cartTotal = ref(0)

  // Update all cart related data
  const updateCartData = () => {
    const cart = CartService.getCart()
    cartItems.value = cart
    cartCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartTotal.value = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  // Handle storage changes from other tabs/windows
  const handleStorageChange = (e) => {
    if (e.key === CartService.CART_KEY) {
      updateCartData()
    }
  }

  // Cart operations
  const addToCart = (product) => {
    CartService.addToCart(product)
    updateCartData()
  }

  const removeFromCart = (itemId) => {
    CartService.removeItem(itemId)
    updateCartData()
  }

  const removeMultipleItems = (itemIds) => {
    CartService.removeItems(itemIds)
    updateCartData()
  }

  const updateQuantity = (itemId, quantity) => {
    CartService.updateQuantity(itemId, quantity)
    updateCartData()
  }

  const clearCart = () => {
    CartService.clearCart()
    updateCartData()
  }

  // Lifecycle hooks
  onMounted(() => {
    updateCartData()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cart-updated', updateCartData)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('cart-updated', updateCartData)
  })

  return {
    cartCount,
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    removeMultipleItems,  
    updateQuantity,
    clearCart,
    updateCartData
  }
}