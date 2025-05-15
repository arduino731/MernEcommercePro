import { Link } from 'wouter';
import { Shield, Banknote, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SecurePayment = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <img 
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
              alt="Secure payment processing illustration" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-6">Secure Payments with Plaid</h2>
            <p className="text-gray-600 mb-6">
              Our integration with Plaid ensures your payment information is always secure. 
              Experience peace of mind with every transaction.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Shield className="text-secondary h-5 w-5 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Banknote-Level Security</h3>
                  <p className="text-gray-600 text-sm">All transactions are protected with 256-bit encryption.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Banknote className="text-secondary h-5 w-5 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Connect Your Banknote</h3>
                  <p className="text-gray-600 text-sm">Securely link your preferred payment method in seconds.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="text-secondary h-5 w-5 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Fast Checkout</h3>
                  <p className="text-gray-600 text-sm">Save your payment details for quicker future transactions.</p>
                </div>
              </li>
            </ul>
            <div className="mt-8">
              <Link href="/security">
                <Button 
                  className="bg-secondary hover:bg-green-600 text-white flex items-center" 
                  size="lg"
                >
                  Learn About Our Security <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurePayment;
