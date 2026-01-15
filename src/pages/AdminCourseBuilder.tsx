import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  BookOpen, 
  Users, 
  Calendar, 
  DollarSign,
  Clock,
  FileText,
  HelpCircle,
  GripVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Json } from '@/integrations/supabase/types';

interface CurriculumWeek {
  week: number;
  title: string;
  topics: string[];
}

interface ScheduleItem {
  day: string;
  time: string;
  topic: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface CourseForm {
  id: string;
  title: string;
  description: string;
  duration: string;
  age_group: string;
  price: number;
  start_date: string;
  is_upcoming: boolean;
  registration_open: boolean;
  highlights: string[];
  curriculum: CurriculumWeek[];
  schedule: ScheduleItem[];
  faq: FAQItem[];
}

const defaultCourse: CourseForm = {
  id: '',
  title: '',
  description: '',
  duration: '8 Weeks',
  age_group: '16+ years',
  price: 0,
  start_date: '',
  is_upcoming: false,
  registration_open: true,
  highlights: [''],
  curriculum: [{ week: 1, title: '', topics: [''] }],
  schedule: [{ day: '', time: '', topic: '' }],
  faq: [{ question: '', answer: '' }],
};

export default function AdminCourseBuilder() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!courseId;
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<CourseForm>(defaultCourse);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [loading, isAdmin, navigate, toast]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) throw error;

        if (data) {
          setCourse({
            id: data.id,
            title: data.title,
            description: data.description,
            duration: data.duration,
            age_group: data.age_group,
            price: data.price,
            start_date: data.start_date || '',
            is_upcoming: data.is_upcoming || false,
            registration_open: data.registration_open,
            highlights: (data.highlights as string[]) || [''],
            curriculum: (data.curriculum as unknown as CurriculumWeek[]) || [{ week: 1, title: '', topics: [''] }],
            schedule: (data.schedule as unknown as ScheduleItem[]) || [{ day: '', time: '', topic: '' }],
            faq: (data.faq as unknown as FAQItem[]) || [{ question: '', answer: '' }],
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditing && isAdmin) {
      fetchCourse();
    }
  }, [isEditing, isAdmin, courseId, toast]);

  const handleSave = async () => {
    if (!course.id || !course.title) {
      toast({
        title: "Validation Error",
        description: "Course ID and Title are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const courseData = {
        id: course.id,
        title: course.title,
        description: course.description,
        duration: course.duration,
        age_group: course.age_group,
        price: course.price,
        start_date: course.start_date || null,
        is_upcoming: course.is_upcoming,
        registration_open: course.registration_open,
        highlights: course.highlights.filter(h => h.trim() !== ''),
        curriculum: course.curriculum.map(w => ({
          ...w,
          topics: w.topics.filter(t => t.trim() !== '')
        })) as unknown as Json,
        schedule: course.schedule.filter(s => s.day || s.time || s.topic) as unknown as Json,
        faq: course.faq.filter(f => f.question || f.answer) as unknown as Json,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', courseId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(courseData);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Course ${isEditing ? 'updated' : 'created'} successfully!`,
      });

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof CourseForm, value: any) => {
    setCourse(prev => ({ ...prev, [field]: value }));
  };

  // Highlights
  const addHighlight = () => {
    setCourse(prev => ({ ...prev, highlights: [...prev.highlights, ''] }));
  };

  const updateHighlight = (index: number, value: string) => {
    setCourse(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const removeHighlight = (index: number) => {
    setCourse(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  // Curriculum
  const addWeek = () => {
    setCourse(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, { week: prev.curriculum.length + 1, title: '', topics: [''] }]
    }));
  };

  const updateWeekTitle = (weekIndex: number, value: string) => {
    setCourse(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((w, i) => i === weekIndex ? { ...w, title: value } : w)
    }));
  };

  const addTopic = (weekIndex: number) => {
    setCourse(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((w, i) => 
        i === weekIndex ? { ...w, topics: [...w.topics, ''] } : w
      )
    }));
  };

  const updateTopic = (weekIndex: number, topicIndex: number, value: string) => {
    setCourse(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((w, i) => 
        i === weekIndex ? { 
          ...w, 
          topics: w.topics.map((t, ti) => ti === topicIndex ? value : t) 
        } : w
      )
    }));
  };

  const removeTopic = (weekIndex: number, topicIndex: number) => {
    setCourse(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((w, i) => 
        i === weekIndex ? { ...w, topics: w.topics.filter((_, ti) => ti !== topicIndex) } : w
      )
    }));
  };

  const removeWeek = (weekIndex: number) => {
    setCourse(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== weekIndex).map((w, i) => ({ ...w, week: i + 1 }))
    }));
  };

  // Schedule
  const addScheduleItem = () => {
    setCourse(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: '', time: '', topic: '' }]
    }));
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    setCourse(prev => ({
      ...prev,
      schedule: prev.schedule.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const removeScheduleItem = (index: number) => {
    setCourse(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  // FAQ
  const addFAQ = () => {
    setCourse(prev => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }]
    }));
  };

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    setCourse(prev => ({
      ...prev,
      faq: prev.faq.map((f, i) => i === index ? { ...f, [field]: value } : f)
    }));
  };

  const removeFAQ = (index: number) => {
    setCourse(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onRegisterClick={() => {}} />
      
      <main className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin')}>
                <ArrowLeft size={16} className="mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  {isEditing ? 'Edit' : 'Create'} <span className="text-gradient">Course</span>
                </h1>
                <p className="text-muted-foreground">
                  {isEditing ? 'Update course details' : 'Add a new course to the academy'}
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Course'}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen size={20} className="text-primary" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>Core course details and identification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="id">Course ID (slug)</Label>
                      <Input
                        id="id"
                        placeholder="e.g., iot-robotics"
                        value={course.id}
                        onChange={(e) => updateField('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        disabled={isEditing}
                      />
                      <p className="text-xs text-muted-foreground">Used in URLs. Cannot be changed after creation.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0"
                        value={course.price}
                        onChange={(e) => updateField('price', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter course title"
                      value={course.title}
                      onChange={(e) => updateField('title', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the course..."
                      value={course.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 8 Weeks"
                        value={course.duration}
                        onChange={(e) => updateField('duration', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age_group">Age Group</Label>
                      <Input
                        id="age_group"
                        placeholder="e.g., 16+ years"
                        value={course.age_group}
                        onChange={(e) => updateField('age_group', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    Course Highlights
                  </CardTitle>
                  <CardDescription>Key features and learning outcomes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Highlight ${index + 1}`}
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHighlight(index)}
                        disabled={course.highlights.length <= 1}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addHighlight} className="w-full">
                    <Plus size={16} className="mr-2" />
                    Add Highlight
                  </Button>
                </CardContent>
              </Card>

              {/* Curriculum */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen size={20} className="text-primary" />
                    Curriculum
                  </CardTitle>
                  <CardDescription>Week-by-week course structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {course.curriculum.map((week, weekIndex) => (
                      <AccordionItem key={weekIndex} value={`week-${weekIndex}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">Week {week.week}</Badge>
                            <span className="font-medium">{week.title || 'Untitled Week'}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Week title"
                              value={week.title}
                              onChange={(e) => updateWeekTitle(weekIndex, e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeWeek(weekIndex)}
                              disabled={course.curriculum.length <= 1}
                            >
                              <Trash2 size={16} className="text-destructive" />
                            </Button>
                          </div>
                          <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                            <Label className="text-sm text-muted-foreground">Topics</Label>
                            {week.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex gap-2">
                                <Input
                                  placeholder={`Topic ${topicIndex + 1}`}
                                  value={topic}
                                  onChange={(e) => updateTopic(weekIndex, topicIndex, e.target.value)}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeTopic(weekIndex, topicIndex)}
                                  disabled={week.topics.length <= 1}
                                >
                                  <Trash2 size={14} className="text-muted-foreground" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addTopic(weekIndex)}
                              className="text-xs"
                            >
                              <Plus size={14} className="mr-1" />
                              Add Topic
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <Button variant="outline" onClick={addWeek} className="w-full mt-4">
                    <Plus size={16} className="mr-2" />
                    Add Week
                  </Button>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={20} className="text-primary" />
                    Schedule
                  </CardTitle>
                  <CardDescription>Weekly class schedule</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.schedule.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Day (e.g., Monday)"
                        value={item.day}
                        onChange={(e) => updateScheduleItem(index, 'day', e.target.value)}
                        className="w-32"
                      />
                      <Input
                        placeholder="Time (e.g., 10:00 AM)"
                        value={item.time}
                        onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                        className="w-32"
                      />
                      <Input
                        placeholder="Topic/Session"
                        value={item.topic}
                        onChange={(e) => updateScheduleItem(index, 'topic', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeScheduleItem(index)}
                        disabled={course.schedule.length <= 1}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addScheduleItem} className="w-full">
                    <Plus size={16} className="mr-2" />
                    Add Schedule Item
                  </Button>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle size={20} className="text-primary" />
                    FAQ
                  </CardTitle>
                  <CardDescription>Frequently asked questions about this course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.faq.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Question"
                          value={item.question}
                          onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFAQ(index)}
                          disabled={course.faq.length <= 1}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Answer"
                        value={item.answer}
                        onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))}
                  <Button variant="outline" onClick={addFAQ} className="w-full">
                    <Plus size={16} className="mr-2" />
                    Add FAQ
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Registration Open</Label>
                      <p className="text-xs text-muted-foreground">Allow new enrollments</p>
                    </div>
                    <Switch
                      checked={course.registration_open}
                      onCheckedChange={(checked) => updateField('registration_open', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Upcoming Course</Label>
                      <p className="text-xs text-muted-foreground">Show in announcements</p>
                    </div>
                    <Switch
                      checked={course.is_upcoming}
                      onCheckedChange={(checked) => updateField('is_upcoming', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={course.start_date}
                      onChange={(e) => updateField('start_date', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>How it will appear to students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                    <h3 className="font-display font-bold text-lg">{course.title || 'Course Title'}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description || 'Course description will appear here...'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">
                        <Clock size={12} className="mr-1" />
                        {course.duration || 'Duration'}
                      </Badge>
                      <Badge variant="outline">
                        <Users size={12} className="mr-1" />
                        {course.age_group || 'Age Group'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-display font-bold text-xl text-primary">
                        ${course.price}
                      </span>
                      <Badge variant={course.registration_open ? 'default' : 'secondary'}>
                        {course.registration_open ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card (for editing) */}
              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm">
                        View detailed stats in the Admin Dashboard
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/admin')}>
                        Go to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
