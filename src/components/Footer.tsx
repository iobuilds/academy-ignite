import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img src={logo} alt="IO Builds" className="h-12 mb-4 brightness-0 invert" />
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Transforming ideas into reality through cutting-edge tech education and hands-on learning experiences.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-display font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#home" className="hover:text-primary-foreground transition-colors">Home</a></li>
              <li><a href="#courses" className="hover:text-primary-foreground transition-colors">Courses</a></li>
              <li><a href="#about" className="hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-primary-foreground transition-colors">Contact</a></li>
            </ul>
          </motion.div>

          {/* Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-display font-bold mb-4">Our Courses</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>IoT and Robotics</li>
              <li>Embedded Systems Bootcamp</li>
              <li>Product Development Bootcamp</li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-display font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                info@iobuilds.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5" />
                <span>123 Innovation Way<br />Tech City, TC 12345</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/60">
          © {currentYear} IO Builds Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
