import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Scene3D from './Scene3D';

interface HeroProps {
  onRegisterClick: () => void;
}

export default function Hero({ onRegisterClick }: HeroProps) {
  const { user } = useAuth();

  return (
    <section id="home" className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Enhanced 3D Background */}
      <Scene3D />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-2xl"
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/20 text-primary px-6 py-3 rounded-full mb-8 shadow-lg"
          >
            <Sparkles size={18} className="animate-pulse" />
            <span className="text-sm font-semibold">🚀 Now Enrolling for 2025 Batches</span>
            <Zap size={16} className="text-accent" />
          </motion.div>

          <motion.h1 
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.9]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="block">Build The</span>
            <span className="block text-gradient bg-clip-text">Future Today</span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Master IoT, Robotics, and Embedded Systems with{' '}
            <span className="text-primary font-semibold">hands-on projects</span> and{' '}
            <span className="text-accent font-semibold">expert mentorship</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight size={20} />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="hero" size="xl" onClick={onRegisterClick}>
                  Start Your Journey
                  <ArrowRight size={20} />
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>
            )}
          </motion.div>

          {/* Stats with glass effect */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-20 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {[
              { icon: <Award className="text-primary" size={24} />, number: '3+', label: 'Expert Courses' },
              { icon: <Users className="text-accent" size={24} />, number: '100+', label: 'Students Trained' },
              { icon: <Zap className="text-primary" size={24} />, number: '95%', label: 'Success Rate' },
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="font-display text-3xl md:text-4xl font-bold text-foreground">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-8 h-12 border-2 border-primary/40 rounded-full flex items-start justify-center p-2 bg-card/30 backdrop-blur-sm"
        >
          <motion.div 
            className="w-1.5 h-3 bg-primary rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
