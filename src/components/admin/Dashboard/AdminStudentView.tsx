import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSchoolStore } from '@/store/schoolStore';
import { attendanceRate } from '../../../lib/utils';
import {
  User,
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  CalendarCheck,
  Award,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import type { Student, Attendance } from '@/types/schoolStoreType';

interface AdminStudentViewProps {
  student: Student;
  onBack: () => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

export const AdminStudentView = ({
  student,
  onBack,
  onEdit,
  onDelete
}: AdminStudentViewProps) => {
  const { sections, grades, subjects, attendance, exams } = useSchoolStore();
  const [studentAttendance, setStudentAttendance] = useState<Attendance[]>([]);

  const section = sections.find((s) => s.id === student.section_id);
  const grade = section ? grades.find((g) => g.id === section.grade_id) : null;
  const studentSubjects = subjects.filter((s) =>
    student.subject_ids?.includes(s.id)
  );

  useEffect(() => {
    const records = attendance.filter((a) => a.student_id === student.id);
    setStudentAttendance(records);
  }, [attendance, student.id]);

  const displayName = `${student.f_name} ${student.l_name}`;
  const initials = `${student.f_name[0]}${student.l_name[0]}`.toUpperCase();

  const {
    getStudentCount,
    getPresentStudentsToday
  } = useSchoolStore();

  // Attendance calculations
  const total = getStudentCount();
  const present = getPresentStudentsToday();
  const absent = studentAttendance.filter((r) => r.status === 'absent').length;
  const late = studentAttendance.filter((r) => r.status === 'late').length;

  // Exam calculations
  const studentExams = exams || [];
  const overallAverage =
    studentExams.length > 0
      ? Math.round(
          studentExams.reduce((sum, exam) => {
            const examSubjects = exam?.subjects || [];
            const totalMarks = examSubjects.reduce(
              (s, x) => s + (Number(x?.marks) || 0),
              0
            );
            const totalMax = examSubjects.reduce(
              (s, x) => s + (Number(x?.maxMarks ?? 100) || 100),
              0
            );
            return sum + (totalMax > 0 ? (totalMarks / totalMax) * 100 : 0);
          }, 0) / studentExams.length
        )
      : 0;

  const getGrade = (pct: number) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(student)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(student)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Student Profile Card */}
      <Card className="shadow-soft overflow-hidden">
        <div className="h-24 bg-gradient-primary" />
        <CardContent className="pt-0 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-soft">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {displayName}
                </h2>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  Student
                </Badge>
              </div>

              {(grade || section) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {grade?.grade_name ?? 'Class'}
                  {section ? ` - Section ${section?.section_name}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Roll No</p>
                <p className="text-sm font-medium">{student?.roll_no}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subjects</p>
                <p className="text-sm font-medium">{studentSubjects.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="text-sm font-medium">{grade?.grade_name ?? 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <Phone className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium truncate max-w-[100px]">
                  {student?.phone_num1 ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Attendance Card */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CalendarCheck className="h-4 w-4 text-success" />
              </div>
              <span>Attendance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {total === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No attendance records
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {attendanceRate(total, present)}%
                  </div>
                  <Badge
                    variant={attendanceRate(total, present) >= 75 ? 'default' : 'destructive'}
                    className="mt-1"
                  >
                    {attendanceRate(total, present) >= 90
                      ? 'Excellent'
                      : attendanceRate(total, present) >= 75
                        ? 'Good'
                        : 'Low'}
                  </Badge>
                </div>

                <Progress value={attendanceRate(total, present)} className="h-2" />

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-success/10">
                    <CheckCircle className="h-4 w-4 text-success mx-auto mb-1" />
                    <p className="text-lg font-semibold">{present}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Present
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-destructive/10">
                    <XCircle className="h-4 w-4 text-destructive mx-auto mb-1" />
                    <p className="text-lg font-semibold">{absent}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Absent
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-warning/10">
                    <Clock className="h-4 w-4 text-warning mx-auto mb-1" />
                    <p className="text-lg font-semibold">{late}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Late
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <span>Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentExams.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No exam results</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {overallAverage}%
                  </div>
                  <Badge variant="default" className="mt-1">
                    Grade {getGrade(overallAverage)}
                  </Badge>
                </div>

                <Progress value={overallAverage} className="h-2" />

                <p className="text-xs text-center text-muted-foreground">
                  Average of {studentExams.length} exam
                  {studentExams.length !== 1 ? 's' : ''}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm font-medium">
                  {student.dob
                    ? new Date(student?.dob).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm font-medium">{student?.gender ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Blood Group</p>
                <p className="text-sm font-medium">
                  {student?.blood_group ?? 'N/A'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">
                  {student?.address_line1 ?? 'N/A'}
                  {student?.city ? `, ${student?.city}` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">
                  {student?.phone_num1 ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aadhar No</p>
                <p className="text-sm font-medium">
                  {student?.aadhar_no ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStudentView;
