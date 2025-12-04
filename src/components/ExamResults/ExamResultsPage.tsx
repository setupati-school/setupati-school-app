import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axiosConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store/authStore';
import { useSchoolStore } from '@/store/schoolStore';
import { useToast } from '@/hooks/use-toast';
import { CreateExamResultForm } from './CreateExamResultForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate } from '@/lib/utils';
import {
  Award,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  FileText
} from 'lucide-react';
import { firebaseErrorParser } from '../../lib/firebaseErrorParser';

interface ExamResultData {
  id: string;
  student_id: string;
  exam_id: string;
  exam_result: {
    [key: string]: number | string;
    total: number;
    pass_or_fail: string;
  };
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  id: string;
  examResult: ExamResultData | null;
}

type FilterStatus = 'all' | 'pass' | 'fail';

export const ExamResultsPage: React.FC = () => {
  const { toast } = useToast();
  const { role } = useAuthStore();
  const { subjects, setSubjects } = useSchoolStore();

  const isAdmin = role === 'admin';

  const [results, setResults] = useState<ExamResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const [selectedResult, setSelectedResult] = useState<ExamResultData | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ExamResultData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<ExamResultData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create a map of subject_id to subject_name
  const subjectNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    subjects.forEach((subject) => {
      // Map by id
      if (subject.id) {
        map[subject.id] = subject?.subject_name;
        map[`subject_${subject.id}`] = subject?.subject_name;
      }
      // Map by subject_id field if available
      if (subject.subject_id) {
        map[subject.subject_id] = subject?.subject_name;
        map[`subject_${subject.subject_id}`] = subject?.subject_name;
      }
    });
    return map;
  }, [subjects]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/all');
      const data = response?.data || [];
      // Handle different response formats
      const subjectList = Array.isArray(data)
        ? data.map((item: { id: string; subject: { subject_name: string; subject_id?: string } }) => ({
            id: item.id,
            subject_name: item.subject?.subject_name || 'any',
            subject_id: item.subject?.subject_id || item.id,
            ...item.subject
          }))
        : [];
      setSubjects(subjectList);
    } catch (error: any) {
       const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message,
      });
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await api.get('/examresults/all');
      const data: ApiResponse[] = response?.data || [];
      const examResults = data
        .filter((item) => item.examResult !== null)
        .map((item) => ({ ...item.examResult!, id: item.id }));
      setResults(examResults);
    } catch (error: any) {
       const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message,
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchResults();
  }, []);

  const filteredResults = useMemo(() => {
    return results
      .filter((result) => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            result?.student_id?.toLowerCase().includes(query) ||
            result?.exam_id?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        if (filterStatus !== 'all') {
          const isPassed = result?.exam_result?.pass_or_fail?.toLowerCase() === 'pass';
          if (filterStatus === 'pass' && !isPassed) return false;
          if (filterStatus === 'fail' && isPassed) return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b?.created_at).getTime() - new Date(a?.created_at).getTime()
      );
  }, [results, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = results.length;
    const passed = results.filter(
      (r) => r?.exam_result?.pass_or_fail?.toLowerCase() === 'pass'
    ).length;
    const failed = results.filter(
      (r) => r?.exam_result?.pass_or_fail?.toLowerCase() === 'fail'
    ).length;
    return { total, passed, failed };
  }, [results]);

  const handleView = (result: ExamResultData) => {
    setSelectedResult(result);
    setViewModalOpen(true);
  };

  const handleEdit = (result: ExamResultData) => {
    setEditingResult(result);
    setCreateModalOpen(true);
  };

  const handleDeleteClick = (result: ExamResultData) => {
    setResultToDelete(result);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resultToDelete) return;

    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete exam results',
        variant: 'destructive'
      });
      setDeleteDialogOpen(false);
      return;
    }

    setDeleting(true);

    try {
      await api.delete(`/examresults/delete/${resultToDelete?.exam_id}`);
      toast({
        title: 'Success',
        description: 'Exam result deleted successfully'
      });
      fetchResults();
    } catch (error: any) {
     const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message,
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setResultToDelete(null);
    }
  };

  const handleCreateSuccess = () => {
    setEditingResult(null);
    fetchResults();
  };

  const handleCreateModalClose = (open: boolean) => {
    setCreateModalOpen(open);
    if (!open) {
      setEditingResult(null);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Exam Results Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage student exam results
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchResults}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {isAdmin && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Result
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.total}</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats?.passed}</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats?.failed}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student ID or exam ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as FilterStatus)}
              >
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pass">Passed</SelectItem>
                  <SelectItem value="fail">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredResults.length > 0 ? (
        <Card className="shadow-soft">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Student ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Exam ID
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => {
                    const isPassed =
                      result?.exam_result?.pass_or_fail?.toLowerCase() === 'pass';
                    return (
                      <tr
                        key={result.id}
                        className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">
                          {result.student_id}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {result.exam_id}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {result.exam_result?.total}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={isPassed ? 'secondary' : 'destructive'}
                            className={
                              isPassed
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : ''
                            }
                          >
                            {isPassed ? 'PASS' : 'FAIL'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {formatDate(result.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(result)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(result)}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(result)}
                                  title="Delete"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="py-12">
            <div className="text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Exam Results Found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || filterStatus !== 'all'
                  ? 'No results match your current filters. Try adjusting your search criteria.'
                  : 'There are no exam results available yet.'}
              </p>
              {isAdmin && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Result
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(searchQuery || filterStatus !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setSearchQuery('')}
            >
              Search: {searchQuery} ×
            </Badge>
          )}
          {filterStatus !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setFilterStatus('all')}
            >
              Status: {filterStatus} ×
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* View Modal */}
      <AlertDialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Exam Result Details
            </AlertDialogTitle>
          </AlertDialogHeader>

          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Student ID:</span>
                  <p className="font-medium">{selectedResult.student_id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Exam ID:</span>
                  <p className="font-medium">{selectedResult.exam_id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{formatDate(selectedResult.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated:</span>
                  <p className="font-medium">{formatDate(selectedResult.updated_at)}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left py-2 px-3">Subject</th>
                      <th className="text-right py-2 px-3">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSubjectEntries(selectedResult.exam_result).map(([key, marks]) => (
                      <tr key={key} className="border-b last:border-b-0">
                        <td className="py-2 px-3">{formatSubjectName(key)}</td>
                        <td className="py-2 px-3 text-right font-medium">{marks as number}</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30 font-semibold">
                      <td className="py-2 px-3">Total</td>
                      <td className="py-2 px-3 text-right">{selectedResult.exam_result.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center">
                <Badge
                  variant={selectedResult.exam_result.pass_or_fail === 'pass' ? 'secondary' : 'destructive'}
                  className={`text-lg px-4 py-1 ${
                    selectedResult.exam_result.pass_or_fail === 'pass'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : ''
                  }`}
                >
                  {selectedResult.exam_result.pass_or_fail?.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit Modal */}
      <CreateExamResultForm
        open={createModalOpen}
        onOpenChange={handleCreateModalClose}
        examResult={editingResult}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam Result</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the result for student &quot;
              {resultToDelete?.student_id}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamResultsPage;
