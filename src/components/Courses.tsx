import { motion } from 'framer-motion';
import { Clock, Users, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';

interface CoursesProps {
  onRegisterClick: () => void;
}

export default function Courses({ onRegisterClick }: CoursesProps) {
  const { data: courses, isLoading } = useCourses();

  if (isLoading) {
    return (
      <section id="courses" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Our <span className="text-gradient">Courses</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-card animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
          {courses?.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <Link to={`/courses/${course.id}`} className="block">
                <div className="relative overflow-hidden">
                  <img
                    src={course.cardImage}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {course.age_group}
                  </div>
                  {course.is_upcoming && (
                    <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      🔥 Upcoming
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-6">
                <Link to={`/courses/${course.id}`}>
                  <h3 className="font-display text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    {course.registeredCount} registered
                  </div>
                </div>

                {/* Verified students count */}
                {course.verifiedCount > 0 && (
                  <div className="flex items-center gap-2 mb-4 text-sm bg-accent/10 text-accent rounded-lg px-3 py-2">
                    <UserCheck size={16} />
                    <span className="font-medium">{course.verifiedCount} students enrolled</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-display font-bold text-primary">Rs. {course.price}.00</span>
                    <span className="text-muted-foreground text-sm ml-1">LKR</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {(course.highlights || []).slice(0, 3).map((highlight, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/courses/${course.id}`}>
                      View Details
                      <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </Button>
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      onRegisterClick();
                    }}
                  >
                    Enroll Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
