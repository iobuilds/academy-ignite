import { motion } from 'framer-motion';
import { Clock, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUpcomingCourse } from '@/hooks/useCourses';
import { format, differenceInDays } from 'date-fns';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const { data: upcomingCourse, isLoading } = useUpcomingCourse();

  if (!isVisible || isLoading || !upcomingCourse?.start_date) {
    return null;
  }

  const startDate = new Date(upcomingCourse.start_date);
  const daysLeft = differenceInDays(startDate, new Date());
  const formattedDate = format(startDate, 'MMM d, yyyy');

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="bg-gradient-primary text-primary-foreground py-2 px-4 relative"
    >
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm md:text-base">
        <Clock size={16} className="animate-pulse" />
        <span className="font-medium">
          🔥 Hurry Up! <span className="font-bold">{upcomingCourse.title}</span> starts {formattedDate}
        </span>
        {daysLeft > 0 && (
          <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-full text-xs font-bold">
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left!
          </span>
        )}
        <Link
          to={`/courses/${upcomingCourse.id}`}
          className="ml-2 flex items-center gap-1 underline hover:no-underline font-medium"
        >
          Enroll Now <ArrowRight size={14} />
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-primary-foreground/20 p-1 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}
