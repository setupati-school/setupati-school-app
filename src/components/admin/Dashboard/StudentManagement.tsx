import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSchoolStore } from '@/store/schoolStore';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Eye,
  UserPlus,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import type { Student } from '@/types/schoolStoreType';
import { getGrade, getSection } from '../../../lib/utils';

interface StudentManagementProps {
  onViewStudent?: (student: Student) => void;
}

export const StudentManagement = ({ onViewStudent }: StudentManagementProps) => {
  const navigate = useNavigate();
  const { students, sections, grades } = useSchoolStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;

    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s?.f_name.toLowerCase().includes(query) ||
        s?.l_name.toLowerCase().includes(query) ||
        s?.roll_no.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);


  // Group students by grade
  const studentsByGrade = useMemo(() => {
    const grouped: Record<string, Student[]> = {};
    filteredStudents.forEach((student) => {
      const grade = getGrade(student?.section_id, grades, sections);
      const gradeName = grade?.grade_name ?? 'Unassigned';
      if (!grouped[gradeName]) {
        grouped[gradeName] = [];
      }
      grouped[gradeName].push(student);
    });
    return grouped;
  }, [filteredStudents, grades, sections]);

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span>Students</span>
            <Badge variant="secondary" className="ml-2">
              {students.length}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/create')}
            className="gap-1"
          >
            <UserPlus className="h-3 w-3" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {filteredStudents.length > 0 ? (
            Object.entries(studentsByGrade).map(([gradeName, gradeStudents]) => (
              <div key={gradeName}>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {gradeName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({gradeStudents.length})
                  </span>
                </div>
                <div className="space-y-1 ml-5">
                  {gradeStudents.slice(0, 5).map((student) => {
                    const section = getSection(student?.section_id, sections);
                    return (
                      <button
                        key={student.id}
                        onClick={() => onViewStudent?.(student)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      >
                        {/* {
                          (student?.f_name.length > 0 && student?.l_name.length > 0) && <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                            {student?.f_name[0]}
                            {student?.l_name[0]}
                          </div>
                        } */}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {student?.f_name} {student?.l_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {section?.section_name ?? ''} | Roll: {student?.roll_no}
                          </p>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </button>
                    );
                  })}
                  {gradeStudents.length > 5 && (
                    <button
                      onClick={() => navigate('/students')}
                      className="w-full flex items-center justify-center gap-1 p-2 text-xs text-primary hover:underline"
                    >
                      View all {gradeStudents?.length} students
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No students found' : 'No students available'}
              </p>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/students')}
          >
            View All Students
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentManagement;
