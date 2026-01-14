import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Shield,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Eye,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Image as ImageIcon,
  Clock,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  payment_verified: boolean;
  created_at: string;
  coupon_code: string | null;
  discount_amount: number | null;
  final_price: number | null;
  payment_slip_url: string | null;
  user_id: string | null;
}

interface UserWithRole {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  role: string;
}

interface CourseStats {
  id: string;
  title: string;
  registrations: number;
  verified: number;
  revenue: number;
  registration_open: boolean;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [slipDialogOpen, setSlipDialogOpen] = useState(false);

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
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch registrations
      const { data: regs } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      setRegistrations(regs || []);

      // Fetch courses with stats
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, price, registration_open');

      if (courses && regs) {
        const stats = courses.map(course => {
          const courseRegs = regs.filter(r => r.course === course.id);
          const verified = courseRegs.filter(r => r.payment_verified);
          const revenue = verified.reduce((sum, r) => sum + (r.final_price || course.price), 0);
          
          return {
            id: course.id,
            title: course.title,
            registrations: courseRegs.length,
            verified: verified.length,
            revenue,
            registration_open: course.registration_open ?? true,
          };
        });
        setCourseStats(stats);
      }

      // Fetch users with profiles and roles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, created_at');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Get emails from registrations
      const emailMap: Record<string, string> = {};
      regs?.forEach(r => {
        if (r.user_id) {
          emailMap[r.user_id] = r.email;
        }
      });

      if (profiles) {
        const usersWithRoles = profiles.map(p => ({
          id: p.id,
          email: emailMap[p.id] || '',
          display_name: p.display_name,
          created_at: p.created_at,
          role: roles?.find(r => r.user_id === p.id)?.role || 'user',
        }));
        setUsers(usersWithRoles);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (id: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ payment_verified: verified })
        .eq('id', id);

      if (error) throw error;

      // Also update enrollment status
      const reg = registrations.find(r => r.id === id);
      if (reg?.user_id) {
        await supabase
          .from('enrollments')
          .update({ status: verified ? 'enrolled' : 'pending' })
          .eq('registration_id', id);
      }

      setRegistrations(prev =>
        prev.map(r => r.id === id ? { ...r, payment_verified: verified } : r)
      );

      toast({
        title: verified ? "Payment Verified" : "Payment Unverified",
        description: `Registration has been ${verified ? 'verified' : 'unverified'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      setCourseStats(prev => prev.filter(c => c.id !== courseId));

      toast({
        title: "Course Deleted",
        description: "The course has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleRegistration = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ registration_open: !currentStatus })
        .eq('id', courseId);

      if (error) throw error;

      setCourseStats(prev =>
        prev.map(c => c.id === courseId ? { ...c, registration_open: !currentStatus } : c)
      );

      toast({
        title: "Registration Status Updated",
        description: `Registration is now ${!currentStatus ? 'open' : 'closed'} for this course.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await supabase.from('user_roles').delete().eq('user_id', userId);
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole as 'admin' | 'moderator' | 'user' });

      if (error) throw error;

      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );

      toast({
        title: "Role Updated",
        description: `User role has been changed to ${newRole}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const viewPaymentSlip = async (url: string) => {
    try {
      const { data } = await supabase.storage
        .from('payment_slips')
        .createSignedUrl(url, 300); // 5 minute expiry
      
      if (data?.signedUrl) {
        setSelectedSlip(data.signedUrl);
        setSlipDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment slip",
        variant: "destructive",
      });
    }
  };

  const filteredRegistrations = registrations.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRegistrations = registrations.filter(r => !r.payment_verified);
  const totalRevenue = courseStats.reduce((sum, c) => sum + c.revenue, 0);
  const totalRegistrations = registrations.length;
  const verifiedPayments = registrations.filter(r => r.payment_verified).length;

  if (loading || !isAdmin) {
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
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Shield size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">
                Admin <span className="text-gradient">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">Manage courses, users, and registrations</p>
            </div>
          </div>

          {/* Pending Alert */}
          {pendingRegistrations.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Clock size={20} className="text-yellow-500" />
              <span className="font-medium text-yellow-700 dark:text-yellow-300">
                {pendingRegistrations.length} registration(s) pending payment verification
              </span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <span className="text-muted-foreground">Total Users</span>
              </div>
              <p className="font-display text-3xl font-bold">{users.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BookOpen size={20} className="text-accent" />
                </div>
                <span className="text-muted-foreground">Registrations</span>
              </div>
              <p className="font-display text-3xl font-bold">{totalRegistrations}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-500" />
                </div>
                <span className="text-muted-foreground">Verified</span>
              </div>
              <p className="font-display text-3xl font-bold">{verifiedPayments}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <DollarSign size={20} className="text-yellow-500" />
                </div>
                <span className="text-muted-foreground">Revenue</span>
              </div>
              <p className="font-display text-3xl font-bold">${totalRevenue}</p>
            </motion.div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="registrations" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-4">
              <TabsTrigger value="registrations">
                Registrations
                {pendingRegistrations.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{pendingRegistrations.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="builder">
                <Plus size={14} className="mr-1" />
                New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registrations" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search registrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Slip</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id} className={!reg.payment_verified ? 'bg-yellow-500/5' : ''}>
                        <TableCell className="font-medium">{reg.name}</TableCell>
                        <TableCell>{reg.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{reg.course}</Badge>
                        </TableCell>
                        <TableCell>
                          {reg.payment_slip_url ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewPaymentSlip(reg.payment_slip_url!)}
                            >
                              <ImageIcon size={16} className="mr-1" />
                              View
                            </Button>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          ${reg.final_price || '-'}
                          {reg.discount_amount && reg.discount_amount > 0 && (
                            <span className="text-xs text-green-500 ml-1">
                              (-${reg.discount_amount})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={reg.payment_verified ? "default" : "destructive"}>
                            {reg.payment_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleVerifyPayment(reg.id, true)}
                              >
                                <CheckCircle size={16} className="mr-2 text-green-500" />
                                Verify Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleVerifyPayment(reg.id, false)}
                              >
                                <XCircle size={16} className="mr-2 text-destructive" />
                                Unverify Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-lg">Manage Courses</h3>
                <Button onClick={() => navigate('/admin/courses/new')} className="gap-2">
                  <Plus size={16} />
                  Create Course
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseStats.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card rounded-xl p-6 shadow-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-lg">{course.title}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                        >
                          <Pencil size={16} className="text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleRegistration(course.id, course.registration_open)}
                        >
                          {course.registration_open ? (
                            <ToggleRight size={20} className="text-green-500" />
                          ) : (
                            <ToggleLeft size={20} className="text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Badge variant={course.registration_open ? "default" : "secondary"} className="mb-4">
                      {course.registration_open ? 'Registration Open' : 'Registration Closed'}
                    </Badge>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registrations</span>
                        <span className="font-bold">{course.registrations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verified</span>
                        <span className="font-bold text-green-500">{course.verified}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-bold text-primary">${course.revenue}</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-accent" />
                            <span className="text-sm">
                              {course.registrations > 0 
                                ? Math.round((course.verified / course.registrations) * 100) 
                                : 0}% conversion
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="builder" className="space-y-4">
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={40} className="text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-4">Course Builder</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Create comprehensive courses with curriculum, schedules, FAQs, and more.
                </p>
                <Button size="lg" onClick={() => navigate('/admin/courses/new')} className="gap-2">
                  <Plus size={20} />
                  Create New Course
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="bg-card rounded-xl shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.display_name || 'No name'}
                        </TableCell>
                        <TableCell>{u.email || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === 'admin' ? 'default' : u.role === 'moderator' ? 'secondary' : 'outline'}
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(u.id, 'admin')}
                              >
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(u.id, 'moderator')}
                              >
                                Make Moderator
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(u.id, 'user')}
                              >
                                Make User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Demo Credentials */}
              <div className="bg-muted/50 rounded-xl p-6 mt-6">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <UserPlus size={20} className="text-primary" />
                  Demo Credentials
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card rounded-lg p-4">
                    <Badge variant="default" className="mb-2">Admin</Badge>
                    <p className="text-sm"><strong>Email:</strong> admin@iobuilds.com</p>
                    <p className="text-sm"><strong>Password:</strong> Admin123!</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      To create an admin, sign up with any email then change the role here.
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-4">
                    <Badge variant="outline" className="mb-2">User</Badge>
                    <p className="text-sm"><strong>Email:</strong> user@iobuilds.com</p>
                    <p className="text-sm"><strong>Password:</strong> User123!</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Regular users can register for courses and view their enrolled courses.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />

      {/* Payment Slip Dialog */}
      <Dialog open={slipDialogOpen} onOpenChange={setSlipDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Slip</DialogTitle>
          </DialogHeader>
          {selectedSlip && (
            <div className="flex justify-center">
              <img 
                src={selectedSlip} 
                alt="Payment slip" 
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
