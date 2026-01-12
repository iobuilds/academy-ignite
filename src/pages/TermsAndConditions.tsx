import { motion } from 'framer-motion';
import { FileText, Shield, CreditCard, BookOpen, AlertCircle, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sections = [
  {
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: `By accessing and using IO Builds Academy's services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.

These terms apply to all users, students, and visitors of our platform. We reserve the right to modify these terms at any time, and such modifications will be effective immediately upon posting.`,
  },
  {
    icon: BookOpen,
    title: '2. Course Registration & Enrollment',
    content: `- Registration requires accurate personal information including name, email, and phone number.
- Course fees must be paid in full before accessing course materials.
- Coupon codes, when valid, will be applied at the time of registration.
- Registration is confirmed only after payment verification by our team.
- Students must be of appropriate age for their selected course, or have parental/guardian consent.`,
  },
  {
    icon: CreditCard,
    title: '3. Payment & Refund Policy',
    content: `**Payment Terms:**
- All prices are listed in USD unless otherwise specified.
- Payment must be completed through approved payment methods.
- Discounts and promotional offers cannot be combined unless explicitly stated.

**Refund Policy:**
- Full refund available within 7 days of enrollment if no course content has been accessed.
- 50% refund available within 14 days if less than 25% of course content has been completed.
- No refunds after 14 days or if more than 25% of course content has been completed.
- Refunds are processed within 10 business days.`,
  },
  {
    icon: Shield,
    title: '4. Intellectual Property',
    content: `All course materials, including but not limited to videos, documents, code samples, and project files, are the intellectual property of IO Builds Academy.

**You may:**
- Access materials for personal learning purposes
- Take notes and create personal references
- Share knowledge gained with proper attribution

**You may not:**
- Redistribute, resell, or share course materials
- Record or screenshot course content for distribution
- Use materials for commercial purposes without written permission
- Claim authorship of any course materials`,
  },
  {
    icon: AlertCircle,
    title: '5. Code of Conduct',
    content: `Students are expected to:
- Maintain respectful communication with instructors and fellow students
- Not engage in any form of harassment or discrimination
- Not share login credentials or course access with others
- Report any technical issues or concerns promptly
- Complete assignments and projects with integrity (no plagiarism)

Violation of these guidelines may result in:
- Warning or temporary suspension
- Permanent removal from the course without refund
- Legal action in severe cases`,
  },
  {
    icon: Shield,
    title: '6. Privacy & Data Protection',
    content: `We are committed to protecting your privacy:

**Data Collection:**
- We collect personal information necessary for registration and course delivery
- Usage data is collected to improve our services
- Payment information is processed securely and not stored on our servers

**Data Usage:**
- Your information is used solely for course delivery and communication
- We do not sell or share your data with third parties for marketing
- You may request data deletion at any time

**Communication:**
- By registering, you agree to receive course-related communications
- You can opt out of promotional emails at any time`,
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Header onRegisterClick={() => {}} />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Terms & <span className="text-gradient">Conditions</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-8 shadow-card mb-8"
          >
            <p className="text-muted-foreground leading-relaxed">
              Welcome to IO Builds Academy. These Terms and Conditions govern your use of our website and services. 
              By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by these terms.
            </p>
          </motion.div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-card"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <section.icon size={24} className="text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold pt-2">{section.title}</h2>
                </div>
                <div className="pl-16">
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Limitation of Liability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 shadow-card mt-8"
          >
            <h2 className="font-display text-xl font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              IO Builds Academy provides educational content and makes no guarantees regarding:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Employment outcomes or career advancement</li>
              <li>Specific skill proficiency levels</li>
              <li>Project success or commercial viability of learned skills</li>
              <li>Continuous availability of all course features</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Our liability is limited to the course fee paid. We are not responsible for indirect, incidental, 
              or consequential damages arising from the use of our services.
            </p>
          </motion.div>

          {/* Governing Law */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 shadow-card mt-8"
          >
            <h2 className="font-display text-xl font-bold mb-4">8. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of Sri Lanka. 
              Any disputes arising from these terms shall be resolved through arbitration or in the courts of Sri Lanka.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-8 mt-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Mail size={24} className="text-primary" />
              <h2 className="font-display text-xl font-bold">Questions?</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at{' '}
              <a href="mailto:info@iobuilds.com" className="text-primary hover:underline">
                info@iobuilds.com
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
