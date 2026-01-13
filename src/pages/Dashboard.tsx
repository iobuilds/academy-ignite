import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, Play, ArrowRight, LogOut, User, GraduationCap, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCourses, Course } from '@/hooks/useCourses';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';

interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  registration_id: string | null;
}

interface Registration {
  id: string;
  payment_verified: boolean;
  course: string;
}

interface LessonProgress {
  course_id: string;
  week_number: number;
  is_completed: boolean;
  time_spent_minutes: number;
}

export default function Dashboard() {
  const { user, isLoading: authLoading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: courses } = useCourses();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch user enrollments
  const { data: enrollments } = useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data as Enrollment[];
    },
    enabled: !!user,
  });

  // Fetch user registrations to check payment status
  const { data: registrations } = useQuery({
    queryKey: ['user-registrations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, payment_verified, course')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data as Registration[];
    },
    enabled: !!user,
  });

  // Fetch lesson progress
  const { data: lessonProgress } = useQuery({
    queryKey: ['lesson-progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!user,
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  // Get verified enrollments only (payment_verified = true)
  const verifiedCourseIds = registrations
    ?.filter(r => r.payment_verified)
    .map(r => r.course) || [];
  
  const pendingCourseIds = registrations
    ?.filter(r => !r.payment_verified)
    .map(r => r.course) || [];

  const enrolledCourses = courses?.filter((c) => verifiedCourseIds.includes(c.id)) || [];
  const pendingCourses = courses?.filter((c) => pendingCourseIds.includes(c.id)) || [];
  const availableCourses = courses?.filter((c) => 
    !verifiedCourseIds.includes(c.id) && 
    !pendingCourseIds.includes(c.id) &&
    c.registration_open
  ) || [];

  const getProgressForCourse = (courseId: string, totalWeeks: number) => {
    const courseProgress = lessonProgress?.filter((p) => p.course_id === courseId) || [];
    const completedWeeks = courseProgress.filter((p) => p.is_completed).length;
    return Math.round((completedWeeks / totalWeeks) * 100);
  };

  const getTotalTimeSpent = () => {
    return lessonProgress?.reduce((acc, p) => acc + (p.time_spent_minutes || 0), 0) || 0;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header onRegisterClick={() => navigate('/auth')} />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <User className="text-primary" size={32} />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">
                    Welcome back, {profile?.display_name || user.email?.split('@')[0]}!
                  </h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <Button variant="outline" asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/profile">
                    <Settings size={18} className="mr-2" />
                    Settings
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="text-primary" size={24} />
                <span className="text-muted-foreground">Enrolled Courses</span>
              </div>
              <p className="font-display text-3xl font-bold">{enrolledCourses.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-accent" size={24} />
                <span className="text-muted-foreground">Lessons Completed</span>
              </div>
              <p className="font-display text-3xl font-bold">
                {lessonProgress?.filter((p) => p.is_completed).length || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-primary" size={24} />
                <span className="text-muted-foreground">Time Spent</span>
              </div>
              <p className="font-display text-3xl font-bold">
                {Math.round(getTotalTimeSpent() / 60)}h {getTotalTimeSpent() % 60}m
              </p>
            </motion.div>
          </div>

          {/* Pending Courses */}
          {pendingCourses.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-12"
            >
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertCircle className="text-yellow-500" size={24} />
                Pending Verification
              </h2>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your payment is being verified. You'll have access to these courses once an admin approves your payment.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-card opacity-75"
                  >
                    <div className="relative">
                      <img
                        src={course.cardImage}
                        alt={course.title}
                        className="w-full h-40 object-cover grayscale"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
                          ⏳ Pending
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-bold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Awaiting payment verification...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Enrolled Courses */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="text-primary" size={24} />
              My Courses
            </h2>

            {enrolledCourses.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 text-center shadow-card">
                <GraduationCap className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="font-display text-xl font-bold mb-2">No verified courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  {pendingCourses.length > 0 
                    ? 'Your registrations are pending payment verification.'
                    : 'Start your learning journey by enrolling in a course'}
                </p>
                {pendingCourses.length === 0 && (
                  <Button variant="hero" asChild>
                    <Link to="/courses">Browse Courses</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => {
                  const enrollment = enrollments?.find((e) => e.course_id === course.id);
                  const progress = getProgressForCourse(course.id, course.curriculum.length);

                  return (
                    <div
                      key={course.id}
                      className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={course.cardImage}
                          alt={course.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge variant="default" className="bg-green-500">
                            ✓ Verified
                          </Badge>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-bold text-lg mb-2">{course.title}</h3>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to={`/learn/${course.id}`}>
                            <Play size={16} className="mr-2" />
                            Continue Learning
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Available Courses */}
          {availableCourses.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="font-display text-2xl font-bold mb-6">
                Explore More Courses
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <img
                      src={course.cardImage}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-5">
                      <h3 className="font-display font-bold text-lg mb-2">{course.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-display font-bold text-xl text-primary">
                          ${course.price}
                        </span>
                        <span className="text-sm text-muted-foreground">{course.duration}</span>
                      </div>
                      <Button variant="hero" className="w-full" asChild>
                        <Link to={`/courses/${course.id}`}>
                          Enroll Now
                          <ArrowRight size={16} className="ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
