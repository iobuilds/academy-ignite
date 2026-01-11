import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourse?: string;
}

export default function RegistrationModal({ isOpen, onClose, preselectedCourse }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: preselectedCourse || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update course when preselectedCourse changes
  React.useEffect(() => {
    if (preselectedCourse) {
      setFormData(prev => ({ ...prev, course: preselectedCourse }));
    }
  }, [preselectedCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save registration to database
      const { error: dbError } = await supabase
        .from('registrations')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          course: formData.course,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save registration');
      }

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
        body: formData,
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't throw - registration is saved, just email failed
        toast.success('Registration successful! We will contact you soon.');
      } else {
        toast.success('Registration successful! Check your email for confirmation.');
      }
      
      setFormData({ name: '', email: '', phone: '', course: '' });
      onClose();
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
            className="relative bg-card rounded-2xl shadow-xl max-w-md w-full p-8 z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="font-display text-2xl font-bold mb-2">Register Now</h2>
            <p className="text-muted-foreground mb-6">
              Fill out the form below and we'll get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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
                />
              </div>

              <div className="space-y-2">
                <Label>Select Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData({ ...formData, course: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iot-robotics">IoT and Robotics (Ages 4-10)</SelectItem>
                    <SelectItem value="embedded-systems">Embedded Systems Bootcamp</SelectItem>
                    <SelectItem value="product-development">Product Development Bootcamp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
