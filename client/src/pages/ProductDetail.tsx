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
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // ✅ Review form state
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: product, isLoading, error, refetch } = useQuery<ProductDetailData>({
    queryKey: [`/api/products/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
    enabled: !!id,
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating,
          text: reviewText,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({ title: 'Error', description: result.message || 'Failed to submit review', variant: 'destructive' });
      } else {
        toast({ title: 'Thank you!', description: 'Your review has been posted.' });
        setReviewText('');
        setRating(5);
        refetch(); // Refresh product data to show new review
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An error occurred while submitting your review.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => quantity > 1 && setQuantity(prev => prev - 1);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < fullStars ? (
          <Star key={i} className="fill-accent text-accent h-4 w-4" />
        ) : (
          <Star key={i} className="text-gray-300 h-4 w-4" />
        )
      );
  };

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

  return (
    <>
      <Helmet>
        <title>{product.name} | ShopMERN</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* ... Product details and tabs omitted for brevity ... */}

          {/* Reviews Tab */}
          <Tabs defaultValue="description">
            {/* ...Other TabsList code here... */}
            <TabsContent value="reviews">
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
              )}

              {/* ✅ Review Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
