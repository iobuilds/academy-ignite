import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { MobileVerification } from '@/components/auth/MobileVerification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const signUpSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mobileNumber: z.string().min(9, 'Invalid mobile number'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

interface InlineAuthProps {
  onSuccess?: () => void;
}

export function InlineAuth({ onSuccess }: InlineAuthProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    mobileNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signUp, signIn } = useAuth();

  const notifyAdmin = async (userName: string, userEmail: string, userMobile: string) => {
    try {
      await supabase.functions.invoke('send-sms?action=notify_admin', {
        body: {
          type: 'new_registration',
          user_name: userName,
          user_email: userEmail,
          user_mobile: userMobile,
        },
      });
    } catch (error) {
      console.error('Failed to notify admin:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!isMobileVerified) {
          toast.error('Please verify your mobile number first');
          setIsLoading(false);
          return;
        }

        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        let formattedNumber = formData.mobileNumber.replace(/\D/g, '');
        if (!formattedNumber.startsWith('94')) {
          formattedNumber = '94' + formattedNumber.replace(/^0/, '');
        }

        const { error } = await signUp(formData.email, formData.password, formData.displayName, formattedNumber);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          await notifyAdmin(formData.displayName, formData.email, formattedNumber);
          toast.success('Account created successfully!');
          onSuccess?.();
        }
      } else {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Signed in successfully!');
          onSuccess?.();
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setIsMobileVerified(false);
    setFormData({ displayName: '', email: '', password: '', mobileNumber: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? 'Create an account to register' : 'Sign in to your account'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {isSignUp && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="inline-displayName" className="text-sm">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="inline-displayName"
                  placeholder="Enter your name"
                  className="pl-9 h-9"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
              {errors.displayName && (
                <p className="text-destructive text-xs">{errors.displayName}</p>
              )}
            </div>

            <MobileVerification
              mobileNumber={formData.mobileNumber}
              onMobileChange={(value) => setFormData({ ...formData, mobileNumber: value })}
              onVerified={() => setIsMobileVerified(true)}
              purpose="registration"
            />
          </>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="inline-email" className="text-sm">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              id="inline-email"
              type="email"
              placeholder="Enter your email"
              className="pl-9 h-9"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inline-password" className="text-sm">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              id="inline-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="pl-9 pr-9 h-9"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password}</p>
          )}
        </div>

        {isSignUp && !isMobileVerified && (
          <p className="text-destructive text-xs bg-destructive/10 p-2 rounded-lg border border-destructive/20">
            ⚠️ Please verify your mobile number first
          </p>
        )}

        <Button
          type="submit"
          variant="hero"
          size="sm"
          className="w-full"
          disabled={isLoading || (isSignUp && !isMobileVerified)}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              {isSignUp ? 'Creating...' : 'Signing In...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight size={16} />
            </span>
          )}
        </Button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-muted-foreground">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={handleModeSwitch}
            className="text-primary hover:underline font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
