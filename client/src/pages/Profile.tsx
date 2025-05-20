import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProfileForm from '@/components/ProfileForm';
import OrderItem from '@/components/OrderItem';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { UserCircle, ShoppingBag, Loader2 } from 'lucide-react';

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

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  console.log("👤 User in Profile.tsx:", user);

  const { data: recentOrders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
    select: (orders) => orders.slice(0, 3), // Get only 3 most recent orders
  });

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Loader2 className="mx-auto h-6 w-6 animate-spin mb-4" />
        Loading profile...
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Helmet>
          <title>My Profile | ShopMERN</title>
          <meta name="description" content="Manage your account details, view orders, and update your profile settings." />
        </Helmet>
        
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <UserCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign in to view your profile</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your account information.</p>
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
        <title>My Profile | ShopMERN</title>
        <meta name="description" content="Manage your account details, view orders, and update your profile settings." />
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and view orders</p>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="text-center">Profile</TabsTrigger>
          <TabsTrigger value="orders" className="text-center">Recent Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="pt-6">
          <ProfileForm user={user} />
        </TabsContent>
        
        <TabsContent value="orders" className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
              
              <div className="text-center mt-6">
                <Link href="/orders">
                  <Button variant="outline">View All Orders</Button>
                </Link>
              </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
