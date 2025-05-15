import { useState } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CheckoutForm from '@/components/CheckoutForm';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Checkout = () => {
  const { cartItems } = useCart();
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  if (cartItems.length === 0 && !checkoutComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Helmet>
          <title>Checkout | ShopMERN</title>
          <meta name="description" content="Complete your purchase securely with various payment options including Plaid integration." />
        </Helmet>
        
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/shop">
            <Button className="w-full">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (checkoutComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Helmet>
          <title>Order Confirmation | ShopMERN</title>
          <meta name="description" content="Your order has been successfully placed. Thank you for shopping with us!" />
        </Helmet>
        
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. We've sent you an email with order details.
          </p>
          <div className="flex flex-col space-y-3">
            <Link href="/orders">
              <Button variant="outline" className="w-full">View Your Orders</Button>
            </Link>
            <Link href="/">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Checkout | ShopMERN</title>
        <meta name="description" content="Complete your purchase securely with various payment options including Plaid integration." />
      </Helmet>
      
      <div className="mb-6">
        <Link href="/shop">
          <Button variant="ghost" className="flex items-center p-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shopping
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <Tabs defaultValue="checkout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checkout" className="text-center">Checkout</TabsTrigger>
          <TabsTrigger value="review" className="text-center">Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="checkout" className="pt-6">
          <CheckoutForm onComplete={() => setCheckoutComplete(true)} />
        </TabsContent>
        
        <TabsContent value="review" className="pt-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Order Review</h2>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.variant || ''}`} className="flex justify-between border-b pb-4">
                  <div className="flex">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-right">
              <TabsTrigger value="checkout" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Proceed to Payment
              </TabsTrigger>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Checkout;
