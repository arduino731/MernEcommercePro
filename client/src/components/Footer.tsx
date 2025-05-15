import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Linkedin, CreditCard, Coins } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ShopMERN</h3>
            <p className="text-gray-400 mb-4">
              Your trusted destination for premium tech products with secure payment options.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop">
                  <a className="text-gray-400 hover:text-white">All Products</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=new">
                  <a className="text-gray-400 hover:text-white">New Arrivals</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?featured=true">
                  <a className="text-gray-400 hover:text-white">Featured</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?discount=true">
                  <a className="text-gray-400 hover:text-white">Discounts</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact">
                  <a className="text-gray-400 hover:text-white">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-gray-400 hover:text-white">FAQs</a>
                </Link>
              </li>
              <li>
                <Link href="/shipping">
                  <a className="text-gray-400 hover:text-white">Shipping Info</a>
                </Link>
              </li>
              <li>
                <Link href="/returns">
                  <a className="text-gray-400 hover:text-white">Returns Policy</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/profile">
                  <a className="text-gray-400 hover:text-white">My Account</a>
                </Link>
              </li>
              <li>
                <Link href="/orders">
                  <a className="text-gray-400 hover:text-white">Order History</a>
                </Link>
              </li>
              <li>
                <Link href="/wishlist">
                  <a className="text-gray-400 hover:text-white">Wishlist</a>
                </Link>
              </li>
              <li>
                <Link href="/newsletter">
                  <a className="text-gray-400 hover:text-white">Newsletter</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} ShopMERN. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy">
                <a className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              </Link>
              <Link href="/terms">
                <a className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              </Link>
              <Link href="/cookies">
                <a className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
              </Link>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <Coins className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
