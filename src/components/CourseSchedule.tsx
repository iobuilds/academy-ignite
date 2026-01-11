import { motion } from 'framer-motion';
import { Calendar, Clock, Globe } from 'lucide-react';
import { Schedule } from '@/hooks/useCourses';
import { format } from 'date-fns';

interface CourseScheduleProps {
  schedule: Schedule;
  startDate: string | null;
  duration: string;
}

export default function CourseSchedule({ schedule, startDate, duration }: CourseScheduleProps) {
  const formattedStartDate = startDate ? format(new Date(startDate), 'MMMM d, yyyy') : 'TBD';

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
            <p className="font-medium">{schedule.days.join(' & ')}</p>
            <p className="text-sm text-muted-foreground">{schedule.time}</p>
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
