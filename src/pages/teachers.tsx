import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSchoolStore } from '@/store/schoolStore';
import { Search, Plus, Filter } from 'lucide-react';
import { TeachersList } from '@/components/Teachers/TeachersList';
import Layout  from '@/components/Layout';

const TeachersPage = () => {
  const { teachers } = useSchoolStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
            <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground">
                Manage faculty information and assignments
            </p>
            </div>
            <Button className="bg-gradient-primary text-primary-foreground shadow-soft">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
            </Button>
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
        <TeachersList teachers={filteredTeachers} searchTerm={searchTerm} />
        </div>
    </Layout>
  );
};
export default TeachersPage;