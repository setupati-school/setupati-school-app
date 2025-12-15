import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users,
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
  const teachers = initialTeachersData;

  // Modal states
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailModalOpen(true);
  };

  const classTeacher = teachers[0];
  const subjectTeachers = teachers.slice(1, 5);

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Teachers</h1>

        {/* Class Teacher */}
        <Card
          className="border-2 border-accent cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleViewTeacher(classTeacher)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Class Teacher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {classTeacher.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-semibold">{classTeacher.name}</h3>
                <p className="text-muted-foreground">
                  {classTeacher.designation} • {classTeacher.subject}
                </p>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${classTeacher.phone}`;
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {classTeacher.phone}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${classTeacher.email}`;
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Teachers */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Teachers</CardTitle>
            <CardDescription>Teachers for your subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleViewTeacher(teacher)}
                >
                  <Avatar>
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {teacher.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{teacher.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {teacher.subject}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${teacher.email}`;
                    }}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <TeacherDetailModal
        teacher={selectedTeacher}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </>
  );
};
