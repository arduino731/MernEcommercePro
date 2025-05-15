import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import PlaidLink from '@/components/PlaidLink';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Landmark, Lock } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  postalCode: z.string().min(5, { message: 'Postal code is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  paymentMethod: z.enum(['card', 'bank']),
});

type FormValues = z.infer<typeof formSchema>;

interface CheckoutFormProps {
  onComplete: () => void;
}

export default function CheckoutForm({ onComplete }: CheckoutFormProps) {
  const { user } = useAuth();
  const { cartItems, cartTotal, shippingCost, tax, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [plaidToken, setPlaidToken] = useState<string | null>(null);
  const [plaidMetadata, setPlaidMetadata] = useState<any | null>(null);

  const grandTotal = cartTotal + shippingCost + tax;

  // Initialize form with user data if available
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      postalCode: user?.postalCode || '',
      country: user?.country || '',
      paymentMethod: 'card',
    },
  });

  const handlePlaidSuccess = (publicToken: string, metadata: any) => {
    setPlaidToken(publicToken);
    setPlaidMetadata(metadata);
    toast({
      title: 'Bank account connected',
      description: 'Your bank account has been successfully connected.',
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsProcessing(true);

      // Check if we have items in the cart
      if (cartItems.length === 0) {
        toast({
          title: 'Empty cart',
          description: 'Your cart is empty. Please add items before checkout.',
          variant: 'destructive',
        });
        return;
      }

      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          total: grandTotal,
          shippingAddress: values.address,
          shippingCity: values.city,
          shippingState: values.state,
          shippingPostalCode: values.postalCode,
          shippingCountry: values.country,
          paymentMethod: values.paymentMethod,
          items: cartItems.map(item => ({
            productId: parseInt(item.id),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant,
          })),
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Process payment based on the selected method
      if (values.paymentMethod === 'bank') {
        if (!plaidToken) {
          toast({
            title: 'Bank connection required',
            description: 'Please connect your bank account first.',
            variant: 'destructive',
          });
          setIsProcessing(false);
          return;
        }

        // Exchange public token
        const exchangeResponse = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            publicToken: plaidToken,
          }),
        });

        if (!exchangeResponse.ok) {
          throw new Error('Failed to exchange token');
        }

        // Process payment using Plaid
        const paymentResponse = await fetch('/api/plaid/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: grandTotal,
            accessToken: 'access-sandbox-123', // In a real app, you would get this from your backend
            accountId: plaidMetadata?.account_id || 'account-sandbox-123',
            orderId: orderData.id,
          }),
        });

        if (!paymentResponse.ok) {
          throw new Error('Failed to process payment');
        }
      } else {
        // Simulate card payment for demo purposes
        // In a real app, you would integrate with a card payment processor
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Complete checkout
      toast({
        title: 'Order completed!',
        description: 'Your order has been successfully placed.',
        variant: 'default',
      });

      // Clear cart
      clearCart();

      // Invoke onComplete callback
      onComplete();

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error instanceof Error ? error.message : 'An error occurred during checkout.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
            <CardDescription>Enter your shipping details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-col space-y-4 mt-2"
                        >
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="flex items-center cursor-pointer">
                              <CreditCard className="mr-2 h-5 w-5 text-primary" />
                              Credit/Debit Card
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="bank" id="bank" />
                            <Label htmlFor="bank" className="flex items-center cursor-pointer">
                              <Landmark className="mr-2 h-5 w-5 text-primary" />
                              Bank Account (Plaid)
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('paymentMethod') === 'bank' && !plaidToken && (
                  <div className="mt-4">
                    <PlaidLink onSuccess={handlePlaidSuccess} className="w-full" />
                  </div>
                )}

                {form.watch('paymentMethod') === 'card' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Card Number</Label>
                      <Input placeholder="4111 1111 1111 1111" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label>Expiration Date</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label>CVC</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center mt-6">
                  <Lock className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm text-gray-500">
                    Your payment information is secure and encrypted
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    `Pay ${formatCurrency(grandTotal)}`
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.variant || ''}`} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
