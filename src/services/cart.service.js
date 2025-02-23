// services/cart.service.js

export class CartService {
    static CART_KEY = 'shopping_cart'
    
    static getCart() {
      const cart = localStorage.getItem(this.CART_KEY)
      return cart ? JSON.parse(cart) : []
    }
    
    static saveCart(cart) {
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
        // Emit custom event
        window.dispatchEvent(new Event('cart-updated'))
        return cart
      }
  
    static addToCart(product) {
      const cart = this.getCart()
      
      // Check if product variant already exists
      const existingItemIndex = cart.findIndex(item => 
        item.variantId === product.variantId
      )
  
      if (existingItemIndex >= 0) {
        // Update quantity if exists
        cart[existingItemIndex].quantity += product.quantity
      } else {
        // Add new item if not exists
        cart.push({
          id: Date.now(), // Unique cart item id
          productId: product.productId,
          variantId: product.variantId,
          name: product.name,
          image: product.image,
          color: product.color,
          size: product.size,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity: product.quantity,
          maxQuantity: product.maxQuantity,
          error: ''
        })
      }
  
      this.saveCart(cart)
      return cart
    }
  
    static updateQuantity(itemId, quantity) {
      const cart = this.getCart()
      const item = cart.find(item => item.id === itemId)
      if (item) {
        item.quantity = quantity
        this.saveCart(cart)
      }
      return cart
    }
  
    static removeItem(itemId) {
      const cart = this.getCart()
      const newCart = cart.filter(item => item.id !== itemId)
      this.saveCart(newCart)
      return newCart
    }
  
    static removeItems(itemIds) {
      const cart = this.getCart()
      const newCart = cart.filter(item => !itemIds.includes(item.id))
      this.saveCart(newCart)
      return newCart
    }
  
    static clearCart() {
      localStorage.removeItem(this.CART_KEY)
      return []
    }
  }