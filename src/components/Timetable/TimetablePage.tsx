import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useSchoolStore } from '@/store/schoolStore';
import { useAuthStore } from '@/store/authStore';
import { Timetable, DayOfWeek } from '@/types/schoolStoreType';
import { BACKEND_URL } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CreateTimetableForm } from './CreateTimetableForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Calendar,
  Plus,
  RefreshCw,
  Clock,
  BookOpen,
  Users,
  Edit2,
  Trash2
} from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export const TimetablePage: React.FC = () => {
  const { toast } = useToast();
  const {
    timetables, setTimetables,
    sections, setSections,
    subjects, setSubjects,
    teachers, setTeachers,
    grades, setGrades
  } = useSchoolStore();
  const { role } = useAuthStore();

  const isAdmin = role === 'admin';

  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState<Timetable | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all timetables
  const fetchTimetables = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/timetables/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const data = response.data?.timetables || response.data || [];
      setTimetables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching timetables:', error);
      toast({
        title: 'Error',
        description: 'Failed to load timetables',
        variant: 'destructive'
      });
      setTimetables([]);
    }
  };

  // Fetch sections
  const fetchSections = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/sections/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const data = response.data?.sections || response.data || [];
      const sectionsData = Array.isArray(data)
        ? data.map((item: { id: string; section?: Record<string, unknown> }) => ({
            id: item.id,
            ...(item.section || item)
          }))
        : [];
      setSections(sectionsData);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/teachers/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const data = response.data?.teachers || response.data || [];
      const teachersData = Array.isArray(data)
        ? data.map((item: { id: string; teacher?: Record<string, unknown> }) => ({
            id: item.id,
            ...(item.teacher || item)
          }))
        : [];
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/subjects/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const data = response.data?.subjects || response.data || [];
      const subjectsData = Array.isArray(data)
        ? data.map((item: { id: string; subject?: Record<string, unknown> }) => ({
            id: item.id,
            ...(item.subject || item)
          }))
        : [];
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch grades
  const fetchGrades = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/grades/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const data = response.data?.grades || response.data || [];
      const gradesData = Array.isArray(data)
        ? data.map((item: { id: string; grade?: Record<string, unknown> }) => ({
            id: item.id,
            ...(item.grade || item)
          }))
        : [];
      setGrades(gradesData);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  // Fetch all data on mount
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTimetables(),
        fetchSections(),
        fetchTeachers(),
        fetchSubjects(),
        fetchGrades()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter sections by selected grade
  const filteredSections = useMemo(() => {
    if (selectedGrade === 'all') return sections;
    return sections.filter(s => s.grade_id === selectedGrade);
  }, [sections, selectedGrade]);

  // Filter timetables by selected section
  const filteredTimetables = useMemo(() => {
    if (selectedSection === 'all') return timetables;
    return timetables.filter(t => t.section_id === selectedSection);
  }, [timetables, selectedSection]);
    

  // Get helper functions
  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return 'Unknown Section';
    const grade = grades.find(g => g.id === section.grade_id);
    return `${grade?.grade_name || ''} - ${section.section_name}`;
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.subject_name || 'Unknown Subject';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
  };

  // Get timetable entry for a specific day and period
  const getTimetableEntry = (day: DayOfWeek, period: number): Timetable | undefined => {
    return filteredTimetables.find(t => t.day_of_week === day && t.period === period);
  };

  const handleEdit = (timetable: Timetable) => {
    setEditingTimetable(timetable);
    setCreateModalOpen(true);
  };

  const handleDeleteClick = (timetable: Timetable) => {
    setTimetableToDelete(timetable);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!timetableToDelete) return;

    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete timetable entries',
        variant: 'destructive'
      });
      setDeleteDialogOpen(false);
      return;
    }

    setDeleting(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to perform this action',
          variant: 'destructive'
        });
        return;
      }

      await axios.delete(
        `${BACKEND_URL}/timetables/delete/${timetableToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast({
        title: 'Success',
        description: 'Timetable entry deleted successfully'
      });

      fetchTimetables();
    } catch (error: unknown) {
      console.error('Error deleting timetable:', error);
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };

      if (axiosError.response?.status === 401) {
        toast({
          title: 'Authentication Failed',
          description: 'Please log in again to continue',
          variant: 'destructive'
        });
      } else if (axiosError.response?.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to delete timetable entries',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: axiosError.response?.data?.message || 'Failed to delete timetable entry',
          variant: 'destructive'
        });
      }
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setTimetableToDelete(null);
    }
  };

  const handleCreateSuccess = () => {
    setEditingTimetable(null);
    fetchTimetables();
  };

  const handleCreateModalClose = (open: boolean) => {
    setCreateModalOpen(open);
    if (!open) {
      setEditingTimetable(null);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = filteredTimetables.length;
    const uniqueSubjects = new Set(filteredTimetables.map(t => t.subject_id)).size;
    const uniqueTeachers = new Set(filteredTimetables.map(t => t.teacher_id)).size;
    return { total, uniqueSubjects, uniqueTeachers };
  }, [filteredTimetables]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Timetable Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage class timetables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAllData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {isAdmin && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Periods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.uniqueSubjects}</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.uniqueTeachers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={selectedGrade}
                onValueChange={(v) => {
                  setSelectedGrade(v);
                  setSelectedSection('all');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade?.id} value={grade?.id}>
                      {grade?.grade_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {filteredSections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : selectedSection === 'all' ? (
        <Card className="shadow-soft">
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Select Grade & Section
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please select a grade and section to view the timetable.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-soft overflow-hidden">
          {/* Section Header */}
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>
                Timetable for{' '}
                <span className="text-primary">{getSectionName(selectedSection)}</span>
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredTimetables.length} period{filteredTimetables.length !== 1 ? 's' : ''} scheduled
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-semibold text-sm">Period</th>
                    {DAYS_OF_WEEK.map((day) => (
                      <th key={day} className="border p-3 text-center font-semibold text-sm min-w-[140px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((period) => (
                    <tr key={period} className="hover:bg-muted/30">
                      <td className="border p-3 font-medium text-center bg-muted/20">
                        {period}
                      </td>
                      {DAYS_OF_WEEK.map((day) => {
                        const entry = getTimetableEntry(day, period);
                        return (
                          <td key={`${day}-${period}`} className="border p-2">
                            {entry ? (
                              <div className="bg-primary/10 rounded-lg p-2 min-h-[80px] relative group">
                                <div className="font-medium text-sm text-primary">
                                  {getSubjectName(entry.subject_id)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {getTeacherName(entry.teacher_id)}
                                </div>
                                {isAdmin && (
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleEdit(entry)}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive"
                                      onClick={() => handleDeleteClick(entry)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="min-h-[80px] flex items-center justify-center text-muted-foreground text-xs">
                                {isAdmin ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => {
                                      setEditingTimetable({
                                        id: '',
                                        day_of_week: day,
                                        period: period,
                                        section_id: selectedSection,
                                        subject_id: '',
                                        teacher_id: '',
                                        created_at: '',
                                        updated_at: ''
                                      });
                                      setCreateModalOpen(true);
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                ) : (
                                  '-'
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <CreateTimetableForm
        open={createModalOpen}
        onOpenChange={handleCreateModalClose}
        timetable={editingTimetable}
        onSuccess={handleCreateSuccess}
        preSelectedSection={selectedSection !== 'all' ? selectedSection : undefined}
        preSelectedGrade={selectedGrade !== 'all' ? selectedGrade : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timetable Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this timetable entry for{' '}
              {timetableToDelete && getSubjectName(timetableToDelete.subject_id)} on{' '}
              {timetableToDelete?.day_of_week}, Period {timetableToDelete?.period}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TimetablePage;
