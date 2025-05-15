import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import AuthModal from './AuthModal';
import CartSidebar from './CartSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X 
} from 'lucide-react';

const Header = () => {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality with the searchQuery
    console.log('Searching for:', searchQuery);
  };

  useEffect(() => {
    // Close mobile menu when changing routes
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-primary text-xl font-bold">ShopMERN</span>
              </Link>
              <nav className="hidden md:ml-10 md:flex space-x-8">
                <Link href="/">
                  <a className={`font-medium ${location === '/' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                    Home
                  </a>
                </Link>
                <Link href="/shop">
                  <a className={`font-medium ${location === '/shop' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                    Shop
                  </a>
                </Link>
                <Link href="/shop?category=all">
                  <a className={`font-medium ${location.includes('category') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                    Categories
                  </a>
                </Link>
                <Link href="/about">
                  <a className={`font-medium ${location === '/about' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                    About
                  </a>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <form onSubmit={handleSearch}>
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="w-64 pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </form>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
              {isAuthenticated ? (
                <div className="relative">
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" aria-label="User profile">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button variant="ghost" size="icon" onClick={toggleAuthModal} aria-label="Login or register">
                  <User className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link href="/">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                    Home
                  </a>
                </Link>
                <Link href="/shop">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                    Shop
                  </a>
                </Link>
                <Link href="/shop?category=all">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                    Categories
                  </a>
                </Link>
                <Link href="/about">
                  <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                    About
                  </a>
                </Link>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                  <div className="relative w-full">
                    <form onSubmit={handleSearch}>
                      <Input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
