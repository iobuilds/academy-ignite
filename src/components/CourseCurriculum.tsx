import { motion } from 'framer-motion';
import { BookOpen, CheckCircle } from 'lucide-react';
import { CurriculumItem } from '@/hooks/useCourses';

interface CourseCurriculumProps {
  curriculum: CurriculumItem[] | null | undefined;
}

export default function CourseCurriculum({ curriculum }: CourseCurriculumProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl shadow-card p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2 rounded-lg">
          <BookOpen className="text-primary" size={24} />
        </div>
        <h2 className="font-display text-2xl font-bold">Course Curriculum</h2>
      </div>

      <div className="space-y-4">
        {(curriculum || []).map((week, index) => (
          <motion.div
            key={week.week}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {week.week}
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg mb-2">
                  {week.title}
                </h3>
                <ul className="space-y-1">
                  {(week.topics || []).map((topic, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle size={14} className="text-accent shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
