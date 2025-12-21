import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axiosConfig';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchoolStore } from '@/store/schoolStore';
import { useAuthStore } from '@/store/authStore';
import { Timetable, TimetableResponse, ExamTimetable, DayOfWeek, ExamTimetableResponse } from '@/types/schoolStoreType';
import { formatDate, formatTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CreateTimetableForm } from './CreateTimetableForm';
import { CreateExamTimetableForm } from './CreateExamTimetableForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { firebaseErrorParser } from '@/lib/firebaseErrorParser';
import {
  Calendar,
  Plus,
  RefreshCw,
  Clock,
  BookOpen,
  Users,
  Edit2,
  Trash2,
  FileText
} from 'lucide-react';
import { DAYS_OF_WEEK, PERIODS, EXAM_TYPES } from '../../lib/utils';

export const TimetablePage: React.FC = () => {
  const { toast } = useToast();
  const {
    timetables, setTimetables,
    examTimetables, setExamTimetables,
    sections, setSections,
    subjects, setSubjects,
    teachers, setTeachers,
    grades, setGrades
  } = useSchoolStore();
  const { role } = useAuthStore();

  const isAdmin = role === 'admin';

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('class');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  // Modal states for class timetable
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<TimetableResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState<TimetableResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal states for exam timetable
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExamTimetable, setEditingExamTimetable] = useState<ExamTimetable | null>(null);
  const [examDeleteDialogOpen, setExamDeleteDialogOpen] = useState(false);
  const [examTimetableToDelete, setExamTimetableToDelete] = useState<ExamTimetableResponse | null>(null);
  const [examDeleting, setExamDeleting] = useState(false);

  // Fetch all timetables
  const fetchTimetables = async () => {
    try {
      const response = await api.get('/timetables/all');

      const data = response.data?.timetables || response.data || [];
      const timetablesData = Array.isArray(data)
        ? data.map((item: { id: string; timetable?: Record<string, unknown> }) => ({
            id: item.id,
            ...(item.timetable || item)
          }))
        : [];
      setTimetables(timetablesData);
    } catch (error) {
      console.error('Error fetching timetables:', error);
      setTimetables([]);
    }
  };

  // Fetch exam timetables
  const fetchExamTimetables = async () => {
    try {
      const response = await api.get('/exam-timetables/all');

      const data = response?.data || [];
      const examTimetablesData = Array.isArray(data)
        ? data.map((item: { id: string; examTimeTable?: Record<string, unknown> }) => ({
            id: item?.id,
            ...(item?.examTimeTable || item)
          }))
        : [];
      setExamTimetables(examTimetablesData);
    } catch (error) {
      console.error('Error fetching exam timetables:', error);
      setExamTimetables([]);
    }
  };

  // Fetch sections
  const fetchSections = async () => {
    try {
      const response = await api.get('/sections/all');

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
      const response = await api.get('/teachers/all');

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
      const response = await api.get('/subjects/all');

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
      const response = await api.get('/grades/all');

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
        fetchExamTimetables(),
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
    const section = sections.filter(s => s.grade_id === selectedGrade);
    return section;
  }, [sections, selectedGrade]);

  // Filter timetables by selected section
  const filteredTimetables = useMemo(() => {
    if (selectedSection === 'all') return timetables;
    const filtered = timetables.filter(t => t?.timeTable?.section_id === selectedSection);
    return filtered;
  }, [timetables, selectedSection]);

  // Filter exam timetables by selected grade and exam type
  const filteredExamTimetables = useMemo(() => {
    let filtered = examTimetables || [];
    if (selectedGrade !== 'all') {
      filtered = filtered?.filter(et => et?.grade_id === selectedGrade);
    }
    if (selectedExamType !== 'all') {
      filtered = filtered?.filter(et => et?.exam_type === selectedExamType);
    }
    // Sort by date
    filtered = [...filtered].sort((a, b) =>
      new Date(a?.date || a?.exam_date || '').getTime() - new Date(b?.date || b?.exam_date || '').getTime()
    );
    return filtered;
  }, [examTimetables, selectedGrade, selectedExamType]);

  // Get helper functions
  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.section_id === sectionId || s.id === sectionId);
    if (!section) return 'Unknown Section';
    const grade = grades.find(g => g.id === section.grade_id || g.grade_id === section.grade_id);
    return `${grade?.grade_name || ''} - ${section.section_name}`;
  };

  const getGradeName = (gradeId: string) => {
    const grade = grades?.find(g => g?.grade_id === gradeId || g?.id === gradeId);
    return grade?.grade_name || 'Unknown Grade';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.subject_id === subjectId || s.id === subjectId);
    return subject?.subject_name || 'Unknown Subject';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.teacher_id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
  };

  // Get timetable entry for a specific day and period
  const getTimetableEntry = (day: DayOfWeek, period: number): Timetable | undefined => {
    const filteredTimetable =  filteredTimetables.find(t => t?.timeTable?.day_of_week === day && t?.timeTable?.period === period);
    return filteredTimetable;
  };

  const handleEdit = (timetable: TimetableResponse) => {
    setEditingTimetable(timetable);
    setCreateModalOpen(true);
  };

  const handleDeleteClick = (timetable: TimetableResponse) => {
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
      await api.delete(`/timetables/delete/${timetableToDelete?.timeTable?.timetable_id}`);

      toast({
        title: 'Success',
        description: 'Timetable entry deleted successfully'
      });

      fetchTimetables();
    } catch (error: any) {
      const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message,
      });
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

  // Exam timetable handlers
  const handleExamEdit = (examTimetable: ExamTimetableResponse) => {
    setEditingExamTimetable(examTimetable?.examTimeTable || examTimetable);
    setExamModalOpen(true);
  };

  const handleExamDeleteClick = (examTimetable: ExamTimetableResponse) => {
    setExamTimetableToDelete(examTimetable);
    setExamDeleteDialogOpen(true);
  };

  const handleExamDeleteConfirm = async () => {
    if (!examTimetableToDelete) return;

    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete exam timetable entries',
        variant: 'destructive'
      });
      setExamDeleteDialogOpen(false);
      return;
    }

    setExamDeleting(true);

    try {
      const examId = examTimetableToDelete?.examTimeTable?.exam_time_table_id || examTimetableToDelete?.id;
      await api.delete(`/exam-timetables/delete/${examId}`);

      toast({
        title: 'Success',
        description: 'Exam timetable entry deleted successfully'
      });

      fetchExamTimetables();
    } catch (error: any) {
      const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message,
      });
    } finally {
      setExamDeleting(false);
      setExamDeleteDialogOpen(false);
      setExamTimetableToDelete(null);
    }
  };

  const handleExamCreateSuccess = () => {
    setEditingExamTimetable(null);
    fetchExamTimetables();
  };

  const handleExamModalClose = (open: boolean) => {
    setExamModalOpen(open);
    if (!open) {
      setEditingExamTimetable(null);
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
            View and manage class and exam timetables
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
          {isAdmin && activeTab === 'class' && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          )}
          {isAdmin && activeTab === 'exam' && (
            <Button onClick={() => setExamModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Exam
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="class" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Class Timetable
          </TabsTrigger>
          <TabsTrigger value="exam" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Exam Timetable
          </TabsTrigger>
        </TabsList>

        {/* Class Timetable Tab */}
        <TabsContent value="class" className="space-y-6 mt-6">
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
                        <SelectItem key={grade?.grade_id} value={grade?.grade_id}>
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
                        <SelectItem key={section?.section_id} value={section?.section_id}>
                          {section?.section_name}
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
                    {' '}Timetable for Section{' '}
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
                        <th className="border p-3 text-left font-semibold text-sm min-w-[100px]">Day</th>
                        {PERIODS.map((p) => (
                          <th key={p.period} className="border p-2 text-center font-semibold text-sm min-w-[120px]">
                            <div className="flex flex-col gap-1">
                              <span>Period {p.period}</span>
                              <span className="text-xs font-normal text-muted-foreground">
                                {p.startTime} - {p.endTime}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS_OF_WEEK.map((day) => (
                        <tr key={day} className="hover:bg-muted/30">
                          <td className="border p-3 font-medium bg-muted/20">
                            {day}
                          </td>
                          {PERIODS.map((p) => {
                            const entry = getTimetableEntry(day, p.period);
                            return (
                              <td key={`${day}-${p.period}`} className="border p-2">
                                {entry ? (
                                  <div className="bg-primary/10 rounded-lg p-2 min-h-[70px] relative group">
                                    <div className="font-medium text-sm text-primary">
                                       {getSubjectName(entry?.timeTable?.subject_id)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                       ~ {getTeacherName(entry?.timeTable?.teacher_id)}
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
                                  <div className="min-h-[70px] flex items-center justify-center text-muted-foreground text-xs">
                                    {isAdmin ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => {
                                          setEditingTimetable({
                                            id: '',
                                            timeTable: {
                                              day_of_week: day,
                                              period: p.period,
                                              section_id: selectedSection,
                                              subject_id: '',
                                              teacher_id: '',
                                              created_at: '',
                                              updated_at: ''
                                            }
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
        </TabsContent>

        {/* Exam Timetable Tab */}
        <TabsContent value="exam" className="space-y-6 mt-6">
          {/* Exam Timetable Card with Filters */}
          <Card className="shadow-soft">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Exam Timetable
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select grade and exam type to view the schedule
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Dropdowns */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Grade</label>
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
                      <SelectItem value="all">Select Grade</SelectItem>
                      {grades?.map((grade) => (
                        <SelectItem key={grade?.grade_id} value={grade?.grade_id}>
                          {grade?.grade_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Exam Type</label>
                  <Select
                    value={selectedExamType}
                    onValueChange={setSelectedExamType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Exam Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Select Exam Type</SelectItem>
                      {EXAM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Exam Timetable Content */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : selectedGrade === 'all' || selectedExamType === 'all' ? (
                <div className="py-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select Grade & Exam Type
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Please select both grade and exam type to view the exam timetable.
                    </p>
                  </div>
                </div>
              ) : filteredExamTimetables?.length === 0 ? (
                <div className="py-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No Exam Timetable
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No {selectedExamType} exams scheduled for {getGradeName(selectedGrade)}.
                    </p>
                    {isAdmin && (
                      <Button onClick={() => setExamModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exam
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-primary">
                      {selectedExamType} - {getGradeName(selectedGrade)}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {filteredExamTimetables?.length} subject{filteredExamTimetables?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="border-b p-3 text-center font-semibold text-sm w-16">S.No</th>
                          <th className="border-b p-3 text-left font-semibold text-sm">Subject</th>
                          <th className="border-b p-3 text-left font-semibold text-sm">Date</th>
                          <th className="border-b p-3 text-left font-semibold text-sm">Time</th>
                          {isAdmin && (
                            <th className="border-b p-3 text-center font-semibold text-sm w-24">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExamTimetables?.map((exam, index) => (
                          <tr key={exam?.exam_time_table_id || exam?.id || index} className="hover:bg-muted/30">
                            <td className="border-b p-3 text-center">
                              <span className="font-medium text-muted-foreground">{index + 1}</span>
                            </td>
                            <td className="border-b p-3">
                              <div className="font-medium text-primary">{getSubjectName(exam?.subject_id)}</div>
                            </td>
                            <td className="border-b p-3">
                              <div className="font-medium">{formatDate(exam?.date || exam?.exam_date)}</div>
                            </td>
                            <td className="border-b p-3">
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatTime(exam?.start_time)} - {formatTime(exam?.end_time)}
                              </div>
                            </td>
                            {isAdmin && (
                              <td className="border-b p-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleExamEdit({ id: exam?.id || '', examTimeTable: exam })}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => handleExamDeleteClick({ id: exam?.id || '', examTimeTable: exam })}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal for Class Timetable */}
      <CreateTimetableForm
        open={createModalOpen}
        onOpenChange={handleCreateModalClose}
        timetable={editingTimetable?.timeTable || null}
        onSuccess={handleCreateSuccess}
        preSelectedSection={selectedSection !== 'all' ? selectedSection : undefined}
        preSelectedGrade={selectedGrade !== 'all' ? selectedGrade : undefined}
      />

      {/* Create/Edit Modal for Exam Timetable */}
      <CreateExamTimetableForm
        open={examModalOpen}
        onOpenChange={handleExamModalClose}
        examTimetable={editingExamTimetable}
        onSuccess={handleExamCreateSuccess}
        preSelectedGrade={selectedGrade !== 'all' ? selectedGrade : undefined}
        preSelectedExamType={selectedExamType !== 'all' ? selectedExamType : undefined}
      />

      {/* Delete Confirmation Dialog for Class Timetable */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timetable Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this timetable entry for{' '}
              {timetableToDelete?.timeTable && getSubjectName(timetableToDelete?.timeTable?.subject_id)} on{' '}
              {timetableToDelete?.timeTable?.day_of_week}, Period {timetableToDelete?.timeTable?.period}?
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

      {/* Delete Confirmation Dialog for Exam Timetable */}
      <AlertDialog open={examDeleteDialogOpen} onOpenChange={setExamDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam Timetable Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this exam entry for{' '}
              {examTimetableToDelete?.examTimeTable && getSubjectName(examTimetableToDelete?.examTimeTable?.subject_id)} on{' '}
              {examTimetableToDelete?.examTimeTable && formatDate(examTimetableToDelete?.examTimeTable?.date || examTimetableToDelete?.examTimeTable?.exam_date)}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={examDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExamDeleteConfirm}
              disabled={examDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {examDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TimetablePage;

