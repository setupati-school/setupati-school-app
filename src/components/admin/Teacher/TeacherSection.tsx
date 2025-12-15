import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Search,
  Phone,
  Mail,
  Edit,
  Trash2,
  UserPlus,
  Filter,
  Eye
} from 'lucide-react';
import {
  TeacherDetailModal,
  TeacherEditModal,
  ConfirmationModal,
  Teacher
} from '@/components/modals';
import { toast } from '@/hooks/use-toast';

const initialTeachersData: Teacher[] = [
  {
    id: '1',
    name: 'Mrs. Rekha Sharma',
    subject: 'Mathematics',
    department: 'Science',
    phone: '9876543210',
    email: 'rekha.sharma@school.com',
    designation: 'Senior Teacher',
    classes: ['VII A', 'VIII B', 'IX A']
  },
  {
    id: '2',
    name: 'Mr. Arvind Verma',
    subject: 'Science',
    department: 'Science',
    phone: '9876543211',
    email: 'arvind.verma@school.com',
    designation: 'HOD',
    classes: ['VIII B', 'X A']
  },
  {
    id: '3',
    name: 'Ms. Priya Singh',
    subject: 'English',
    department: 'Languages',
    phone: '9876543212',
    email: 'priya.singh@school.com',
    designation: 'Teacher',
    classes: ['VI A', 'VII A', 'VII B']
  },
  {
    id: '4',
    name: 'Mr. Rajesh Kumar',
    subject: 'Hindi',
    department: 'Languages',
    phone: '9876543213',
    email: 'rajesh.kumar@school.com',
    designation: 'Senior Teacher',
    classes: ['VI B', 'VII C']
  },
  {
    id: '5',
    name: 'Mrs. Anita Gupta',
    subject: 'Social Science',
    department: 'Humanities',
    phone: '9876543214',
    email: 'anita.gupta@school.com',
    designation: 'Teacher',
    classes: ['VIII A', 'IX B']
  },
  {
    id: '6',
    name: 'Mr. Sunil Yadav',
    subject: 'Physical Education',
    department: 'Sports',
    phone: '9876543215',
    email: 'sunil.yadav@school.com',
    designation: 'Sports Coach',
    classes: ['All Classes']
  }
];

export const TeacherSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [teachersData, setTeachersData] =
    useState<Teacher[]>(initialTeachersData);

  // Modal states
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isNewTeacher, setIsNewTeacher] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'save' | 'delete';
    teacher?: Teacher;
  } | null>(null);

  const teachers = teachersData.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === 'all' || teacher.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailModalOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsNewTeacher(false);
    setEditModalOpen(true);
  };

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsNewTeacher(true);
    setEditModalOpen(true);
  };

  const handleSaveTeacher = (teacher: Teacher) => {
    setPendingAction({ type: 'save', teacher });
    setConfirmModalOpen(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setPendingAction({ type: 'delete', teacher });
    setConfirmModalOpen(true);
  };

  const confirmAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'save' && pendingAction.teacher) {
      const exists = teachersData.find(
        (t) => t.id === pendingAction.teacher?.id
      );
      if (exists) {
        setTeachersData((prev) =>
          prev.map((t) =>
            t.id === pendingAction.teacher?.id ? pendingAction.teacher! : t
          )
        );
        toast({
          title: 'Success',
          description: 'Teacher updated successfully!'
        });
      } else {
        setTeachersData((prev) => [...prev, pendingAction.teacher!]);
        toast({ title: 'Success', description: 'Teacher added successfully!' });
      }
    } else if (pendingAction.type === 'delete' && pendingAction.teacher) {
      setTeachersData((prev) =>
        prev.filter((t) => t.id !== pendingAction.teacher?.id)
      );
      toast({ title: 'Deleted', description: 'Teacher removed successfully!' });
    }

    setEditModalOpen(false);
    setPendingAction(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <Button onClick={handleAddTeacher}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Languages">Languages</SelectItem>
                  <SelectItem value="Humanities">Humanities</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow
                    key={teacher.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewTeacher(teacher)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {teacher.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{teacher.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.department}</Badge>
                    </TableCell>
                    <TableCell>{teacher.designation}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${teacher.phone}`;
                          }}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${teacher.email}`;
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {Array.isArray(teacher.classes)
                          ? teacher.classes.slice(0, 2).join(', ')
                          : teacher.classes}
                        {Array.isArray(teacher.classes) &&
                          teacher.classes.length > 2 &&
                          '...'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTeacher(teacher);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTeacher(teacher);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeacher(teacher);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <TeacherDetailModal
        teacher={selectedTeacher}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
      <TeacherEditModal
        teacher={selectedTeacher}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveTeacher}
        isNew={isNewTeacher}
      />
      <ConfirmationModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        title={
          pendingAction?.type === 'delete' ? 'Delete Teacher' : 'Save Changes'
        }
        description={
          pendingAction?.type === 'delete'
            ? `Are you sure you want to delete ${pendingAction.teacher?.name}? This action cannot be undone.`
            : `Are you sure you want to save changes for ${pendingAction?.teacher?.name}?`
        }
        onConfirm={confirmAction}
        actionType={pendingAction?.type === 'delete' ? 'delete' : 'save'}
        confirmText={pendingAction?.type === 'delete' ? 'Delete' : 'Save'}
      />
    </>
  );
};
