import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, ArrowRight, UserCheck, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>();

  const ageGroups = courses 
    ? [...new Set(courses.map(c => c.age_group))]
    : [];

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAge = !selectedAge || course.age_group === selectedAge;
    return matchesSearch && matchesAge;
  });

  const handleEnroll = (courseId: string) => {
    setSelectedCourse(courseId);
    setIsRegistrationOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onRegisterClick={() => setIsRegistrationOpen(true)} />
      
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
              Our <span className="text-gradient">Courses</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Comprehensive programs designed to build real-world skills through hands-on learning experiences in embedded systems, IoT, and product development.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={18} className="text-muted-foreground" />
              <Badge
                variant={selectedAge === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedAge(null)}
              >
                All Ages
              </Badge>
              {ageGroups.map((age) => (
                <Badge
                  key={age}
                  variant={selectedAge === age ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedAge(age)}
                >
                  {age}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
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
          ) : filteredCourses?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No courses found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedAge(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses?.map((course, index) => (
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

                    {course.verifiedCount > 0 && (
                      <div className="flex items-center gap-2 mb-4 text-sm bg-accent/10 text-accent rounded-lg px-3 py-2">
                        <UserCheck size={16} />
                        <span className="font-medium">{course.verifiedCount} students enrolled</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-display font-bold text-primary">${course.price}</span>
                        <span className="text-muted-foreground text-sm ml-1">USD</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {course.highlights.slice(0, 3).map((highlight, i) => (
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
                        onClick={() => handleEnroll(course.id)}
                      >
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        preselectedCourse={selectedCourse}
      />
    </div>
  );
}
