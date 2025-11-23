import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar } from 'lucide-react';
import { useSchoolStore } from '@/store/schoolStore';
import { formatDate } from '../../lib/utils';
import { ExamResult, SubjectMark } from '../../types/type';

export const StudentExamResults: React.FC = () => {
  const { getMyResults } = useSchoolStore();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  const calcTotals = (subjects: SubjectMark[]) => {
    const totalMarks = subjects.reduce((s, x) => s + (Number(x.marks) || 0), 0);
    const totalMax = subjects.reduce(
      (s, x) => s + (Number(x.maxMarks ?? 0) || 0),
      0
    );
    const pct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
    return { totalMarks, totalMax, pct };
  };

  const gradeFor = (pct: number) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const raw = getMyResults ? getMyResults() : [];
        const data = raw instanceof Promise ? await raw : raw;

        if (!mounted) return;

        const normalized: ExamResult[] = (Array.isArray(data) ? data : []).map(
          (e) => {
            const subjects: SubjectMark[] = Array.isArray(e.subjects)
              ? e.subjects.map((s) => ({
                  subject:
                    typeof s === 'string'
                      ? s
                      : (s.subject ??
                        s.name ??
                        s.subject_name ??
                        s.subject_id ??
                        'Unknown'),
                  marks: Number(s.marks ?? 0),
                  maxMarks: s.maxMarks ?? s.max_marks ?? undefined,
                  remark: s.remark ?? s.pass_or_fail
                }))
              : [];

            return {
              id: e.id ?? e.exam_id,
              title: e.title ?? e.name ?? `Exam ${e.id ?? e.exam_id ?? ''}`,
              date: e.date ?? e.created_at,
              subjects,
              note: e.note
            } as ExamResult;
          }
        );

        setResults(normalized);
      } catch {
        if (mounted) setResults([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [getMyResults]);

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Exam Results</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Loading results...
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No exam results available.
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((exam) => {
                const { totalMarks, totalMax, pct } = calcTotals(exam.subjects);
                return (
                  <details
                    key={exam.id ?? exam.title}
                    className="group border rounded-md"
                  >
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer">
                      <div>
                        <div className="text-sm font-semibold text-foreground truncate">
                          {exam.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(exam.date)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground">
                            {totalMarks} / {totalMax > 0 ? totalMax : '—'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pct}%
                          </div>
                        </div>
                        <Badge
                          variant={pct >= 50 ? 'secondary' : 'destructive'}
                          className="text-sm"
                        >
                          {gradeFor(pct)}
                        </Badge>
                      </div>
                    </summary>

                    <div className="px-4 pb-4 pt-2">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left text-xs text-muted-foreground pb-2">
                                Subject
                              </th>
                              <th className="text-right text-xs text-muted-foreground pb-2">
                                Marks
                              </th>
                              <th className="text-right text-xs text-muted-foreground pb-2">
                                Max
                              </th>
                              <th className="text-right text-xs text-muted-foreground pb-2">
                                %
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {exam.subjects.map((s, idx) => {
                              const m = Number(s.marks) || 0;
                              const mm = Number(s.maxMarks ?? 0) || 0;
                              const spct =
                                mm > 0 ? Math.round((m / mm) * 100) : 0;
                              return (
                                <tr
                                  key={String(s.subject) + idx}
                                  className="border-t"
                                >
                                  <td className="py-2 pr-4">{s.subject}</td>
                                  <td className="py-2 text-right">{m}</td>
                                  <td className="py-2 text-right">
                                    {mm > 0 ? mm : '—'}
                                  </td>
                                  <td className="py-2 text-right text-muted-foreground">
                                    {spct}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {exam.note && (
                        <div className="text-xs text-muted-foreground mt-3">
                          {exam.note}
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentExamResults;
