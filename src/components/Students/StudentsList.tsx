import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  Eye,
  Loader2,
  GraduationCap,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import type { Student } from '@/types/schoolStoreType';
import { Skeleton } from '@/components/ui/skeleton';
import { useSchoolStore } from '@/store/schoolStore';
import { ViewStudentDialog } from './ViewStudentDialog';
import { EditStudentForm } from './EditStudentForm';
import { DeleteStudentDialog } from './DeleteStudentDialog';
import { getGrade, getSection, getInitial as getInitials, formatDate } from '../../lib/utils';


interface StudentsListProps {
  students: Student[];
  searchTerm: string;
  loading?: boolean;
  onRefresh?: () => void;
  isAdmin?: boolean;
}

export const StudentsList = ({
  students,
  searchTerm,
  loading = false,
  onRefresh,
  isAdmin = false
}: StudentsListProps) => {
  const { sections, grades } = useSchoolStore();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setViewDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    onRefresh?.();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Records</span>
              <Skeleton className="h-5 w-20" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading students...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!students?.length) {
    return (
      <div className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Records</span>
              <Badge variant="outline" className="text-xs">
                0 students
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'No students found matching your search.'
                  : 'No students added yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Students Table */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Records</span>
              <Badge variant="outline" className="text-xs">
                {students?.length ?? 0} student{(students?.length ?? 0) !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Grade ID / Section ID</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Aadhar No.</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.map((student) => {
                    const section = getSection(student?.section_id);
                    const grade = getGrade(student?.section_id);

                    return (
                      <TableRow key={student?.id}>
                        {/* Student Name */}
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary-soft text-primary">
                                {getInitials(student?.f_name ?? '', student?.l_name ?? '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {student?.f_name} {student?.l_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          <span className="text-sm">{student?.email || '-'}</span>
                        </TableCell>

                        {/* Roll No */}
                        <TableCell>
                          <Badge variant="outline">{student?.roll_no || '-'}</Badge>
                        </TableCell>

                        {/* Grade / Section */}
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge className="bg-accent text-accent-foreground w-fit">
                              {grade?.grade_id || section?.grade_id || '-'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Section: {student?.section_id || '-'}
                            </span>
                          </div>
                        </TableCell>

                        {/* DOB */}
                        <TableCell>
                          <span className="text-sm">{formatDate(student?.dob ?? '')}</span>
                        </TableCell>

                        {/* Gender */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              student?.gender?.toLowerCase() === 'male'
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : student?.gender?.toLowerCase() === 'female'
                                  ? 'border-pink-200 bg-pink-50 text-pink-700'
                                  : ''
                            }
                          >
                            {student?.gender || '-'}
                          </Badge>
                        </TableCell>

                        {/* Blood Group */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-success-soft text-success"
                          >
                            {student?.blood_group || '-'}
                          </Badge>
                        </TableCell>

                        {/* Aadhar No */}
                        <TableCell>
                          <span className="text-sm font-mono">
                            {student?.aadhar_no
                              ? `${student.aadhar_no.slice(0, 4)}-${student.aadhar_no.slice(4, 8)}-${student.aadhar_no.slice(8)}`
                              : '-'}
                          </span>
                        </TableCell>

                        {/* Phone */}
                        <TableCell>
                          <div className="text-sm">
                            <p>{student?.phone_num1 || '-'}</p>
                            {student?.phone_num2 && (
                              <p className="text-xs text-muted-foreground">
                                {student?.phone_num2}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Address */}
                        <TableCell>
                          <div className="text-sm max-w-[200px]">
                            <p className="truncate" title={student?.address_line1}>
                              {student?.address_line1 || '-'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {[student?.city, student?.state, student?.pincode]
                                .filter(Boolean)
                                .join(', ') || '-'}
                            </p>
                          </div>
                        </TableCell>

                        {/* Created At */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(student?.created_at ?? '')}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleView(student)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(student)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(student)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ViewStudentDialog
        student={selectedStudent}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <EditStudentForm
        student={selectedStudent}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />

      <DeleteStudentDialog
        student={selectedStudent}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
};
