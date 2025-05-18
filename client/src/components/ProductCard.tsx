import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  variant?: string;
}


interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      quantity: 1
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      variant: "default",
    });
  };
  console.log("🔗 Link href:", `/products/${product.id}`);

  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
    <Link href={`/products/${product.id}`}>
      <a className="block">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            {product.isNew && (
              <span className="bg-accent text-xs font-bold py-1 px-2 rounded text-gray-900">NEW</span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-4">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-primary font-bold">{formatCurrency(product.price)}</span>
            <Button 
              size="sm"
              className="bg-primary hover:bg-blue-600 text-white" 
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </a>
    </Link>



    </div>
  );
};

export default ProductCard;
