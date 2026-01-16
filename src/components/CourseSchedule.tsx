import { motion } from 'framer-motion';
import { Calendar, Clock, Globe } from 'lucide-react';
import { Schedule, ScheduleItem } from '@/hooks/useCourses';
import { format } from 'date-fns';

interface CourseScheduleProps {
  schedule: Schedule | ScheduleItem[] | null | undefined;
  startDate: string | null;
  duration: string;
}

export default function CourseSchedule({ schedule, startDate, duration }: CourseScheduleProps) {
  const formattedStartDate = startDate ? format(new Date(startDate), 'MMMM d, yyyy') : 'TBD';

  // Handle different schedule formats
  const getScheduleDisplay = () => {
    if (!schedule) return 'TBD';
    
    // Check if it's the old format (object with days array)
    if ('days' in schedule && Array.isArray(schedule.days)) {
      return schedule.days.join(' & ');
    }
    
    // New format (array of schedule items)
    if (Array.isArray(schedule) && schedule.length > 0) {
      return schedule.map(s => s.day).filter(Boolean).join(' & ') || 'TBD';
    }
    
    return 'TBD';
  };

  const getTimeDisplay = () => {
    if (!schedule) return '';
    
    if ('time' in schedule && typeof schedule.time === 'string') {
      return schedule.time;
    }
    
    if (Array.isArray(schedule) && schedule.length > 0) {
      return schedule[0]?.time || '';
    }
    
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl shadow-card p-6"
    >
      <h3 className="font-display text-xl font-bold mb-4">Schedule</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 p-2 rounded-lg">
            <Calendar className="text-accent" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{formattedStartDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-accent/10 p-2 rounded-lg">
            <Clock className="text-accent" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Class Schedule</p>
            <p className="font-medium">{getScheduleDisplay()}</p>
            {getTimeDisplay() && (
              <p className="text-sm text-muted-foreground">{getTimeDisplay()}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-accent/10 p-2 rounded-lg">
            <Globe className="text-accent" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{duration}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
