import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';
import { useValidateCoupon, calculateDiscount } from '@/hooks/useCoupon';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourse?: string;
}

export default function RegistrationModal({ isOpen, onClose, preselectedCourse }: RegistrationModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: courses } = useCourses();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: preselectedCourse || '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: coupon, isLoading: couponLoading, error: couponError } = useValidateCoupon(
    appliedCoupon || '',
    formData.course
  );

  // Update course when preselectedCourse changes
  useEffect(() => {
    if (preselectedCourse) {
      setFormData(prev => ({ ...prev, course: preselectedCourse }));
    }
  }, [preselectedCourse]);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const selectedCourse = courses?.find(c => c.id === formData.course);
  const originalPrice = selectedCourse?.price || 0;
  const discountAmount = calculateDiscount(coupon || null, originalPrice);
  const finalPrice = originalPrice - discountAmount;

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      setAppliedCoupon(couponCode.trim().toUpperCase());
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error('Please create an account or sign in first');
      onClose();
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save registration to database
      const { data: registration, error: dbError } = await supabase
        .from('registrations')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          course: formData.course,
          user_id: user.id,
          coupon_code: appliedCoupon,
          discount_amount: discountAmount,
          final_price: finalPrice,
          terms_accepted: termsAccepted,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save registration');
      }

      // Create enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: formData.course,
          registration_id: registration.id,
          status: 'enrolled',
        });

      if (enrollError && !enrollError.message.includes('duplicate')) {
        console.error('Enrollment error:', enrollError);
      }

      // Update coupon usage
      if (appliedCoupon && coupon) {
        await supabase
          .from('coupon_codes')
          .update({ current_uses: (coupon.current_uses || 0) + 1 })
          .eq('id', coupon.id);
      }

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
        body: formData,
      });

      if (emailError) {
        console.error('Email error:', emailError);
        toast.success('Registration successful! We will contact you soon.');
      } else {
        toast.success('Registration successful! Check your email for confirmation.');
      }
      
      setFormData({ name: '', email: user?.email || '', phone: '', course: '' });
      setCouponCode('');
      setAppliedCoupon(null);
      setTermsAccepted(false);
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-card rounded-2xl shadow-xl max-w-md w-full p-8 z-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="font-display text-2xl font-bold mb-2">Register Now</h2>
            <p className="text-muted-foreground mb-6">
              {user ? 'Complete your registration' : 'Sign in required to register'}
            </p>

            {!user && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-accent font-medium">
                  Please sign in or create an account first to register for a course.
                </p>
                <Button
                  variant="hero"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    onClose();
                    navigate('/auth');
                  }}
                >
                  Sign In / Sign Up
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={!user}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!user}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={!user}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData({ ...formData, course: value })}
                  disabled={!user}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} - ${course.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Coupon Code */}
              {formData.course && user && (
                <div className="space-y-2">
                  <Label>Coupon Code (Optional)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        placeholder="Enter coupon code"
                        className="pl-10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                      />
                    </div>
                    {appliedCoupon ? (
                      <Button type="button" variant="outline" onClick={handleRemoveCoupon}>
                        Remove
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={!couponCode.trim()}>
                        Apply
                      </Button>
                    )}
                  </div>
                  
                  {couponLoading && appliedCoupon && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 size={14} className="animate-spin" />
                      Validating coupon...
                    </div>
                  )}
                  
                  {couponError && appliedCoupon && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle size={14} />
                      {couponError.message}
                    </div>
                  )}
                  
                  {coupon && appliedCoupon && (
                    <div className="flex items-center gap-2 text-sm text-accent">
                      <CheckCircle size={14} />
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% discount applied!`
                        : `$${coupon.discount_value} discount applied!`}
                    </div>
                  )}
                </div>
              )}

              {/* Price Summary */}
              {formData.course && user && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Price</span>
                    <span>${originalPrice.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-accent">
                      <span>Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">${finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              {user && (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>
              )}

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full mt-6"
                disabled={isSubmitting || !user || !termsAccepted}
              >
                {isSubmitting ? 'Submitting...' : `Complete Registration - $${finalPrice.toFixed(2)}`}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
