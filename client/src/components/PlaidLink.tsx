import { useState, useEffect } from 'react';
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: () => void;
  isPayment?: boolean;
  buttonText?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export default function PlaidLink({
  onSuccess,
  onExit,
  isPayment = true,
  buttonText = 'Connect Bank Account',
  className = '',
  variant = 'default'
}: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to get link token');
        }
        
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error fetching link token:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize Plaid. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkToken();
  }, [toast]);

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess,
    onExit: () => {
      // Handle user exiting the Plaid Link flow
      if (onExit) {
        onExit();
      }
    },
  };

  const { open, ready } = usePlaidLink(config);

  const handleClick = () => {
    if (ready) {
      open();
    } else {
      toast({
        title: 'Not Ready',
        description: 'Plaid Link is not ready yet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !ready}
      className={className}
      variant={variant}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}
