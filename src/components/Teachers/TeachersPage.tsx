import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSchoolStore } from '@/store/schoolStore';
import { Search, Plus, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { TeachersList } from './TeachersList';
import api from '@/lib/axiosConfig';
import type { Teacher } from '@/types/schoolStoreType';

export const TeachersPage = () => {
  const navigate = useNavigate();
  const { teachers, setTeachers, currentUser } = useSchoolStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/teachers/all');
      const data = response?.data || [];

      const teacherList: Teacher[] = Array.isArray(data)
        ? data
            .filter(
              (item: { id: string; teacher: Teacher | null }) =>
                item.teacher !== null
            )
            .map((item: { id: string; teacher: Teacher }) => ({
              id: item.id,
              ...item.teacher
            }))
        : [];

      setTeachers(teacherList);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to fetch teachers. Please try again.');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [setTeachers]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const filteredTeachers = (teachers ?? []).filter((teacher) => {
    const firstName = teacher?.first_name || teacher?.f_name || '';
    const lastName = teacher?.last_name || teacher?.l_name || '';
    const designation = teacher?.designation || '';

    return (
      firstName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      lastName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      designation?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground">
              Manage faculty information and assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchTeachers}
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
                Add Teacher
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
                  placeholder="Search teachers by name or designation..."
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
                onClick={fetchTeachers}
                className="mt-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <TeachersList
          teachers={filteredTeachers}
          searchTerm={searchTerm}
          loading={loading}
          onRefresh={fetchTeachers}
          isAdmin={isAdmin}
        />
      </div>
    </>
  );
};
