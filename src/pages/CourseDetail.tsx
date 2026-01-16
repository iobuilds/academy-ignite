import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/hooks/useCourses';
import CourseCurriculum from '@/components/CourseCurriculum';
import CourseSchedule from '@/components/CourseSchedule';
import CourseFAQ from '@/components/CourseFAQ';
import VideoPlaceholder from '@/components/VideoPlaceholder';
import RegistrationModal from '@/components/RegistrationModal';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading, error } = useCourse(courseId || '');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const handleRegisterClick = () => {
    setIsRegistrationOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-2xl font-bold">Course not found</h1>
        <Link to="/" className="text-primary hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header onRegisterClick={handleRegisterClick} />

      {/* Hero Section */}
      <section className="pt-24 md:pt-28">
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img
            src={course.heroImage}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <Link
                to="/#courses"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Courses
              </Link>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-3xl md:text-5xl font-bold mb-2"
              >
                {course.title}
              </motion.h1>
              <p className="text-muted-foreground max-w-2xl">
                {course.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Info */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Info Cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-xl p-4 shadow-card"
                >
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock size={16} />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="font-display font-bold text-lg">{course.duration}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-xl p-4 shadow-card"
                >
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users size={16} />
                    <span className="text-sm">Registered</span>
                  </div>
                  <p className="font-display font-bold text-lg">{course.registeredCount} students</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-xl p-4 shadow-card"
                >
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <UserCheck size={16} />
                    <span className="text-sm">Enrolled</span>
                  </div>
                  <p className="font-display font-bold text-lg">{course.verifiedCount} students</p>
                </motion.div>
              </div>

              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl shadow-card p-6"
              >
                <h3 className="font-display text-xl font-bold mb-4">What You'll Learn</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {(course.highlights || []).map((highlight, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="text-accent shrink-0" size={18} />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Sample Video */}
              <VideoPlaceholder 
                title={`Introduction to ${course.title}`} 
                videoUrl={course.preview_video_url}
              />

              {/* Curriculum */}
              {course.curriculum && course.curriculum.length > 0 && (
                <CourseCurriculum curriculum={course.curriculum} />
              )}

              {/* FAQ */}
              {course.faq && course.faq.length > 0 && (
                <CourseFAQ faq={course.faq} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl shadow-card p-6 sticky top-28"
              >
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Course Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold text-primary">
                      ${course.price}
                    </span>
                    <span className="text-muted-foreground">USD</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-accent" size={16} />
                    <span>Full curriculum access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-accent" size={16} />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-accent" size={16} />
                    <span>Lifetime access to materials</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-accent" size={16} />
                    <span>Project kit included</span>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleRegisterClick}
                >
                  Register for This Course
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  {course.age_group} • {course.registeredCount} already registered
                </p>
              </motion.div>

              {/* Schedule Card */}
              <CourseSchedule
                schedule={course.schedule}
                startDate={course.start_date}
                duration={course.duration}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        preselectedCourse={course.id}
      />
    </div>
  );
}
