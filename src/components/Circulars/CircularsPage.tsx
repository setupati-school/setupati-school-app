import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
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
import { useSchoolStore } from '@/store/schoolStore';
import { useAuthStore } from '@/store/authStore';
import { Circular } from '@/types/schoolStoreType';
import { BACKEND_URL } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CircularCard } from './CircularCard';
import { CircularDetailModal } from './CircularDetailModal';
import { CreateCircularForm } from './CreateCircularForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Bell,
  Users,
  Calendar
} from 'lucide-react';

type FilterGroup = 'all' | 'All' | 'Students' | 'Teachers' | 'Parents';
type FilterStatus = 'all' | 'active' | 'expired';

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export const CircularsPage: React.FC = () => {
  const { toast } = useToast();
  const { circulars, setCirculars } = useSchoolStore();
  const { role } = useAuthStore();

  const isAdmin = role === 'admin';

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<FilterGroup>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Modal states
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(
    null
  );
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCircular, setEditingCircular] = useState<Circular | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [circularToDelete, setCircularToDelete] = useState<Circular | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // Fetch all circulars using axios
  const fetchCirculars = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${BACKEND_URL}/circulars/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      console.log('Circulars response:', response.data);

      // Handle response format
      const data = response.data?.circulars || response.data || [];
      setCirculars(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching circulars:', error);
      toast({
        title: 'Error',
        description: 'Failed to load circulars',
        variant: 'destructive'
      });
      setCirculars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isExpired = (validUntil: string): boolean => {
    return new Date(validUntil) < new Date();
  };

  const filteredCirculars = useMemo(() => {
    return circulars
      .filter((circular) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            circular.title?.toLowerCase().includes(query) ||
            circular.description?.toLowerCase().includes(query) ||
            circular.issued_by?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        // Group filter
        if (filterGroup !== 'all') {
          if (circular.targeted_group !== filterGroup) return false;
        }

        // Status filter
        if (filterStatus !== 'all') {
          const expired = isExpired(circular.valid_until);
          if (filterStatus === 'active' && expired) return false;
          if (filterStatus === 'expired' && !expired) return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.issued_date).getTime() - new Date(a.issued_date).getTime()
      );
  }, [circulars, searchQuery, filterGroup, filterStatus]);

  const stats = useMemo(() => {
    const total = circulars.length;
    const active = circulars.filter((c) => !isExpired(c.valid_until)).length;
    const expired = circulars.filter((c) => isExpired(c.valid_until)).length;
    return { total, active, expired };
  }, [circulars]);

  const handleView = (circular: Circular) => {
    setSelectedCircular(circular);
    setViewModalOpen(true);
  };

  const handleEdit = (circular: Circular) => {
    setEditingCircular(circular);
    setCreateModalOpen(true);
  };

  const handleDeleteClick = (circular: Circular) => {
    setCircularToDelete(circular);
    setDeleteDialogOpen(true);
  };

  // Delete circular using axios
  const handleDeleteConfirm = async () => {
    if (!circularToDelete) return;
    setDeleting(true);

    try {
      const token = await getAuthToken();
      await axios.delete(
        `${BACKEND_URL}/circulars/delete/${circularToDelete.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        }
      );

      console.log('Circular deleted:', circularToDelete.id);
      toast({
        title: 'Success',
        description: 'Circular deleted successfully'
      });

      // Refresh the list
      fetchCirculars();
    } catch (error) {
      console.error('Error deleting circular:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete circular',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setCircularToDelete(null);
    }
  };

  const handleCreateSuccess = () => {
    setEditingCircular(null);
    fetchCirculars();
  };

  const handleCreateModalClose = (open: boolean) => {
    setCreateModalOpen(open);
    if (!open) {
      setEditingCircular(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Circulars & Announcements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage school circulars and announcements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchCirculars}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {isAdmin && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Circular
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Total Circulars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-500" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search circulars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterGroup}
                onValueChange={(v) => setFilterGroup(v as FilterGroup)}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="All">General</SelectItem>
                  <SelectItem value="Students">Students</SelectItem>
                  <SelectItem value="Teachers">Teachers</SelectItem>
                  <SelectItem value="Parents">Parents</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as FilterStatus)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circulars List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredCirculars.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCirculars.map((circular) => (
            <CircularCard
              key={circular.id}
              circular={circular}
              isAdmin={isAdmin}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Circulars Found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || filterGroup !== 'all' || filterStatus !== 'all'
                  ? 'No circulars match your current filters. Try adjusting your search criteria.'
                  : 'There are no circulars available at the moment.'}
              </p>
              {isAdmin && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Circular
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active filter badges */}
      {(searchQuery || filterGroup !== 'all' || filterStatus !== 'all') && (
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
          {filterGroup !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setFilterGroup('all')}
            >
              Group: {filterGroup} ×
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
              setFilterGroup('all');
              setFilterStatus('all');
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* View Modal */}
      <CircularDetailModal
        circular={selectedCircular}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {/* Create/Edit Modal */}
      <CreateCircularForm
        open={createModalOpen}
        onOpenChange={handleCreateModalClose}
        circular={editingCircular}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Circular</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{circularToDelete?.title}
              &quot;? This action cannot be undone.
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

export default CircularsPage;
