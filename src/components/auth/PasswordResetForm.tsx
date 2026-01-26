import { useState } from 'react';
import { Eye, EyeOff, Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileVerification } from './MobileVerification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

interface PasswordResetFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function PasswordResetForm({ onBack, onSuccess }: PasswordResetFormProps) {
  const [step, setStep] = useState<'mobile' | 'password' | 'success'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMobileVerified = () => {
    setStep('password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      let formattedNumber = mobileNumber.replace(/\D/g, '');
      if (!formattedNumber.startsWith('94')) {
        formattedNumber = '94' + formattedNumber.replace(/^0/, '');
      }

      const response = await supabase.functions.invoke('reset-password', {
        body: { mobile_number: formattedNumber, new_password: password },
      });

      if (response.error || response.data?.error) {
        toast.error(response.data?.error || 'Failed to reset password');
        return;
      }

      setStep('success');
      toast.success('Password reset successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <h2 className="text-xl font-bold mb-2">Password Reset Successful!</h2>
        <p className="text-muted-foreground mb-6">
          You can now sign in with your new password.
        </p>
        <Button onClick={onSuccess}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Sign In
      </button>

      <div>
        <h2 className="font-display text-xl font-bold">Reset Password</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {step === 'mobile'
            ? 'Enter your registered mobile number to receive an OTP'
            : 'Enter your new password'}
        </p>
      </div>

      {step === 'mobile' && (
        <MobileVerification
          mobileNumber={mobileNumber}
          onMobileChange={setMobileNumber}
          onVerified={handleMobileVerified}
          purpose="password_reset"
        />
      )}

      {step === 'password' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                className="pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
