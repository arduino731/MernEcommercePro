import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
import SecurePayment from '@/components/SecurePayment';
import NewArrivals from '@/components/NewArrivals';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';
import { Helmet } from 'react-helmet';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>ShopMERN - High Quality Tech Products with Secure Payments</title>
        <meta name="description" content="Shop the latest tech products with secure Plaid-powered payments. Find smartphones, headphones, wearables and more with fast shipping and great customer service." />
        <meta property="og:title" content="ShopMERN - High Quality Tech Products" />
        <meta property="og:description" content="Shop the latest tech products with secure payments. Discover great deals on smartphones, headphones, wearables and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopmern.com" />
      </Helmet>
      
      <Hero />
      <FeaturedProducts />
      <Categories />
      <SecurePayment />
      <NewArrivals />
      <Testimonials />
      <Newsletter />
    </>
  );
};

export default Home;
