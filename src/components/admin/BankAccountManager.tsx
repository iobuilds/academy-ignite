import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string | null;
  is_active: boolean;
}

export function BankAccountManager() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    branch: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.bank_name || !formData.account_name || !formData.account_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          bank_name: formData.bank_name,
          account_name: formData.account_name,
          account_number: formData.account_number,
          branch: formData.branch || null,
        })
        .select()
        .single();

      if (error) throw error;

      setAccounts([...accounts, data]);
      setFormData({ bank_name: '', account_name: '', account_number: '', branch: '' });
      setIsAdding(false);
      toast.success('Bank account added successfully');
    } catch (error: any) {
      console.error('Error adding bank account:', error);
      toast.error(error.message || 'Failed to add bank account');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({
          bank_name: formData.bank_name,
          account_name: formData.account_name,
          account_number: formData.account_number,
          branch: formData.branch || null,
        })
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.map(a => 
        a.id === id 
          ? { ...a, ...formData, branch: formData.branch || null }
          : a
      ));
      setEditingId(null);
      setFormData({ bank_name: '', account_name: '', account_number: '', branch: '' });
      toast.success('Bank account updated');
    } catch (error: any) {
      console.error('Error updating bank account:', error);
      toast.error(error.message || 'Failed to update');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.map(a => 
        a.id === id ? { ...a, is_active: isActive } : a
      ));
      toast.success(isActive ? 'Account activated' : 'Account deactivated');
    } catch (error: any) {
      console.error('Error toggling account:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.filter(a => a.id !== id));
      toast.success('Bank account deleted');
    } catch (error: any) {
      console.error('Error deleting bank account:', error);
      toast.error(error.message || 'Failed to delete');
    }
  };

  const startEdit = (account: BankAccount) => {
    setEditingId(account.id);
    setFormData({
      bank_name: account.bank_name,
      account_name: account.account_name,
      account_number: account.account_number,
      branch: account.branch || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ bank_name: '', account_name: '', account_number: '', branch: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bank Accounts</CardTitle>
            <CardDescription>
              Manage bank accounts for student payment transfers
            </CardDescription>
          </div>
          {!isAdding && !editingId && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus size={16} className="mr-1" />
              Add Account
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Bank Name *</Label>
                <Input
                  placeholder="e.g., Commercial Bank"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Branch</Label>
                <Input
                  placeholder="e.g., Colombo"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Account Name *</Label>
              <Input
                placeholder="e.g., IO Builds Academy"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Account Number *</Label>
              <Input
                placeholder="e.g., 1234567890"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                size="sm"
              >
                <Save size={16} className="mr-1" />
                {editingId ? 'Update' : 'Save'}
              </Button>
              <Button onClick={cancelEdit} variant="outline" size="sm">
                <X size={16} className="mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Account List */}
        {accounts.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="mx-auto mb-2 opacity-50" size={32} />
            <p>No bank accounts added yet</p>
            <p className="text-sm">Add a bank account so students know where to transfer payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`border rounded-lg p-4 ${!account.is_active ? 'opacity-50 bg-muted/30' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-primary" />
                      <span className="font-medium">{account.bank_name}</span>
                      {account.branch && (
                        <span className="text-sm text-muted-foreground">- {account.branch}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{account.account_name}</p>
                    <p className="font-mono text-lg">{account.account_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={account.is_active}
                      onCheckedChange={(checked) => handleToggleActive(account.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(account)}
                      disabled={!!editingId || isAdding}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(account.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
