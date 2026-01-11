import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoPlaceholderProps {
  title: string;
}

export default function VideoPlaceholder({ title }: VideoPlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden group cursor-pointer"
    >
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-primary text-primary-foreground w-20 h-20 rounded-full flex items-center justify-center shadow-button group-hover:scale-110 transition-transform duration-300">
          <Play size={32} className="ml-1" />
        </div>
      </div>
      
      {/* Label */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-3">
          <p className="text-sm text-muted-foreground">Preview Lesson</p>
          <p className="font-display font-semibold">{title}</p>
        </div>
      </div>
      
      {/* Coming soon badge */}
      <div className="absolute top-4 right-4">
        <span className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
          Coming Soon
        </span>
      </div>
    </motion.div>
  );
}
