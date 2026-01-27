import { useState, useEffect } from 'react';
import { Phone, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BankAccountManager } from './BankAccountManager';

export function AdminSettings() {
  const [adminMobile, setAdminMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'admin_mobile_number')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAdminMobile(data.value || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let formattedNumber = adminMobile.replace(/\D/g, '');
      if (formattedNumber && !formattedNumber.startsWith('94')) {
        formattedNumber = '94' + formattedNumber.replace(/^0/, '');
      }

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'admin_mobile_number',
          value: formattedNumber,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (error) throw error;
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure admin notifications for new user registrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="admin-mobile">Admin Mobile Number</Label>
            <p className="text-sm text-muted-foreground">
              This number will receive SMS notifications when new users register
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="admin-mobile"
                  type="tel"
                  placeholder="07X XXX XXXX"
                  className="pl-10"
                  value={adminMobile}
                  onChange={(e) => setAdminMobile(e.target.value)}
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Save size={18} />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <BankAccountManager />
    </div>
  );
}
