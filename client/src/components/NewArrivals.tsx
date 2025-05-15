import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import ProductCard, { Product } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const NewArrivals = () => {
  const { data: newArrivals, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products?new=true'],
  });

  const renderSkeletonCards = () => {
    return Array(4).fill(0).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
        <Skeleton className="w-full h-48" />
        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-9 w-1/3" />
          </div>
        </div>
      </div>
    ));
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Failed to load new arrivals</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">New Arrivals</h2>
            <p className="text-gray-600">Check out our latest products</p>
          </div>
          <Link href="/shop?category=new">
            <a className="text-primary hover:underline font-medium hidden md:flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading 
            ? renderSkeletonCards()
            : newArrivals?.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
          }
        </div>
        
        <div className="text-center mt-8 md:hidden">
          <Link href="/shop?category=new">
            <a className="text-primary hover:underline font-medium flex items-center justify-center">
              View all new arrivals <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
