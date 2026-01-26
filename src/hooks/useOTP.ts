import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseOTPReturn {
  isSending: boolean;
  isVerifying: boolean;
  isVerified: boolean;
  error: string | null;
  countdown: number;
  sendOTP: (mobileNumber: string, purpose: 'registration' | 'password_reset') => Promise<boolean>;
  verifyOTP: (mobileNumber: string, otp: string, purpose: 'registration' | 'password_reset') => Promise<boolean>;
  resetState: () => void;
}

export function useOTP(): UseOTPReturn {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendOTP = useCallback(async (mobileNumber: string, purpose: 'registration' | 'password_reset'): Promise<boolean> => {
    setIsSending(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('send-sms', {
        body: { mobile_number: mobileNumber, purpose },
      });

      if (response.error) {
        setError(response.error.message || 'Failed to send OTP');
        return false;
      }

      if (response.data?.error) {
        setError(response.data.error);
        return false;
      }

      startCountdown();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [startCountdown]);

  const verifyOTP = useCallback(async (mobileNumber: string, otp: string, purpose: 'registration' | 'password_reset'): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('verify-otp', {
        body: { mobile_number: mobileNumber, otp, purpose },
      });

      if (response.error) {
        setError(response.error.message || 'Failed to verify OTP');
        return false;
      }

      if (response.data?.error) {
        setError(response.data.error);
        return false;
      }

      setIsVerified(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setIsVerified(false);
    setError(null);
    setCountdown(0);
  }, []);

  return {
    isSending,
    isVerifying,
    isVerified,
    error,
    countdown,
    sendOTP,
    verifyOTP,
    resetState,
  };
}
