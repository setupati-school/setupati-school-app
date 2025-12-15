import { useEffect, useState } from 'react';
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
import { Search, Phone, Filter } from 'lucide-react';
import { TeacherDetailModal, Teacher } from '@/components/modals';
import { useSchoolStore } from '@/store';
import { structureAllTeacherSectionData } from '@/lib/utils';

export const TeacherSection = () => {
  const { teachers, getAllTeachers } = useSchoolStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modal states
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await getAllTeachers();
    };

    fetchData();
  }, []);

  const teachersData: Teacher = structureAllTeacherSectionData(teachers);

  const myClassTeachers = teachersData.filter((t) =>
    t.classes.includes('VII A')
  );

  const allTeachers = teachersData.filter((teacher: Teacher) => {
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

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Teachers</h1>

        <Tabs defaultValue="myclass">
          <TabsList>
            <TabsTrigger value="myclass">My Class</TabsTrigger>
            <TabsTrigger value="other">Other Teachers</TabsTrigger>
          </TabsList>

          <TabsContent value="myclass" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Class VII A</CardTitle>
                    <CardDescription>
                      Subject teachers for your class
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">45 Students</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myClassTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleViewTeacher(teacher)}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
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
                          window.location.href = `tel:${teacher.phone}`;
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other" className="mt-6 space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTeachers.map((teacher) => (
                <Card
                  key={teacher.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewTeacher(teacher)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
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
                          {teacher.designation}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {teacher.department}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <TeacherDetailModal
        teacher={selectedTeacher}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </>
  );
};
