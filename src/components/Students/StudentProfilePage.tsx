import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchoolStore } from '@/store/schoolStore';
import {
  User,
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Droplet,
  CreditCard,
  Hash,
  Users,
  Clock
} from 'lucide-react';
import { getInitials } from '../../lib/utils';

const InfoRow = ({
  icon: Icon,
  label,
  value,
  subValue
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
}) => (
  <div className="flex items-start gap-4 py-4 border-b border-border/30 last:border-0">
    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <p className="font-semibold text-foreground mt-1 truncate">{value || '-'}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
      )}
    </div>
  </div>
);

export const StudentProfilePage = () => {
  const { getMyStudent, getMySection, getMyGrade, getMySubjects, currentUser, subjects } =
    useSchoolStore();

  const student = getMyStudent?.() ?? null;
  const section = getMySection?.() ?? null;
  const grade = getMyGrade?.() ?? null;
  const mySubjects = getMySubjects?.() ?? [];

  const displayName = student
    ? `${student?.f_name ?? ''} ${student?.l_name ?? ''}`.trim() || 'Student'
    : currentUser?.name ?? 'Student';

  const initials = getInitials(displayName);

  const getSubjectName = (subjectId: string) => {
    const subject = subjects?.find((s) => s.id === subjectId || s.subject_id === subjectId);
    return subject?.subject_name ?? subjectId;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatAddress = () => {
    const parts = [
      student?.address_line1,
      student?.address_line2,
      student?.landmark && `Near ${student.landmark}`,
      [student?.city, student?.state].filter(Boolean).join(', '),
      student?.country,
      student?.pincode && `- ${student.pincode}`
    ].filter(Boolean);
    return parts.join(', ') || '-';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card className="shadow-soft overflow-hidden border-0">
        <div className="h-36 bg-gradient-primary relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>
        <CardContent className="pt-0 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 -mt-16">
            {/* Avatar */}
            <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-4 ring-primary/20">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 pt-4 sm:pt-8">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {displayName}
                </h1>
                <Badge className="bg-primary text-primary-foreground border-0 shadow-md">
                  Student
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {grade && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    <GraduationCap className="h-4 w-4" />
                    {grade?.grade_name}
                    {section && ` - Section ${section?.section_name}`}
                  </span>
                )}
                {student?.roll_no && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    <Hash className="h-4 w-4" />
                    Roll No: {student?.roll_no}
                  </span>
                )}
                {currentUser?.email && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    <Mail className="h-4 w-4" />
                    {currentUser?.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full justify-start bg-muted p-1.5 h-auto flex-wrap rounded-xl">
          <TabsTrigger
            value="personal"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            <Phone className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger
            value="academic"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            <BookOpen className="h-4 w-4" />
            Academic
          </TabsTrigger>
        </TabsList>

        {/* Personal Tab */}
        <TabsContent value="personal" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
                <InfoRow
                  icon={User}
                  label="Full Name"
                  value={displayName}
                />
                <InfoRow
                  icon={Hash}
                  label="Roll Number"
                  value={student?.roll_no || '-'}
                />
                <InfoRow
                  icon={Users}
                  label="Gender"
                  value={student?.gender || '-'}
                />
                <InfoRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={formatDate(student?.dob || '')}
                />
                <InfoRow
                  icon={Droplet}
                  label="Blood Group"
                  value={student?.blood_group || '-'}
                />
                <InfoRow
                  icon={CreditCard}
                  label="Aadhar Number"
                  value={
                    student?.aadhar_no
                      ? `XXXX-XXXX-${student?.aadhar_no.slice(-4)}`
                      : '-'
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={currentUser?.email || '-'}
                />
                <InfoRow
                  icon={Phone}
                  label="Primary Phone"
                  value={student?.phone_num1 || '-'}
                  subValue={student?.phone_num2 ? `Alt: ${student?.phone_num2}` : undefined}
                />
              </div>

              <div className="mt-6 pt-6 border-t border-border/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Address</h3>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-sm leading-relaxed text-foreground">
                    {formatAddress()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
                <InfoRow
                  icon={GraduationCap}
                  label="Class"
                  value={grade?.grade_name || '-'}
                  subValue={section ? `Section ${section?.section_name}` : undefined}
                />
                <InfoRow
                  icon={BookOpen}
                  label="Total Subjects"
                  value={`${mySubjects?.length || student?.subject_ids?.length || 0} Subjects`}
                />
              </div>

              {/* Enrolled Subjects */}
              {(mySubjects?.length > 0 || student?.subject_ids?.length > 0) && (
                <div className="mt-6 pt-6 border-t border-border/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Enrolled Subjects</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mySubjects?.length > 0
                      ? mySubjects.map((subject) => (
                          <Badge
                            key={subject.id}
                            className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                          >
                            {subject?.subject_name}
                          </Badge>
                        ))
                      : student?.subject_ids?.map((subjectId, index) => (
                          <Badge
                            key={index}
                            className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                          >
                            {getSubjectName(subjectId)}
                          </Badge>
                        ))}
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-border/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Account Information</h3>
                </div>
                <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
                  <InfoRow
                    icon={Calendar}
                    label="Account Created"
                    value={formatDate(student?.created_at || currentUser?.created_at || '')}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Last Updated"
                    value={formatDate(student?.updated_at || currentUser?.updated_at || '')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProfilePage;
