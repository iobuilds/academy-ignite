import { useState } from 'react';
import { Phone, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useOTP } from '@/hooks/useOTP';
import { cn } from '@/lib/utils';

interface MobileVerificationProps {
  mobileNumber: string;
  onMobileChange: (value: string) => void;
  onVerified: () => void;
  purpose: 'registration' | 'password_reset';
  disabled?: boolean;
}

export function MobileVerification({
  mobileNumber,
  onMobileChange,
  onVerified,
  purpose,
  disabled = false,
}: MobileVerificationProps) {
  const [otp, setOtp] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const { isSending, isVerifying, isVerified, error, countdown, sendOTP, verifyOTP } = useOTP();

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length < 9) {
      return;
    }

    // Format number to include country code if not present
    let formattedNumber = mobileNumber.replace(/\D/g, '');
    if (!formattedNumber.startsWith('94')) {
      formattedNumber = '94' + formattedNumber.replace(/^0/, '');
    }

    const success = await sendOTP(formattedNumber, purpose);
    if (success) {
      setShowOTPInput(true);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;

    let formattedNumber = mobileNumber.replace(/\D/g, '');
    if (!formattedNumber.startsWith('94')) {
      formattedNumber = '94' + formattedNumber.replace(/^0/, '');
    }

    const success = await verifyOTP(formattedNumber, otp, purpose);
    if (success) {
      onVerified();
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    handleSendOTP();
  };

  if (isVerified) {
    return (
      <div className="space-y-2">
        <Label>Mobile Number</Label>
        <div className="flex items-center gap-2 p-3 bg-accent/20 rounded-lg border border-accent/30">
          <CheckCircle className="text-accent" size={20} />
          <span className="text-accent font-medium">
            {mobileNumber} - Verified
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile Number</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              id="mobile"
              type="tel"
              placeholder="07X XXX XXXX"
              className="pl-10"
              value={mobileNumber}
              onChange={(e) => onMobileChange(e.target.value)}
              disabled={disabled || showOTPInput}
            />
          </div>
          {!showOTPInput && (
            <Button
              type="button"
              onClick={handleSendOTP}
              disabled={disabled || isSending || !mobileNumber || mobileNumber.length < 9}
            >
              {isSending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                'Send OTP'
              )}
            </Button>
          )}
        </div>
      </div>

      {showOTPInput && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
          <Label>Enter OTP (valid for 5 minutes)</Label>
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <div className="flex gap-2 w-full">
              <Button
                type="button"
                onClick={handleVerifyOTP}
                disabled={isVerifying || otp.length !== 6}
                className="flex-1"
              >
                {isVerifying ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isSending}
              >
                {countdown > 0 ? `Resend (${countdown}s)` : 'Resend'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
}
