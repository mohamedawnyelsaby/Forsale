import { useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const addItem = (item: CartItem) => {
    const existing = items.find(i => i.productId === item.productId);
    
    if (existing) {
      updateQuantity(item.productId, existing.quantity + item.quantity);
    } else {
      saveCart([...items, item]);
    }
  };

  const removeItem = (productId: string) => {
    saveCart(items.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    saveCart(
      items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    saveCart([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    loading,
    total,
    count,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
