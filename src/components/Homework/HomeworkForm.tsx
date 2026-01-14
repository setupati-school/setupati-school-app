import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolStore } from '@/store/schoolStore';
import { toast } from '@/hooks/use-toast';

export type HomeworkItem = {
  id?: string;
  title?: string;
  description?: string;
  subject_id?: string;
  assigned_by?: string;
  due_date?: string;
  created_at?: string;
};

type Props = {
  initial?: HomeworkItem;
  onCancel?: () => void;
  onSave?: (h: HomeworkItem) => void;
  submitLabel?: string;
};

export const HomeworkForm: React.FC<Props> = ({ initial, onCancel, onSave, submitLabel = 'Save' }) => {
  // 
  const subjects = useSchoolStore((s) => s.subjects ?? []);
  const homework = useSchoolStore((s) => s.homework ?? []) as HomeworkItem[];
  const setHomework = useSchoolStore((s) => s.setHomework) as (h: HomeworkItem[]) => void;
  const currentUser = useSchoolStore((s) => s.currentUser);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [subjectId, setSubjectId] = useState<string>(initial?.subject_id ?? '');
  const [dueDate, setDueDate] = useState<string>(
    initial?.due_date ? new Date(initial.due_date).toISOString().slice(0, 10) : ''
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) {
      toast({ title: 'Validation', description: 'Title required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload: HomeworkItem = {
        id: initial?.id ?? `hw_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // assigned by firebase?
        title: title.trim(),
        description: description.trim() || undefined,
        subject_id: subjectId || undefined,
        assigned_by:
          currentUser ? `${currentUser.f_name ?? ''} ${currentUser.l_name ?? ''}`.trim() || undefined : undefined, // get user id ?
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        created_at: initial?.created_at ?? new Date().toISOString(),
      };

      const next = Array.isArray(homework) ? [...homework] : [];
      const idx = next.findIndex((x) => x.id === payload.id);
      if (idx >= 0) next[idx] = payload;
      else next.push(payload);

      setHomework(next);
      toast({ title: 'Saved', description: initial ? 'Homework updated' : 'Homework created', variant: 'success' });
      onSave?.(payload);
    } catch {
      toast({ title: 'Error', description: 'Failed to save homework', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{initial ? 'Edit Homework' : 'Create Homework'}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              className="w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Homework title"
              aria-label="Homework title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Select onValueChange={(v) => setSubjectId(v)} value={subjectId ?? ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <em className="text-muted-foreground">None</em>
                </SelectItem>
                {subjects.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name ?? s.title ?? s.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due date</label>
            <Input
              className="w-full"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Due date"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              className="w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the homework"
            />
          </div>

          <div className="flex items-center justify-end gap-2 sm:col-span-2">
            <Button variant="ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HomeworkForm;