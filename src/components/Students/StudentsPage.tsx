import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSchoolStore } from '@/store/schoolStore';
import { Search, Plus, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { StudentsList } from './StudentsList';
import api from '@/lib/axiosConfig';
import type { Student, Section, Grade } from '@/types/schoolStoreType';
import { useDebounce } from '@/hooks/useDebounce';

export const StudentsPage = () => {
  const navigate = useNavigate();
  const { students, setStudents, setSections, setGrades, currentUser } = useSchoolStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce search term to reduce filtering operations
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isAdmin = currentUser?.role === 'admin';

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, sectionsRes, gradesRes] = await Promise.all([
        api.get('/students/all'),
        api.get('/sections/all'),
        api.get('/grades/all')
      ]);

      // Process students
      const studentsData = studentsRes?.data || [];
      const studentList: Student[] = Array.isArray(studentsData)
        ? studentsData
            .filter(
              (item: { id: string; student: Student | null }) =>
                item.student !== null
            )
            .map((item: { id: string; student: Student }) => ({
              id: item.id,
              ...item.student
            }))
        : [];

      const sectionsData = sectionsRes?.data || [];
      const sectionList: Section[] = Array.isArray(sectionsData)
        ? sectionsData
            .filter(
              (item: { id: string; section: Section | null }) =>
                item.section !== null
            )
            .map((item: { id: string; section: Section }) => ({
              id: item.id,
              ...item.section
            }))
        : [];

      const gradesData = gradesRes?.data || [];
      const gradeList: Grade[] = Array.isArray(gradesData)
        ? gradesData
            .filter(
              (item: { id: string; grade: Grade | null }) =>
                item.grade !== null
            )
            .map((item: { id: string; grade: Grade }) => ({
              id: item.id,
              ...item.grade
            }))
        : [];

      setStudents(studentList);
      setSections(sectionList);
      setGrades(gradeList);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch students. Please try again.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [setStudents, setSections, setGrades]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Note: Filtering is now handled in StudentsList component with pagination
  // This is kept for backward compatibility but StudentsList handles its own filtering
  const filteredStudents = students ?? [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">
              Manage student information and records
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchStudents}
              disabled={loading}
              className="shadow-soft"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            {isAdmin && (
              <Button
                className="bg-gradient-primary text-primary-foreground shadow-soft"
                onClick={() => navigate('/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="shadow-soft border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStudents}
                className="mt-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <StudentsList
          students={filteredStudents}
          searchTerm={debouncedSearchTerm}
          loading={loading}
          onRefresh={fetchStudents}
          isAdmin={isAdmin}
        />
      </div>
    </>
  );
};
