import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/text-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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
import { Subject, Grade, Teacher, Section } from '@/types/schoolStoreType';
import { BACKEND_URL } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  BookOpen,
  GraduationCap,
  RefreshCw,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  User,
  Calendar,
  Clock
} from 'lucide-react';

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export const SubjectsPage: React.FC = () => {
  const { toast } = useToast();
  const {
    subjects,
    setSubjects,
    grades,
    setGrades,
    teachers,
    setTeachers,
    sections,
    setSections
  } = useSchoolStore();
  const { role } = useAuthStore();

  const isAdmin = role === 'admin';

  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [gradeSubjects, setGradeSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Admin modal states
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteSubjectDialog, setDeleteSubjectDialog] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states for Subject
  const [subjectId, setSubjectId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectTeacherId, setSubjectTeacherId] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');

  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/subjects/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const data = response.data?.subjects || response.data || [];
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/teachers/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const data = response.data?.teachers || response.data || [];
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  // Fetch all sections
  const fetchSections = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/sections/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const data = response.data?.sections || response.data || [];
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections([]);
    }
  };

  // Fetch grades from backend API
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/grades/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      const data = response.data?.grades || response.data || [];
      const gradesData: Grade[] = Array.isArray(data)
        ? data.map((item: { id: string; grade?: Grade }) => ({
            id: item.id,
            ...(item.grade || item)
          }))
        : [];

      setGrades(gradesData);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast({
        title: 'Error',
        description: 'Failed to load grades',
        variant: 'destructive'
      });
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchSubjects();
    fetchTeachers();
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get teacher name by teacher ID
  const getTeacherName = (teacherId?: string): string => {
    if (!teacherId) return 'Not Assigned';
    const teacher = teachers.find((t) => t?.teacher?.teacher_id === teacherId);
    if (teacher) {
      return `${teacher?.teacher?.first_name} ${teacher?.teacher?.last_name}`;
    }
    return 'Not Assigned';
  };

  // Handle grade click - get subjects from grade's subject_name array
  const handleGradeClick = (grade: Grade) => {
    setSelectedGrade(grade);
    setLoadingSubjects(true);

    // Get subjects that match the grade's subject_id array
    const subjectIds = grade?.subject_id || [];
    const matchedSubjects = subjects.filter((subject) =>
      subjectIds.includes(subject?.subject_id)
    );

    setGradeSubjects(matchedSubjects);
    setLoadingSubjects(false);
  };

  // Go back to grades view
  const handleBackToGrades = () => {
    setSelectedGrade(null);
    setGradeSubjects([]);
  };

  // Refresh data
  const handleRefresh = () => {
    fetchGrades();
    fetchSubjects();
    fetchTeachers();
    fetchSections();
  };

  // === ADMIN FUNCTIONS ===

  // Open subject modal for create/edit
  const openSubjectModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectId(subject?.subject_id || '');
      setSubjectName(subject?.subject_name || '');
      setSubjectTeacherId(subject?.teacher_id || '');
      setSubjectDescription(subject?.description || '');
    } else {
      setEditingSubject(null);
      setSubjectId('');
      setSubjectName('');
      setSubjectTeacherId('');
      setSubjectDescription('');
    }
    setSubjectModalOpen(true);
  };

  // Save subject
  const handleSaveSubject = async () => {
    if (!subjectId.trim()) {
      toast({
        title: 'Error',
        description: 'Subject ID is required',
        variant: 'destructive'
      });
      return;
    }
    if (!subjectName.trim()) {
      toast({
        title: 'Error',
        description: 'Subject name is required',
        variant: 'destructive'
      });
      return;
    }
    if (!subjectTeacherId) {
      toast({
        title: 'Error',
        description: 'Teacher is required',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const token = await getAuthToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const now = new Date().toISOString();

      if (editingSubject) {
        const payload = {
          subject_id: subjectId,
          subject_name: subjectName,
          grade_id: editingSubject.grade_id || selectedGrade?.id || '',
          teacher_id: subjectTeacherId,
          description: subjectDescription || null,
          updated_at: now
        };

        await axios.put(
          `${BACKEND_URL}/subjects/update/${editingSubject.id}`,
          payload,
          { headers }
        );
        toast({
          title: 'Success',
          description: 'Subject updated successfully'
        });

        // Update local state immediately
        const updatedSubject = { ...editingSubject, ...payload };
        setSubjects((prev) =>
          prev.map((s) => (s.subject_id === editingSubject.subject_id ? updatedSubject : s))
        );
        setGradeSubjects((prev) =>
          prev.map((s) => (s.subject_id === editingSubject.subject_id ? updatedSubject : s))
        );
      } else {
        const payload = {
          subject_id: subjectId,
          subject_name: subjectName,
          grade_id: selectedGrade?.id || '',
          teacher_id: subjectTeacherId,
          description: subjectDescription || null,
          created_at: now,
          updated_at: now
        };

        const response = await axios.post(
          `${BACKEND_URL}/subjects/create`,
          payload,
          {
            headers
          }
        );

        // Add new subject to local state immediately
        const newSubject = response.data?.subject ||
          response.data || { ...payload, id: response.data?.id };
        setSubjects((prev) => [...prev, newSubject]);

        // Update the grade to include the new subject name
        if (selectedGrade) {
          const updatedSubjectNames = [
            ...(selectedGrade.subject_name || []),
            subjectName
          ];

          const gradePayload = {
            ...selectedGrade,
            subject_name: updatedSubjectNames,
            updated_at: now
          };

          await axios.put(
            `${BACKEND_URL}/grades/update/${selectedGrade.grade_name}`,
            gradePayload,
            { headers }
          );

          // Update grade in local state
          const updatedGrade = {
            ...selectedGrade,
            subject_name: updatedSubjectNames
          };
          setGrades((prev) =>
            prev.map((g) => (g.id === selectedGrade.id ? updatedGrade : g))
          );
          setSelectedGrade(updatedGrade);

          // Add to gradeSubjects
          setGradeSubjects((prev) => [...prev, newSubject]);
        }

        toast({
          title: 'Success',
          description: 'Subject created successfully'
        });
      }

      setSubjectModalOpen(false);
      setEditingSubject(null);
      setSubjectId('');
      setSubjectName('');
      setSubjectTeacherId('');
      setSubjectDescription('');
    } catch (error) {
      console.error('Error saving subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to save subject',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete subject
  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;

    setSaving(true);
    try {
      const token = await getAuthToken();
      await axios.delete(
        `${BACKEND_URL}/subjects/delete/${subjectToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast({ title: 'Success', description: 'Subject deleted successfully' });

      // Update local state immediately
      const updatedSubjects = subjects.filter(
        (s) => s.subject_id !== subjectToDelete.subject_id
      );
      setSubjects(updatedSubjects);

      // Update grade subjects view immediately
      setGradeSubjects(
        gradeSubjects.filter((s) => s.subject_id !== subjectToDelete.subject_id)
      );

      setDeleteSubjectDialog(false);
      setSubjectToDelete(null);
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete subject',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {selectedGrade ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBackToGrades}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  {selectedGrade?.grade_name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Subjects available in this grade
                </p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Grades Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Select a grade to view its subjects
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {isAdmin && selectedGrade && (
            <Button onClick={() => openSubjectModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : selectedGrade ? (
        /* Subjects View */
        <div className="space-y-4">
          {/* Stats */}
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Total Subjects in {selectedGrade?.grade_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{gradeSubjects.length}</p>
            </CardContent>
          </Card>

          {/* Subjects Grid */}
          {loadingSubjects ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : gradeSubjects.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {gradeSubjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="shadow-soft hover:shadow-medium transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {subject.subject_name || 'Unnamed Subject'}
                      </CardTitle>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openSubjectModal(subject)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setSubjectToDelete(subject);
                              setDeleteSubjectDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Teacher Info */}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Teacher:</span>
                      <span className="font-medium">
                        {getTeacherName(subject?.teacher_id)}
                      </span>
                    </div>

                    {/* Description */}
                    {subject.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {subject.description}
                      </p>
                    )}

                    {/* Grade Badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {selectedGrade.grade_name}
                      </Badge>
                    </div>

                    {/* Timestamps */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      {subject.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Created:{' '}
                            {new Date(subject.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {subject.updated_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Updated:{' '}
                            {new Date(subject.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-soft">
              <CardContent className="py-12">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Subjects Found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    No subjects are assigned to this grade yet.
                  </p>
                  {isAdmin && (
                    <Button onClick={() => openSubjectModal()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Subject
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Grades Dashboard View */
        <div className="space-y-4">
          {/* Stats */}
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Total Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{grades.length}</p>
            </CardContent>
          </Card>

          {/* Grades Grid */}
          {grades.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {grades.map((grade) => (
                <Card
                  key={grade?.grade_id}
                  className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer hover:border-primary group"
                  onClick={() => handleGradeClick(grade)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {grade?.grade_name || 'Unnamed Grade'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {(grade?.subject_id || []).length} subject
                        {(grade?.subject_id || []).length !== 1 ? 's' : ''}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Click to view
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-soft">
              <CardContent className="py-12">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Grades Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    There are no grades available at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Subject Modal */}
      <Dialog open={subjectModalOpen} onOpenChange={setSubjectModalOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Subject ID */}
            <div className="space-y-2">
              <Label htmlFor="subject_id">Subject ID *</Label>
              <Input
                id="subject_id"
                placeholder="e.g., SUB001"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              />
            </div>

            {/* Subject Name */}
            <div className="space-y-2">
              <Label htmlFor="subject_name">Subject Name *</Label>
              <Input
                id="subject_name"
                placeholder="e.g., Mathematics, English"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </div>

            {/* Teacher Selection */}
            <div className="space-y-2">
              <Label>Teacher *</Label>
              <Select
                value={subjectTeacherId}
                onValueChange={setSubjectTeacherId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher: any) => (
                    <SelectItem
                      key={teacher?.teacher?.teacher_id || teacher.id}
                      value={teacher?.teacher?.teacher_id || teacher.id}
                    >
                      {teacher?.teacher?.first_name || teacher.first_name}{' '}
                      {teacher?.teacher?.last_name || teacher.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter subject description (optional)"
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubjectModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSubject} disabled={saving}>
              {saving ? 'Saving...' : editingSubject ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subject Dialog */}
      <AlertDialog
        open={deleteSubjectDialog}
        onOpenChange={setDeleteSubjectDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{subjectToDelete?.subject_name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubject}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubjectsPage;
