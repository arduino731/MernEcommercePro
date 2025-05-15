import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import OrderItem from '@/components/OrderItem';
import { Helmet } from 'react-helmet';
import { ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

interface Order {
  id: number;
  createdAt: string;
  total: number;
  status: string;
  items: OrderItem[];
}

const OrderHistory = () => {
  const { isAuthenticated } = useAuth();
  
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Helmet>
          <title>Order History | ShopMERN</title>
          <meta name="description" content="View and track your order history and shipments." />
        </Helmet>
        
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign in to view your orders</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your order history.</p>
          <Link href="/">
            <Button className="w-full">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Order History | ShopMERN</title>
        <meta name="description" content="View and track your order history and shipments." />
      </Helmet>
      
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="flex items-center p-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shopping
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Error loading orders</h3>
          <p className="text-gray-600 mb-4">An error occurred while loading your orders.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link href="/shop">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
