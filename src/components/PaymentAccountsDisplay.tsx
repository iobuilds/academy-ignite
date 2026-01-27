import { useEffect, useState } from 'react';
import { Building2, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string | null;
}

export function PaymentAccountsDisplay() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Account number copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-muted/50 rounded-lg h-24"></div>
    );
  }

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
        <Building2 size={16} className="text-primary" />
        Bank Transfer Details
      </h4>
      <p className="text-xs text-muted-foreground mb-3">
        Please transfer the payment to one of these accounts and upload your receipt below
      </p>
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-background rounded-md p-3 border border-border"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-sm">
                  {account.bank_name}
                  {account.branch && (
                    <span className="text-muted-foreground font-normal"> - {account.branch}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{account.account_name}</p>
                <p className="font-mono text-base font-semibold mt-1">{account.account_number}</p>
              </div>
              <button
                onClick={() => copyToClipboard(account.account_number, account.id)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title="Copy account number"
              >
                {copiedId === account.id ? (
                  <CheckCircle size={16} className="text-accent" />
                ) : (
                  <Copy size={16} className="text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
