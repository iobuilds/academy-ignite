import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, CheckCircle, AlertCircle, Loader2, Upload, FileImage } from 'lucide-react';
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
import { useNavigate, Link } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';
import { useValidateCoupon, calculateDiscount } from '@/hooks/useCoupon';
import { InlineAuth } from '@/components/auth/InlineAuth';
import { PaymentAccountsDisplay } from '@/components/PaymentAccountsDisplay';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourse?: string;
}

export default function RegistrationModal({ isOpen, onClose, preselectedCourse }: RegistrationModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: courses } = useCourses();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: coupon, isLoading: couponLoading, error: couponError } = useValidateCoupon(
    appliedCoupon || '',
    formData.course
  );

  // Only show courses with registration_open = true
  const openCourses = courses?.filter(c => c.registration_open) || [];

  // Update course when preselectedCourse changes
  useEffect(() => {
    if (preselectedCourse) {
      setFormData(prev => ({ ...prev, course: preselectedCourse }));
    }
  }, [preselectedCourse]);

  // Pre-fill user data from profile when logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, mobile_number')
          .eq('id', user.id)
          .single();
        
        let phone = profile?.mobile_number || '';
        // Format phone for display (remove country code if present)
        if (phone.startsWith('94')) {
          phone = '0' + phone.slice(2);
        }
        
        setFormData(prev => ({
          ...prev,
          name: profile?.display_name || '',
          email: user.email || '',
          phone: phone,
        }));
      }
    };
    
    fetchUserProfile();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }
      setPaymentSlip(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (!user) {
      toast.error('Please create an account or sign in first');
      onClose();
      navigate('/auth');
      return;
    }

    if (!paymentSlip) {
      toast.error('Please upload your bank transfer slip');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload payment slip
      const fileExt = paymentSlip.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      setUploadProgress(30);
      const { error: uploadError } = await supabase.storage
        .from('payment_slips')
        .upload(fileName, paymentSlip);

      if (uploadError) {
        throw new Error('Failed to upload payment slip');
      }
      setUploadProgress(60);

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
          payment_slip_url: fileName,
          payment_verified: false, // Pending until admin verifies
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save registration');
      }
      setUploadProgress(80);

      // Create enrollment with pending status
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: formData.course,
          registration_id: registration.id,
          status: 'pending', // Pending until payment verified
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
      setUploadProgress(100);

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
        body: formData,
      });

      if (emailError) {
        console.error('Email error:', emailError);
      }

      // Notify admin about new payment submission
      let formattedNumber = formData.phone.replace(/\D/g, '');
      if (!formattedNumber.startsWith('94')) {
        formattedNumber = '94' + formattedNumber.replace(/^0/, '');
      }
      
      await supabase.functions.invoke('send-sms?action=notify_admin', {
        body: {
          type: 'new_payment',
          user_name: formData.name,
          user_email: formData.email,
          user_mobile: formattedNumber,
          course_name: selectedCourse?.title || formData.course,
        },
      });
      
      toast.success('Registration submitted! Your payment is pending verification.');
      
      setFormData({ name: '', email: user?.email || '', phone: '', course: '' });
      setCouponCode('');
      setAppliedCoupon(null);
      setTermsAccepted(false);
      setPaymentSlip(null);
      setUploadProgress(0);
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
              <div className="border border-border rounded-lg p-4 mb-6">
                <InlineAuth onSuccess={() => {}} />
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
                    {openCourses.map((course) => (
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

              {/* Payment Account Details & Bank Transfer Slip Upload */}
              {formData.course && user && (
                <div className="space-y-4">
                  <PaymentAccountsDisplay />
                  
                  <div className="space-y-2">
                    <Label>Bank Transfer Slip *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {paymentSlip ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileImage size={20} className="text-primary" />
                          <span className="text-sm truncate max-w-[200px]">{paymentSlip.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPaymentSlip(null)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={16} className="mr-2" />
                        Upload Payment Slip
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload your bank transfer receipt (Image or PDF, max 5MB)
                    </p>
                    </div>
                  </div>
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
                  <p className="text-xs text-muted-foreground mt-2">
                    ⏳ Your registration will be pending until payment is verified by admin.
                  </p>
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
                    <Link to="/terms" className="text-primary hover:underline" onClick={onClose}>Terms and Conditions</Link>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full mt-6"
                disabled={isSubmitting || !user || !termsAccepted || !paymentSlip}
              >
                {isSubmitting ? 'Submitting...' : `Submit Registration - $${finalPrice.toFixed(2)}`}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
