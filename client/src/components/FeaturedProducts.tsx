import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import ProductCard, { Product } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedProducts = () => {
  const { data: featuredProducts, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products?featured=true'],
  });

  const renderSkeletonCards = () => {
    return Array(4).fill(0).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
        <Skeleton className="w-full h-48" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
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
        <p className="text-red-500">Failed to load featured products</p>
      </div>
    );
  }

  return (
    <section id="featured" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium products, each designed with quality and performance in mind.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading 
            ? renderSkeletonCards()
            : featuredProducts?.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
          }
        </div>
        
        <div className="text-center mt-12">
          <Link href="/shop">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
