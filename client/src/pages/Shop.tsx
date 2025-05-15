import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import ProductCard, { Product } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, X } from 'lucide-react';
import { Helmet } from 'react-helmet';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Shop = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearchQuery = searchParams.get('search') || '';
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);

  // Get URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Build API query string based on filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    params.append('minPrice', priceRange[0].toString());
    params.append('maxPrice', priceRange[1].toString());
    params.append('sortBy', sortBy);
    if (inStockOnly) {
      params.append('inStock', 'true');
    }
    if (onSaleOnly) {
      params.append('onSale', 'true');
    }
    return params.toString();
  };

  // Fetch products with filters
  const { data: products, isLoading: isLoadingProducts, refetch } = useQuery<Product[]>({
    queryKey: [`/api/products?${buildQueryString()}`],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const applyFilters = () => {
    refetch();
    setIsMobileFilterOpen(false);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 1000]);
    setSearchQuery('');
    setSortBy('newest');
    setInStockOnly(false);
    setOnSaleOnly(false);
    refetch();
  };

  const renderSkeletonCards = () => {
    return Array(8).fill(0).map((_, index) => (
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

  return (
    <>
      <Helmet>
        <title>Shop Technology Products | ShopMERN</title>
        <meta name="description" content="Browse our collection of high-quality technology products. Find smartphones, headphones, smartwatches, and more with secure payment options and fast shipping." />
        <meta property="og:title" content="Shop Technology Products | ShopMERN" />
        <meta property="og:description" content="Browse our collection of high-quality technology products with secure payments and fast shipping." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Shop</h1>
            <p className="text-gray-600 mt-2">Browse our collection of high-quality products</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Button */}
            <div className="lg:hidden flex justify-between mb-4">
              <form onSubmit={handleSearch} className="relative flex-1 mr-2">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </form>
              <Button 
                variant="outline" 
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>
            
            {/* Mobile Filters Sidebar */}
            <div className={`
              fixed inset-0 bg-white z-50 p-4 overflow-auto lg:hidden transform transition-transform duration-300
              ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Filter Content - Mobile */}
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <RadioGroup 
                        value={selectedCategory} 
                        onValueChange={setSelectedCategory}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all-mobile" />
                          <Label htmlFor="all-mobile">All Products</Label>
                        </div>
                        
                        {isLoadingCategories ? (
                          Array(4).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Skeleton className="h-4 w-4 rounded-full" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          ))
                        ) : (
                          categories?.map(category => (
                            <div key={category.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={category.slug} id={`${category.slug}-mobile`} />
                              <Label htmlFor={`${category.slug}-mobile`}>{category.name}</Label>
                            </div>
                          ))
                        )}
                      </RadioGroup>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="space-y-4">
                    <Slider
                      defaultValue={priceRange}
                      min={0}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={(value: [number, number]) => setPriceRange(value)}
                      className="my-6"
                    />
                    <div className="flex justify-between">
                      <div>
                        <Label>Min</Label>
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                          className="w-24"
                        />
                      </div>
                      <div>
                        <Label>Max</Label>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Availability */}
                <div>
                  <h3 className="font-medium mb-3">Availability</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="in-stock-mobile" 
                        checked={inStockOnly}
                        onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                      />
                      <Label htmlFor="in-stock-mobile">In Stock Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="on-sale-mobile" 
                        checked={onSaleOnly}
                        onCheckedChange={(checked) => setOnSaleOnly(checked as boolean)}
                      />
                      <Label htmlFor="on-sale-mobile">On Sale</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Sort By */}
                <div>
                  <h3 className="font-medium mb-3">Sort By</h3>
                  <RadioGroup 
                    value={sortBy} 
                    onValueChange={setSortBy}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="newest" id="newest-mobile" />
                      <Label htmlFor="newest-mobile">Newest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="price-asc" id="price-asc-mobile" />
                      <Label htmlFor="price-asc-mobile">Price: Low to High</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="price-desc" id="price-desc-mobile" />
                      <Label htmlFor="price-desc-mobile">Price: High to Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="popular" id="popular-mobile" />
                      <Label htmlFor="popular-mobile">Popularity</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                  <Button 
                    className="flex-1 bg-primary"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-64 space-y-6 bg-white p-4 rounded-lg shadow-sm h-fit sticky top-20">
              {/* Search */}
              <div>
                <h3 className="font-medium mb-3">Search</h3>
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </form>
              </div>
              
              <Separator />
              
              {/* Categories */}
              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  <RadioGroup 
                    value={selectedCategory} 
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      refetch();
                    }}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All Products</Label>
                    </div>
                    
                    {isLoadingCategories ? (
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))
                    ) : (
                      categories?.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={category.slug} id={category.slug} />
                          <Label htmlFor={category.slug}>{category.name}</Label>
                        </div>
                      ))
                    )}
                  </RadioGroup>
                </div>
              </div>
              
              <Separator />
              
              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="space-y-4">
                  <Slider
                    defaultValue={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={(value: [number, number]) => {
                      setPriceRange(value);
                      refetch();
                    }}
                    className="my-6"
                  />
                  <div className="flex justify-between">
                    <div>
                      <Label>Min</Label>
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newValue = [parseInt(e.target.value), priceRange[1]];
                          setPriceRange(newValue as [number, number]);
                          refetch();
                        }}
                        className="w-20"
                      />
                    </div>
                    <div>
                      <Label>Max</Label>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newValue = [priceRange[0], parseInt(e.target.value)];
                          setPriceRange(newValue as [number, number]);
                          refetch();
                        }}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Availability */}
              <div>
                <h3 className="font-medium mb-3">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in-stock" 
                      checked={inStockOnly}
                      onCheckedChange={(checked) => {
                        setInStockOnly(checked as boolean);
                        refetch();
                      }}
                    />
                    <Label htmlFor="in-stock">In Stock Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="on-sale" 
                      checked={onSaleOnly}
                      onCheckedChange={(checked) => {
                        setOnSaleOnly(checked as boolean);
                        refetch();
                      }}
                    />
                    <Label htmlFor="on-sale">On Sale</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Sort By */}
              <div>
                <h3 className="font-medium mb-3">Sort By</h3>
                <RadioGroup 
                  value={sortBy} 
                  onValueChange={(value) => {
                    setSortBy(value);
                    refetch();
                  }}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="newest" id="newest" />
                    <Label htmlFor="newest">Newest</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-asc" id="price-asc" />
                    <Label htmlFor="price-asc">Price: Low to High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-desc" id="price-desc" />
                    <Label htmlFor="price-desc">Price: High to Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="popular" id="popular" />
                    <Label htmlFor="popular">Popularity</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
            
            {/* Product Grid */}
            <div className="flex-1">
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {renderSkeletonCards()}
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search term</p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
