import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Award, Calendar, User, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { firebaseErrorParser } from '../../lib/firebaseErrorParser';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axiosConfig';

interface ExamResultData {
  created_at: string;
  updated_at: string;
  exam_id: string;
  student_id: string;
  exam_result: {
    [key: string]: number | string;
    total: number;
    pass_or_fail: string;
  };
}

interface ApiResponse {
  id: string;
  examResult: ExamResultData;
}

interface SubjectData {
  id: string;
  subject_id?: string;
  subject_name: string;
}

export const StudentResultLookup: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [results, setResults] = useState<ExamResultData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  // Create a map of subject_id to subject_name
  const subjectNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    subjects.forEach((subject) => {
      if (subject?.id) {
        map[subject?.id] = subject?.subject_name;
        map[`subject_${subject?.id}`] = subject?.subject_name;
      }
      if (subject?.subject_id) {
        map[subject?.subject_id] = subject?.subject_name;
        map[`subject_${subject?.subject_id}`] = subject?.subject_name;
      }
    });
    return map;
  }, [subjects]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get<any>('/subjects/all');
      
        const data = response?.data;
        const subjectList = Array.isArray(data)
          ? data.map((item: { id: string; subject?: { subject_name: string; subject_id?: string } }) => ({
              id: item.id,
              subject_name: item.subject?.subject_name || 'Unknown',
              subject_id: item.subject?.subject_id || item.id
            }))
          : [];
      
        setSubjects(subjectList);
      } catch ( error: any) {
        const { message } = firebaseErrorParser(error);
        toast({
          title: 'Error',
          description: message,
        });
      }
    };
    fetchSubjects();
  }, []);

const handleSearch = async () => {
  if (!studentId.trim()) {
    setError('Please enter a Student ID');
    return;
  }

  setLoading(true);
  setError(null);
  setSearched(true);

  try {
    const response = await api.get<ApiResponse[]>(
      `/examresults/student/${encodeURIComponent(studentId.trim())}`
    );

    const data = response.data;
    const examResults = data
      .filter((item) => item?.examResult !== null)
      .map((item) => item?.examResult);
    
    setResults(examResults);
  } catch (err) {
      const { message } = firebaseErrorParser(err);
      toast({
        title: 'Error',
        description: message,
      });
      setError('Failed to fetch results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSubjectEntries = (examResult: ExamResultData['exam_result']) => {
    return Object.entries(examResult).filter(
      ([key]) => key.startsWith('subject_') && typeof examResult[key] === 'number'
    );
  };

  const formatSubjectName = (key: string) => {
    // First try to get the name from the subject map
    if (subjectNameMap[key]) {
      return subjectNameMap[key];
    }

    // Try without the subject_ prefix
    const keyWithoutPrefix = key.replace('subject_', '');
    if (subjectNameMap[keyWithoutPrefix]) {
      return subjectNameMap[keyWithoutPrefix];
    }

    // Fallback: format the key nicely
    return key
      .replace('subject_', '')
      .replace(/_/g, ' ')
      .replace(/\d+$/, '')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-soft">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Award className="h-7 w-7 text-primary" />
              Student Result Dashboard
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your Student ID to view your exam results
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Student ID (e.g., student_priya_01)"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">{error}</div>
            )}
          </CardContent>
        </Card>

        {searched && !loading && (
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Exam Results
                {results.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {results.length} result{results.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No exam results found for this Student ID.</p>
                  <p className="text-sm mt-1">
                    Please check the ID and try again.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => {
                    const subjects = getSubjectEntries(result?.exam_result);
                    const isPassed =
                      result?.exam_result?.pass_or_fail?.toLowerCase() === 'pass';

                    return (
                      <details
                        key={result?.exam_id + index}
                        className="group border rounded-lg overflow-hidden"
                        open={index === 0}
                      >
                        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">
                              {result?.exam_id
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(result?.created_at)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-lg font-bold text-foreground">
                                {result?.exam_result?.total}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total Marks
                              </div>
                            </div>
                            <Badge
                              variant={isPassed ? 'secondary' : 'destructive'}
                              className={`text-sm ${isPassed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}`}
                            >
                              {isPassed ? 'PASS' : 'FAIL'}
                            </Badge>
                          </div>
                        </summary>

                        <div className="p-4 border-t bg-background">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                                    Subject
                                  </th>
                                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                                    Marks Obtained
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {subjects.map(([key, marks]) => (
                                  <tr
                                    key={key}
                                    className="border-b last:border-b-0"
                                  >
                                    <td className="py-2 px-3">
                                      {formatSubjectName(key)}
                                    </td>
                                    <td className="py-2 px-3 text-right font-medium">
                                      {marks as number}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-muted/30 font-semibold">
                                  <td className="py-2 px-3">Total</td>
                                  <td className="py-2 px-3 text-right">
                                    {result?.exam_result?.total}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex justify-between">
                            <span>Student ID: {result?.student_id}</span>
                            <span>Last Updated: {formatDate(result?.updated_at)}</span>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentResultLookup;
