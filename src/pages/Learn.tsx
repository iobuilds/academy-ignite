import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, Play, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useCourse } from '@/hooks/useCourses';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoPlaceholder from '@/components/VideoPlaceholder';

interface LessonProgressRecord {
  id: string;
  user_id: string;
  course_id: string;
  week_number: number;
  lesson_title: string;
  is_completed: boolean;
  time_spent_minutes: number;
  completed_at: string | null;
  notes: string | null;
}

export default function Learn() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: course, isLoading: courseLoading } = useCourse(courseId || '');
  const [activeWeek, setActiveWeek] = useState(1);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch lesson progress
  const { data: lessonProgress } = useQuery({
    queryKey: ['lesson-progress', user?.id, courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('course_id', courseId!);
      if (error) throw error;
      return data as LessonProgressRecord[];
    },
    enabled: !!user && !!courseId,
  });

  // Mark lesson complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async ({ weekNumber, lessonTitle, isCompleted }: { weekNumber: number; lessonTitle: string; isCompleted: boolean }) => {
      const existingProgress = lessonProgress?.find((p) => p.week_number === weekNumber);

      if (existingProgress) {
        const { error } = await supabase
          .from('lesson_progress')
          .update({
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq('id', existingProgress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('lesson_progress').insert({
          user_id: user!.id,
          course_id: courseId!,
          week_number: weekNumber,
          lesson_title: lessonTitle,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', user?.id, courseId] });
      toast.success('Progress updated!');
    },
    onError: () => {
      toast.error('Failed to update progress');
    },
  });

  if (authLoading || courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !course) {
    return null;
  }

  const totalWeeks = course.curriculum.length;
  const completedWeeks = lessonProgress?.filter((p) => p.is_completed).length || 0;
  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100);

  const isWeekCompleted = (weekNumber: number) => {
    return lessonProgress?.some((p) => p.week_number === weekNumber && p.is_completed) || false;
  };

  const activeLesson = course.curriculum.find((c) => c.week === activeWeek);

  return (
    <div className="min-h-screen bg-background">
      <Header onRegisterClick={() => navigate('/auth')} />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">{course.title}</h1>
                <p className="text-muted-foreground">{course.duration} • {course.curriculum.length} lessons</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="font-display font-bold text-xl">{progressPercent}%</p>
                </div>
                <div className="w-32">
                  <Progress value={progressPercent} className="h-3" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Curriculum */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-2xl shadow-card p-4 sticky top-28">
                <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                  <BookOpen size={18} />
                  Curriculum
                </h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {course.curriculum.map((week) => (
                    <button
                      key={week.week}
                      onClick={() => setActiveWeek(week.week)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                        activeWeek === week.week
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isWeekCompleted(week.week)
                          ? 'bg-accent text-accent-foreground'
                          : activeWeek === week.week
                          ? 'bg-primary-foreground text-primary'
                          : 'bg-muted-foreground/20'
                      }`}>
                        {isWeekCompleted(week.week) ? <CheckCircle size={14} /> : week.week}
                      </div>
                      <span className="text-sm font-medium truncate">{week.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 space-y-6"
            >
              {/* Video Player Placeholder */}
              <VideoPlaceholder title={`Week ${activeWeek}: ${activeLesson?.title || ''}`} />

              {/* Lesson Content */}
              <div className="bg-card rounded-2xl shadow-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock size={14} />
                      Week {activeWeek} of {totalWeeks}
                    </div>
                    <h2 className="font-display text-2xl font-bold">{activeLesson?.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`complete-${activeWeek}`}
                      checked={isWeekCompleted(activeWeek)}
                      onCheckedChange={(checked) => {
                        markCompleteMutation.mutate({
                          weekNumber: activeWeek,
                          lessonTitle: activeLesson?.title || '',
                          isCompleted: !!checked,
                        });
                      }}
                    />
                    <label htmlFor={`complete-${activeWeek}`} className="text-sm font-medium cursor-pointer">
                      Mark as Complete
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Topics Covered:</h3>
                  <ul className="space-y-2">
                    {activeLesson?.topics.map((topic, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Play size={14} className="text-accent" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    disabled={activeWeek === 1}
                    onClick={() => setActiveWeek(activeWeek - 1)}
                  >
                    Previous Lesson
                  </Button>
                  {activeWeek < totalWeeks ? (
                    <Button
                      variant="hero"
                      onClick={() => setActiveWeek(activeWeek + 1)}
                    >
                      Next Lesson
                    </Button>
                  ) : (
                    <Button variant="hero" className="gap-2">
                      <Award size={18} />
                      Complete Course
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
