import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSchoolStore } from '@/store/schoolStore';
import { Search, Plus, Filter } from 'lucide-react';
import { StudentList } from '@/components/Students/StudentsList';
import Layout  from '@/components/Layout';

export default function StudentsPage() {
    const { students } = useSchoolStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(
        (student) =>
            student.f_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.l_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.roll_no.includes(searchTerm)
    );

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Students</h1>
                        <p className="text-muted-foreground">
                            Manage student information and records
                        </p>
                    </div>
                    <Button className="bg-gradient-primary text-primary-foreground shadow-soft">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                    </Button>
                </div>

                {/* Filters and Search */}
                <Card className="shadow-soft">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search students by name or roll number..."
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
                <StudentList students={filteredStudents} searchTerm={searchTerm} />
            </div>
        </Layout>
    );
}
