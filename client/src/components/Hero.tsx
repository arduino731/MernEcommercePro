import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Shop the latest tech with secure payments
            </h1>
            <p className="text-xl text-gray-300">
              Experience seamless shopping with our secure Plaid-powered payment system.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#featured">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-blue-600 text-white"
                >
                  Shop Now
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border border-white hover:bg-white hover:text-gray-900 text-white"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
              alt="Collection of modern tech products" 
              className="rounded-lg shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-accent text-gray-900 font-semibold rounded-lg py-2 px-4 shadow-lg">
              New Arrivals!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
