import { useEffect, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSchoolStore } from '@/store/schoolStore';
import { Award, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ExamResult, SubjectMark } from '@/types/type';
import {
  SummaryCard,
  CardHeaderWithIcon,
  LoadingState,
  EmptyState,
  PercentageDisplay
} from './shared';
import { calculateExamTotals, getGradeForPercentage } from '../../lib/utils';

export const ExamResultsSummary = () => {
  const navigate = useNavigate();
  const { getMyResults } = useSchoolStore();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

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
              ? e.subjects.map((s: SubjectMark) => ({
                  subject: typeof s === 'string' ? s : (s.subject ?? 'Unknown'),
                  marks: Number(s.marks ?? 0),
                  maxMarks: s.maxMarks ?? 100,
                  remark: s.remark
                }))
              : [];

            return {
              id: e.id,
              title: e.title ?? `Exam ${e.id ?? ''}`,
              date: e.date,
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

  const overallAverage =
    results?.length > 0
      ? Math.round(
          results?.reduce(
            (sum, exam) => sum + calculateExamTotals(exam?.subjects)?.pct,
            0
          ) / results?.length
        )
      : 0;

  const latestExam = results?.[0] ?? null;
  const latestPct = latestExam
    ? calculateExamTotals(latestExam?.subjects)?.pct ?? 0
    : 0;
  const latestGrade = getGradeForPercentage(latestPct);
  const overallGrade = getGradeForPercentage(overallAverage);

  return (
    <SummaryCard>
      <CardHeaderWithIcon
        icon={<Award className="h-4 w-4 text-primary" />}
        iconBgClass="bg-primary/10"
        title="Results"
        viewAllPath="/results"
      />
      <CardContent className="space-y-4">
        {loading ? (
          <LoadingState />
        ) : results?.length === 0 ? (
          <EmptyState
            icon={<Award className="h-10 w-10" />}
            message="No results yet"
          />
        ) : (
          <>
            <div className="text-center">
              <PercentageDisplay value={overallAverage} />
              <Badge variant={overallGrade?.variant} className="mt-1">
                Grade {overallGrade?.grade}
              </Badge>
            </div>

            <Progress value={overallAverage} className="h-2" />

            {latestExam && (
              <button
                onClick={() => navigate('/results')}
                className="w-full p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Latest Exam
                      </p>
                      <p className="text-sm font-medium truncate max-w-[140px]">
                        {latestExam.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={latestGrade?.variant} className="text-xs">
                      {latestPct}%
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </button>
            )}

            <p className="text-[10px] text-center text-muted-foreground pt-1">
              Average of {results?.length ?? 0} exam
              {(results?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </CardContent>
    </SummaryCard>
  );
};

export default ExamResultsSummary;
