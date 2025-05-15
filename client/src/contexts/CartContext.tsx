import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/components/ProductCard';

export interface CartItem extends Product {
  quantity: number;
  variant?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variant?: string) => void;
  updateCartItem: (id: string, data: Partial<CartItem>, variant?: string) => void;
  clearCart: () => void;
  increaseQuantity: (id: string, variant?: string) => void;
  decreaseQuantity: (id: string, variant?: string) => void;
  cartTotal: number;
  shippingCost: number;
  tax: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [shippingCost, setShippingCost] = useState(9.99);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Calculate the cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  // Calculate tax (10% of cartTotal)
  const tax = cartTotal * 0.1;
  
  // Add item to cart
  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === item.id && cartItem.variant === item.variant
      );
      
      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, item];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id: string, variant?: string) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === id && item.variant === variant))
    );
  };
  
  // Update cart item
  const updateCartItem = (id: string, data: Partial<CartItem>, variant?: string) => {
    setCartItems(prevItems =>
      prevItems.map(item => 
        item.id === id && item.variant === variant ? { ...item, ...data } : item
      )
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Increase item quantity
  const increaseQuantity = (id: string, variant?: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id && item.variant === variant
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };
  
  // Decrease item quantity
  const decreaseQuantity = (id: string, variant?: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id && item.variant === variant && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        cartTotal,
        shippingCost,
        tax,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
