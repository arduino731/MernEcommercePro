import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
}

const Categories = () => {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const renderSkeletonCards = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
        <Skeleton className="w-full h-48" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-2/5" />
        </div>
      </div>
    ));
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Failed to load categories</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our carefully curated categories to find exactly what you're looking for.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            renderSkeletonCards()
          ) : (
            categories?.slice(0, 3).map(category => (
              <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300">
                <img 
                  src={category.imageUrl} 
                  alt={category.name} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <Link href={`/shop?category=${category.slug}`}>
                    <a className="text-primary hover:text-blue-700 font-medium flex items-center">
                      Browse {category.name} <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
