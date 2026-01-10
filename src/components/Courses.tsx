import { motion } from 'framer-motion';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import courseIot from '@/assets/course-iot.png';
import courseEmbedded from '@/assets/course-embedded.png';
import courseProduct from '@/assets/course-product.png';

interface CoursesProps {
  onRegisterClick: () => void;
}

const courses = [
  {
    id: 1,
    title: 'IoT and Robotics',
    description: 'A fun and interactive program designed for young innovators aged 4-10. Learn basics of robotics, sensors, and build exciting IoT projects.',
    image: courseIot,
    duration: '12 weeks',
    ageGroup: 'Ages 4-10',
    highlights: ['Hands-on robot building', 'Basic coding concepts', 'Sensor exploration'],
  },
  {
    id: 2,
    title: 'Embedded Systems Bootcamp',
    description: 'Master the fundamentals of embedded systems programming. From microcontrollers to real-world applications, build industry-ready skills.',
    image: courseEmbedded,
    duration: '16 weeks',
    ageGroup: 'All ages',
    highlights: ['Microcontroller programming', 'Hardware interfacing', 'Real-time systems'],
  },
  {
    id: 3,
    title: 'Product Development Bootcamp',
    description: 'Transform your ideas into market-ready products. Learn prototyping, manufacturing, and the complete product lifecycle.',
    image: courseProduct,
    duration: '14 weeks',
    ageGroup: 'All ages',
    highlights: ['Rapid prototyping', '3D printing & CAD', 'Market validation'],
  },
];

export default function Courses({ onRegisterClick }: CoursesProps) {
  return (
    <section id="courses" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Our <span className="text-gradient">Courses</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive programs designed to build real-world skills through hands-on learning experiences.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {course.ageGroup}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    Small groups
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {course.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {highlight}
                    </li>
                  ))}
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full group/btn"
                  onClick={onRegisterClick}
                >
                  Enroll Now
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
