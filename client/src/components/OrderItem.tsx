import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Truck, Package, CheckCircle } from 'lucide-react';

interface OrderItemProps {
  order: {
    id: number;
    createdAt: string;
    total: number;
    status: string;
    items: Array<{
      id: number;
      name: string;
      price: number;
      quantity: number;
      variant?: string;
    }>;
  };
}

export default function OrderItem({ order }: OrderItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Package className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            {getStatusBadge(order.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
            <p className="font-medium">{formatCurrency(order.total)}</p>
          </div>
          <CollapsibleTrigger
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center text-primary hover:text-primary/80"
          >
            <span className="mr-1">{isOpen ? 'Hide Details' : 'View Details'}</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
        </div>
      </CardContent>

      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <div className="px-6 py-2 border-t">
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
          <CardFooter className="border-t flex justify-end pt-4">
            <Button variant="outline" size="sm">
              Track Order
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
