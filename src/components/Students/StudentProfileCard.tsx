import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSchoolStore } from '@/store/schoolStore';
import { User, GraduationCap, BookOpen, Mail, Phone } from 'lucide-react';

import { ProfileInfoItem } from './shared';
import { getInitials } from '../../lib/utils';

export const StudentProfileCard = () => {
  const { getMyStudent, getMySection, getMyGrade, getMySubjects, currentUser } =
    useSchoolStore();

  const student = getMyStudent?.() ?? null;
  const section = getMySection?.() ?? null;
  const grade = getMyGrade?.() ?? null;
  const subjects = getMySubjects?.() ?? [];

  const displayName = student
    ? `${student?.f_name ?? ''} ${student?.l_name ?? ''}`.trim() || 'Student'
    : currentUser?.name ?? 'Student';

  const initials = getInitials(displayName);

  return (
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
                {section ? ` - Section ${section.section_name}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          {student?.roll_no && (
            <ProfileInfoItem
              icon={<User className="h-4 w-4 text-primary" />}
              iconBgClass="bg-primary/10"
              label="Roll No"
              value={student.roll_no}
            />
          )}

          {subjects?.length > 0 && (
            <ProfileInfoItem
              icon={<BookOpen className="h-4 w-4 text-success" />}
              iconBgClass="bg-success/10"
              label="Subjects"
              value={subjects?.length ?? 0}
            />
          )}

          {(grade || section) && (
            <ProfileInfoItem
              icon={<GraduationCap className="h-4 w-4 text-warning" />}
              iconBgClass="bg-warning/10"
              label="Class"
              value={grade?.grade_name ?? 'N/A'}
            />
          )}

          {(currentUser?.email || student?.phone_num1) && (
            <ProfileInfoItem
              icon={
                currentUser?.email ? (
                  <Mail className="h-4 w-4 text-accent-foreground" />
                ) : (
                  <Phone className="h-4 w-4 text-accent-foreground" />
                )
              }
              iconBgClass="bg-accent"
              label={currentUser?.email ? 'Email' : 'Phone'}
              value={currentUser?.email ?? student?.phone_num1 ?? 'N/A'}
              truncate
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfileCard;
