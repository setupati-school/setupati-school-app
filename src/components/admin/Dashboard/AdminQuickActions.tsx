import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  CalendarCheck,
  FileText,
  GraduationCap,
  Users,
  Settings,
  ChevronRight,
  Zap
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  iconBg: string;
  iconColor: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Add Student',
    description: 'Register new student',
    icon: UserPlus,
    path: '/create',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  {
    title: 'Mark Attendance',
    description: 'Record daily attendance',
    icon: CalendarCheck,
    path: '/attendance',
    iconBg: 'bg-success/10',
    iconColor: 'text-success'
  },
  {
    title: 'Create Circular',
    description: 'Send announcements',
    icon: FileText,
    path: '/circulars',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning'
  },
  {
    title: 'Manage Students',
    description: 'View all students',
    icon: GraduationCap,
    path: '/students',
    iconBg: 'bg-accent',
    iconColor: 'text-accent-foreground'
  },
  {
    title: 'Manage Teachers',
    description: 'View all teachers',
    icon: Users,
    path: '/teachers',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive'
  },
  {
    title: 'Settings',
    description: 'System configuration',
    icon: Settings,
    path: '/settings',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground'
  }
];

export const AdminQuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="h-4 w-4 text-accent-foreground" />
          </div>
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {quickActions.map((action) => (
            <button
              key={action?.path}
              onClick={() => navigate(action?.path)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
            >
              <div
                className={`h-9 w-9 rounded-lg ${action?.iconBg} flex items-center justify-center shrink-0`}
              >
                <action.icon className={`h-4 w-4 ${action?.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {action?.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action?.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
