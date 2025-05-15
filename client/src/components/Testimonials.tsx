import { Star, StarHalf } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Testimonial {
  id: string;
  text: string;
  rating: number;
  author: {
    name: string;
    initials: string;
    verified: boolean;
  };
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    text: "The checkout process was incredibly smooth. I love how I can securely connect my bank account through Plaid. Will definitely shop here again!",
    rating: 5,
    author: {
      name: 'James Smith',
      initials: 'JS',
      verified: true,
    },
  },
  {
    id: '2',
    text: "Fast shipping and the products were exactly as described. The payment process was quick and I felt secure knowing my information was protected.",
    rating: 5,
    author: {
      name: 'Emily Johnson',
      initials: 'EJ',
      verified: true,
    },
  },
  {
    id: '3',
    text: "Great selection of tech products at competitive prices. The website is easy to navigate and the customer service team was very helpful with my questions.",
    rating: 4.5,
    author: {
      name: 'Michael Chen',
      initials: 'MC',
      verified: true,
    },
  },
];

const Testimonials = () => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-accent text-accent h-4 w-4" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-accent text-accent h-4 w-4" />);
    }
    
    return stars;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-accent">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              <p className="text-gray-700 mb-6">{testimonial.text}</p>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                    {testimonial.author.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{testimonial.author.name}</h4>
                  <p className="text-gray-500 text-sm">
                    {testimonial.author.verified ? 'Verified Buyer' : 'Customer'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
