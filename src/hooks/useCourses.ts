import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { courseImages } from '@/lib/courseData';

export interface CurriculumItem {
  week: number;
  title: string;
  topics: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ScheduleItem {
  day: string;
  time: string;
  topic: string;
}

export interface Schedule {
  days: string[];
  time: string;
  timezone: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  age_group: string;
  highlights: string[];
  curriculum: CurriculumItem[];
  schedule: Schedule | ScheduleItem[];
  faq: FAQItem[];
  start_date: string | null;
  is_upcoming: boolean;
  registration_open: boolean;
  created_at: string;
  updated_at: string;
  cardImage: string;
  heroImage: string;
  card_image_url: string | null;
  hero_image_url: string | null;
  registeredCount: number;
  verifiedCount: number;
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');

      if (error) throw error;

      // Get registration counts per course
      const { data: registrations } = await supabase
        .from('registrations')
        .select('course, payment_verified');

      const counts: Record<string, { registered: number; verified: number }> = {};
      registrations?.forEach((reg) => {
        if (!counts[reg.course]) {
          counts[reg.course] = { registered: 0, verified: 0 };
        }
        counts[reg.course].registered++;
        if (reg.payment_verified) {
          counts[reg.course].verified++;
        }
      });

      return courses.map((course) => ({
        ...course,
        highlights: (course.highlights as string[]) || [],
        curriculum: (course.curriculum as unknown as CurriculumItem[]) || [],
        schedule: course.schedule as unknown as Schedule | ScheduleItem[],
        faq: (course.faq as unknown as FAQItem[]) || [],
        registration_open: course.registration_open ?? true,
        cardImage: course.card_image_url || courseImages[course.id]?.card || '',
        heroImage: course.hero_image_url || courseImages[course.id]?.hero || '',
        card_image_url: course.card_image_url,
        hero_image_url: course.hero_image_url,
        registeredCount: counts[course.id]?.registered || 0,
        verifiedCount: counts[course.id]?.verified || 0,
      })) as Course[];
    },
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      // Get registration counts for this course
      const { data: registrations } = await supabase
        .from('registrations')
        .select('payment_verified')
        .eq('course', courseId);

      let registeredCount = 0;
      let verifiedCount = 0;
      registrations?.forEach((reg) => {
        registeredCount++;
        if (reg.payment_verified) {
          verifiedCount++;
        }
      });

      return {
        ...course,
        highlights: (course.highlights as string[]) || [],
        curriculum: (course.curriculum as unknown as CurriculumItem[]) || [],
        schedule: course.schedule as unknown as Schedule | ScheduleItem[],
        faq: (course.faq as unknown as FAQItem[]) || [],
        registration_open: course.registration_open ?? true,
        cardImage: course.card_image_url || courseImages[course.id]?.card || '',
        heroImage: course.hero_image_url || courseImages[course.id]?.hero || '',
        card_image_url: course.card_image_url,
        hero_image_url: course.hero_image_url,
        registeredCount,
        verifiedCount,
      } as Course;
    },
    enabled: !!courseId,
  });
}

export function useUpcomingCourse() {
  return useQuery({
    queryKey: ['upcoming-course'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, start_date')
        .eq('is_upcoming', true)
        .order('start_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
