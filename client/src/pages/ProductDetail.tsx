import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingCart,
  ChevronRight,
  Minus,
  Plus,
  Star,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product as ProductType } from '@/components/ProductCard';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet';

interface ProductDetailData extends ProductType {
  longDescription: string;
  specifications: { label: string; value: string }[];
  variants: { name: string; inStock: boolean }[];
  reviews: {
    id: string;
    author: string;
    rating: number;
    date: string;
    text: string;
  }[];
  relatedProducts: ProductType[];
}

const ProductDetail = () => {
  const { id } = useParams(); // ✅ should give you the product ID from the URL
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // ✅ Review form state
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      if (!id) throw new Error("Missing product ID");
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
    enabled: !!id, // only run query when `id` is available
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        quantity,
        variant: selectedVariant || undefined,
      });
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
        variant: 'default',
      });
    }
  };

  // const handleReviewSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!reviewText.trim()) return;

  //   setIsSubmitting(true);
  //   try {
  //     const res = await fetch(`/api/products/${id}/reviews`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify({
  //         rating,
  //         text: reviewText,
  //       }),
  //     });

  //     const result = await res.json();

  //     if (!res.ok) {
  //       toast({ title: 'Error', description: result.message || 'Failed to submit review', variant: 'destructive' });
  //     } else {
  //       toast({ title: 'Thank you!', description: 'Your review has been posted.' });
  //       setReviewText('');
  //       setRating(5);
  //       refetch(); // Refresh product data to show new review
  //     }
  //   } catch (err) {
  //     toast({ title: 'Error', description: 'An error occurred while submitting your review.', variant: 'destructive' });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // const increaseQuantity = () => setQuantity(prev => prev + 1);
  // const decreaseQuantity = () => quantity > 1 && setQuantity(prev => prev - 1);

  // const renderStars = (rating: number) => {
  //   const fullStars = Math.floor(rating);
  //   return Array(5)
  //     .fill(0)
  //     .map((_, i) =>
  //       i < fullStars ? (
  //         <Star key={i} className="fill-accent text-accent h-4 w-4" />
  //       ) : (
  //         <Star key={i} className="text-gray-300 h-4 w-4" />
  //       )
  //     );
  // };

  if (isLoading) return <div className="container mx-auto py-16 text-center">Loading...</div>;
  if (error || !product) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
      <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
      <Link href="/shop"><Button><ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop</Button></Link>
    </div>
  );

  const avgRating = product.reviews.length
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  console.log("🧩 ProductDetail page loaded");


  return (
    <>
      <Helmet>
        <title>{product.name} | ShopMERN</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} | ShopMERN`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.imageUrl} />
        <meta property="og:type" content="product" />
      </Helmet>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/">
              <a className="hover:text-primary">Home</a>
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/shop">
              <a className="hover:text-primary">Shop</a>
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-700 font-medium">{product.name}</span>
          </nav>
          
          {/* Product details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product image */}
              <div>
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full rounded-lg"
                />
              </div>
              
              {/* Product info */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                
                {/* Rating */}
                {/* {product.reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(avgRating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )} */}
                
                {/* Price */}
                <div>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</span>
                  {product.isNew && (
                    <span className="ml-3 bg-accent text-xs font-bold py-1 px-2 rounded text-gray-900">NEW</span>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-gray-600">{product.description}</p>
                
                <Separator />
                
                {/* Variants */}
                {product.variants.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Available Options</h3>
                    <RadioGroup
                      value={selectedVariant || ''}
                      onValueChange={setSelectedVariant}
                      className="space-y-2"
                    >
                      {product.variants.map((variant) => (
                        <div
                          key={variant.name}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={variant.name}
                            id={variant.name}
                            disabled={!variant.inStock}
                          />
                          <Label htmlFor={variant.name} className={!variant.inStock ? 'text-gray-400' : ''}>
                            {variant.name}
                            {!variant.inStock && <span className="ml-2 text-gray-400">(Out of Stock)</span>}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
                
                {/* Quantity */}
                <div>
                  <h3 className="font-medium mb-2">Quantity</h3>
                  <div className="flex items-center space-x-2">
                    {/* <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button> */}
                    <span className="w-10 text-center">{quantity}</span>
                    {/* <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={increaseQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button> */}
                  </div>
                </div>
                
                {/* Add to cart button */}
                <Button 
                  className="w-full mt-6 bg-primary hover:bg-blue-600 text-white h-12 text-lg"
                  disabled={!product.inStock || (product.variants.length > 0 && !selectedVariant)}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                
                {/* Stock status */}
                <div className="flex items-center text-sm">
                  {product.inStock ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">In Stock</span>
                    </>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product details tabs */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <Tabs defaultValue="description">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="text-gray-600">
                <p className="whitespace-pre-line">{product.longDescription}</p>
              </TabsContent>
              
              <TabsContent value="specifications">
                <div className="space-y-2">
                  {product.specifications.map((spec, index) => (
                    <div 
                      key={index} 
                      className={`grid grid-cols-3 gap-4 py-2 ${
                        index !== product.specifications.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-700">{spec.label}</div>
                      <div className="col-span-2 text-gray-600">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* <TabsContent value="reviews">
                {product.reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">{review.author}</h4>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-600">{review.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent> */}
            </Tabs>
          </div>
          
          {/* Related products */}
          {product.relatedProducts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {product.relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                    <a>
                      <div className="product-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
                        <img 
                          src={relatedProduct.imageUrl} 
                          alt={relatedProduct.name} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{relatedProduct.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{relatedProduct.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-primary font-bold">{formatCurrency(relatedProduct.price)}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

{/* ============================================ */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* ... Product details and tabs omitted for brevity ... */}

          {/* Reviews Tab */}
          {/* <Tabs defaultValue="description"> */}
            {/* ...Other TabsList code here... */}
            {/* <TabsContent value="reviews">
              {product.reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6 mb-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{review.author}</h4>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex mb-2">{renderStars(review.rating)}</div>
                      <p className="text-gray-600">{review.text}</p>
                    </div>
                  ))}
                </div>
              )} */}

              {/* ✅ Review Form */}
              {/* <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Your Rating</label>
                  <select
                    className="border rounded px-3 py-2"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    required
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} Star{num > 1 && 's'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Your Review</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            </TabsContent> */}
          {/* </Tabs> */}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
