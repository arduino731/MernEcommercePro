import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { formatCurrency } from '@/lib/utils';
import { X, Trash2, Plus, Minus } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { 
    cartItems, 
    removeFromCart, 
    increaseQuantity, 
    decreaseQuantity, 
    clearCart,
    cartTotal,
    shippingCost,
    tax
  } = useCart();

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const grandTotal = cartTotal + shippingCost + tax;

  return (
    <div 
      className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out z-40`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Your Cart ({totalItems})</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close cart">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Button onClick={onClose}>Start Shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.variant || ''}`} className="flex border-b border-gray-200 pb-4">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFromCart(item.id, item.variant)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                    {item.variant && <p className="text-gray-500 text-sm">{item.variant}</p>}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border rounded">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="p-0 h-8 w-8"
                          onClick={() => decreaseQuantity(item.id, item.variant)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 py-1 text-sm">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="p-0 h-8 w-8"
                          onClick={() => increaseQuantity(item.id, item.variant)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              <Link href="/checkout">
                <Button 
                  className="w-full bg-primary hover:bg-blue-600 text-white"
                  size="lg"
                  onClick={onClose}
                >
                  Proceed to Checkout
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
