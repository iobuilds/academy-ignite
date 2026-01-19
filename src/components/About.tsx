import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, Award } from 'lucide-react';
import lecturerImage from '@/assets/lecturer.png';

const values = [
  {
    icon: Target,
    title: 'Hands-On Learning',
    description: 'Every concept is reinforced through practical projects and real-world applications.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'We encourage creative thinking and problem-solving to foster true innovation.',
  },
  {
    icon: Users,
    title: 'Expert Mentorship',
    description: 'Learn from industry professionals with years of practical experience.',
  },
  {
    icon: Award,
    title: 'Certified Programs',
    description: 'Earn recognized certifications that validate your skills and knowledge.',
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Instructor Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-8">
            Meet Your <span className="text-gradient">Instructor</span>
          </h2>
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-xl mb-6 border-4 border-primary/20">
              <img 
                src={lecturerImage} 
                alt="Instructor" 
                className="w-full h-full object-cover object-top"
              />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">Embedded Systems Engineer | Lecturer</h3>
            <p className="text-primary font-semibold text-lg">at IO Builds LLC</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-gradient">IO Builds?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              At IO Builds Academy, we believe in transforming ideas into reality. Our programs are designed to bridge the gap between theoretical knowledge and practical skills, preparing students for the technology-driven future.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With state-of-the-art facilities, industry-relevant curriculum, and personalized attention, we ensure every student reaches their full potential in their chosen field.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <value.icon size={24} className="text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
