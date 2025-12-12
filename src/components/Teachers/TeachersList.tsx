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
  Users,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import type { Teacher } from '@/types/schoolStoreType';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewTeacherDialog } from './ViewTeacherDialog';
import { EditTeacherForm } from './EditTeacherForm';
import { DeleteTeacherDialog } from './DeleteTeacherDialog';

interface TeachersTableProps {
  teachers: Teacher[];
  searchTerm: string;
  loading?: boolean;
  onRefresh?: () => void;
  isAdmin?: boolean;
}

export const TeachersList = ({
  teachers,
  searchTerm,
  loading = false,
  onRefresh,
  isAdmin = false
}: TeachersTableProps) => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getTeacherName = (teacher: Teacher) => {
    const firstName = teacher?.first_name || teacher?.f_name || '';
    const lastName = teacher?.last_name || teacher?.l_name || '';
    return { firstName, lastName };
  };

  const getSectionIds = (teacher: Teacher) => {
    return teacher?.section_ids || teacher?.section_id || [];
  };

  const getSubjectIds = (teacher: Teacher) => {
    return teacher?.subject_ids || teacher?.subject_id || [];
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.[0] ?? '';
    const last = lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || 'T';
  };

  const getExperienceColor = (years: number) => {
    if (years >= 10) return 'bg-success text-success-foreground';
    if (years >= 5) return 'bg-warning text-warning-foreground';
    return 'bg-primary-soft text-primary';
  };

  const handleView = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewDialogOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditDialogOpen(true);
  };

  const handleDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Faculty Members</span>
              <Skeleton className="h-5 w-20" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading teachers...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Faculty Members</span>
              <Badge variant="outline" className="text-xs">
                0 teachers
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'No teachers found matching your search.'
                  : 'No teachers added yet.'}
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
        {/* Teachers Table */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Faculty Members</span>
              <Badge variant="outline" className="text-xs">
                {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => {
                    const { firstName, lastName } = getTeacherName(teacher);
                    const sectionIds = getSectionIds(teacher);
                    const subjectIds = getSubjectIds(teacher);

                    return (
                      <TableRow key={teacher?.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary-soft text-primary">
                                {getInitials(firstName, lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {firstName} {lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {teacher?.gender || '-'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-accent text-accent-foreground">
                            {teacher?.designation || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{teacher?.qualification || '-'}</p>
                            <p className="text-xs text-muted-foreground">
                              {subjectIds?.length ?? 0} subject
                              {subjectIds?.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getExperienceColor(
                              teacher?.experienced_years ?? 0
                            )}
                          >
                            {teacher?.experienced_years ?? 0} years
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {sectionIds?.length > 0 ? (
                              sectionIds
                                ?.slice(0, 2)
                                ?.map((sectionId, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {sectionId}
                                  </Badge>
                                ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                            )}
                            {sectionIds?.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{sectionIds?.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>
                              {teacher?.doj
                                ? new Date(teacher?.doj)?.toLocaleDateString()
                                : '-'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              DOB:{' '}
                              {teacher?.dob
                                ? new Date(teacher?.dob)?.toLocaleDateString()
                                : '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleView(teacher)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(teacher)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(teacher)}
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
      <ViewTeacherDialog
        teacher={selectedTeacher}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <EditTeacherForm
        teacher={selectedTeacher}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />

      <DeleteTeacherDialog
        teacher={selectedTeacher}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
};
