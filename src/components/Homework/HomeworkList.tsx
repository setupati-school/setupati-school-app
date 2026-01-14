import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSchoolStore } from '@/store/schoolStore';
import { formatDate } from '../../lib/utils';
import HomeworkForm, { HomeworkItem } from './HomeworkForm'; // should move to a common place

export const HomeworkList: React.FC = () => {
  const homework = useSchoolStore((s) => s.homework ?? []) as HomeworkItem[];
  const subjects = useSchoolStore((s) => s.subjects ?? []);
  const loading = useSchoolStore((s) => s.loading);
  const currentUser = useSchoolStore((s) => s.currentUser);

  const [editingId, setEditingId] = useState<string | null>(null);

  const subjectName = (id?: string) =>
    subjects.find((subject: any) => subject.id === id)?.name ?? id ?? 'General';

  const items = [...(homework ?? [])].sort((a, b) => {
    const da = a.due_date ?? a.created_at ?? '';
    const db = b.due_date ?? b.created_at ?? '';
    return da.localeCompare(db);
  });

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.isTeacher;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{isTeacher ? 'Assigned' : 'My'} Homework</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading homework...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No homework assigned.</p>
        ) : (
          <div className="space-y-4">
            {items.map((hw) => (
              <div key={hw.id ?? hw.title} className="border rounded-md p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{hw.title ?? 'Untitled'}</h3>
                      <Badge className="text-xs">{subjectName(hw.subject_id)}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span>Assigned: {formatDate(hw.created_at)}</span>
                      {hw.due_date && <span className="ml-3">Due: {formatDate(hw.due_date)}</span>}
                      {hw.assigned_by && <span className="ml-3">By: {hw.assigned_by}</span>}
                    </div>
                  </div>

                  {isTeacher && (
                    <div className="ml-3">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(hw.id ?? null)}>
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                {editingId === hw.id ? (
                  <div className="mt-3">
                    <HomeworkForm
                      initial={hw}
                      onCancel={() => setEditingId(null)}
                      onSave={() => setEditingId(null)}
                      submitLabel="Update"
                    />
                  </div>
                ) : (
                  hw.description && (
                    <div className="text-sm text-muted-foreground mt-3 whitespace-pre-line">{hw.description}</div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeworkList;