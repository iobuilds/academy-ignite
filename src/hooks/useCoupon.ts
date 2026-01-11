import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CouponCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  applicable_courses: string[];
}

export function useValidateCoupon(code: string, courseId: string) {
  return useQuery({
    queryKey: ['coupon', code, courseId],
    queryFn: async () => {
      if (!code) return null;

      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Invalid coupon code');
      }

      const coupon = data as CouponCode;

      // Check if coupon is valid for this course
      if (coupon.applicable_courses.length > 0 && !coupon.applicable_courses.includes(courseId)) {
        throw new Error('This coupon is not valid for this course');
      }

      // Check if coupon has uses left
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        throw new Error('This coupon has reached its maximum uses');
      }

      // Check if coupon is within valid date range
      const now = new Date();
      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        throw new Error('This coupon has expired');
      }

      return coupon;
    },
    enabled: !!code && code.length >= 3,
    retry: false,
  });
}

export function calculateDiscount(coupon: CouponCode | null, originalPrice: number): number {
  if (!coupon) return 0;

  if (coupon.discount_type === 'percentage') {
    return Math.round(originalPrice * (coupon.discount_value / 100) * 100) / 100;
  } else {
    return Math.min(coupon.discount_value, originalPrice);
  }
}
