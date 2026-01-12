import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, Award, MapPin, Mail, Phone, Heart, Zap, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import lecturerImage from '@/assets/lecturer.png';

const values = [
  {
    icon: Target,
    title: 'Hands-On Learning',
    description: 'Every concept is reinforced through practical projects and real-world applications that prepare you for industry challenges.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'We encourage creative thinking and problem-solving to foster true innovation in embedded systems and IoT.',
  },
  {
    icon: Users,
    title: 'Expert Mentorship',
    description: 'Learn from industry professionals with years of practical experience in product development.',
  },
  {
    icon: Award,
    title: 'Certified Programs',
    description: 'Earn recognized certifications that validate your skills and knowledge in the industry.',
  },
];

const milestones = [
  { year: '2020', title: 'Founded', description: 'IO Builds Academy was established with a vision to democratize tech education.' },
  { year: '2021', title: '100+ Students', description: 'Reached our first milestone of training over 100 students in embedded systems.' },
  { year: '2022', title: 'IoT Program Launch', description: 'Introduced comprehensive IoT and smart systems curriculum.' },
  { year: '2023', title: 'Industry Partnerships', description: 'Partnered with leading tech companies for internship opportunities.' },
  { year: '2024', title: 'Global Reach', description: 'Expanded to serve students from multiple countries across the globe.' },
];

export default function AboutUs() {
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
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-gradient">IO Builds Academy</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We're on a mission to empower the next generation of innovators with practical skills in embedded systems, IoT, and product development.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 shadow-card"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6">
                <Heart size={28} className="text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To bridge the gap between theoretical knowledge and practical skills by providing hands-on, industry-relevant education in embedded systems, IoT, and product development. We believe every student deserves access to quality tech education that prepares them for real-world challenges.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 shadow-card"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6">
                <Zap size={28} className="text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the leading academy for embedded systems education, producing innovators who shape the future of technology. We envision a world where every aspiring engineer has the tools and knowledge to turn their ideas into reality.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Meet Your <span className="text-gradient">Instructor</span>
            </h2>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-xl border-4 border-primary/20 flex-shrink-0"
            >
              <img 
                src={lecturerImage} 
                alt="Instructor" 
                className="w-full h-full object-cover object-top"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-2xl font-bold mb-2">Embedded Systems Engineer</h3>
              <p className="text-primary font-semibold text-lg mb-4">at IPbuilds LLC</p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                With over a decade of experience in embedded systems and product development, our lead instructor brings real-world expertise directly to the classroom. Having worked on projects ranging from consumer electronics to industrial IoT solutions, they understand what it takes to succeed in the industry.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Their teaching philosophy centers on learning by doing – every concept is accompanied by practical exercises that reinforce understanding and build confidence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-gradient">IO Builds?</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <value.icon size={24} className="text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Our <span className="text-gradient">Journey</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 mb-8"
              >
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="font-display font-bold text-xl text-primary">{milestone.year}</span>
                </div>
                <div className="relative">
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-accent" />
                  <div className="pl-6 border-l-2 border-accent/30">
                    <h3 className="font-display font-bold text-lg mb-1">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Get in <span className="text-gradient">Touch</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card p-6 rounded-xl shadow-card text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} className="text-primary" />
              </div>
              <h3 className="font-display font-bold mb-2">Location</h3>
              <p className="text-muted-foreground">Sri Lanka</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card p-6 rounded-xl shadow-card text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-primary" />
              </div>
              <h3 className="font-display font-bold mb-2">Email</h3>
              <p className="text-muted-foreground">info@iobuilds.com</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card p-6 rounded-xl shadow-card text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Globe size={24} className="text-primary" />
              </div>
              <h3 className="font-display font-bold mb-2">Online</h3>
              <p className="text-muted-foreground">Worldwide Access</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
