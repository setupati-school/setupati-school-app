import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSchoolStore } from '@/store/schoolStore';
import { Search, User, ChevronRight, Users } from 'lucide-react';
import type { Student } from '@/types/schoolStoreType';
import {getGrade, getSection} from '../../../lib/utils';

interface StudentSelectorProps {
  onSelectStudent: (student: Student) => void;
  selectedStudent?: Student | null;
}

export const StudentSelector = ({
  onSelectStudent,
  selectedStudent
}: StudentSelectorProps) => {
  const { students, sections, grades } = useSchoolStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students.slice(0, 5);

    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s?.f_name.toLowerCase().includes(query) ||
        s?.l_name.toLowerCase().includes(query) ||
        s?.roll_no.toLowerCase().includes(query)
    );
  }, [students, searchQuery, sections]);


  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span>Select Student</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="pl-9"
          />
        </div>

        {selectedStudent && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {selectedStudent?.f_name[0]}
                {selectedStudent?.l_name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {selectedStudent?.f_name} {selectedStudent?.l_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Roll No: {selectedStudent?.roll_no}
                </p>
              </div>
              <Badge variant="default">Selected</Badge>
            </div>
          </div>
        )}

        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => {
              const section = getSection(student.section_id,sections);
              const grade = getGrade(student.section_id, grades, sections);
              const isSelected = selectedStudent?.id === student.id;

              return (
                <button
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left group ${
                    isSelected
                      ? 'bg-primary/10'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {student?.f_name[0]}
                    {student?.l_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {student?.f_name} {student?.l_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {grade?.grade_name ?? 'Class'} - {section?.section_name ?? ''} | Roll: {student?.roll_no}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                </button>
              );
            })
          ) : (
            <div className="text-center py-4">
              <User className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No students found' : 'No students available'}
              </p>
            </div>
          )}
        </div>

        {students.length > 5 && !searchQuery && (
          <p className="text-xs text-center text-muted-foreground">
            Showing 5 of {students.length} students. Use search to find more.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentSelector;
