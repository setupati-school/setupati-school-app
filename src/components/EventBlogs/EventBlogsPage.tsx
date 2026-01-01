import React, { useState, useMemo } from 'react';
import { useMyEventBlogs, useEventBlogs } from '@/hooks/useEventBlogs';
import { useAuthStore } from '@/store/authStore';
import { CreateEventBlogForm } from './CreateEventBlogForm';
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axiosConfig';
import { firebaseErrorParser } from '@/lib/firebaseErrorParser';
import { EventBlog, EventCategory } from '@/types/schoolStoreType';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const categories: EventCategory[] = ['Sports', 'Academic', 'Cultural', 'Ceremony', 'Community', 'Other'];

const categoryColors: Record<EventCategory, string> = {
  Sports: 'bg-green-100 text-green-800',
  Academic: 'bg-blue-100 text-blue-800',
  Cultural: 'bg-purple-100 text-purple-800',
  Ceremony: 'bg-yellow-100 text-yellow-800',
  Community: 'bg-orange-100 text-orange-800',
  Other: 'bg-gray-100 text-gray-800'
};

export const EventBlogsPage: React.FC = () => {
  const { role } = useAuthStore();
  const isAdmin = role === 'admin';

  // Admin sees all blogs, teachers see only their own
  const { blogs: myBlogs, isLoading: myLoading, mutate: myMutate } = useMyEventBlogs();
  const { blogs: allBlogs, isLoading: allLoading, mutate: allMutate } = useEventBlogs();

  const blogs = isAdmin ? allBlogs : myBlogs;
  const isLoading = isAdmin ? allLoading : myLoading;
  const mutate = isAdmin ? allMutate : myMutate;

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<EventBlog | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || blog.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && blog.is_published) ||
        (statusFilter === 'draft' && !blog.is_published);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogs, searchTerm, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.is_published).length;
    const drafts = blogs.filter((b) => !b.is_published).length;
    return { total, published, drafts };
  }, [blogs]);

  const handleEdit = (blog: EventBlog) => {
    setEditingBlog(blog);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      await api.delete(`/event-blogs/delete/${deleteId}`);
      toast({
        title: 'Success',
        description: 'Event blog deleted successfully'
      });
      mutate();
    } catch (err) {
      const { message } = firebaseErrorParser(err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingBlog(null);
  };

  const handleSuccess = () => {
    mutate();
    handleFormClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Event Blogs</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all event blogs' : 'Manage your event blogs'}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Blog
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Blogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Blog Cards */}
      {filteredBlogs.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No blogs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first event blog to get started'}
          </p>
          {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Blog
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image Preview or Placeholder */}
              <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/40 relative">
                {blog.images && blog.images.length > 0 ? (
                  <img
                    src={blog.images[0]}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={categoryColors[blog.category]}>
                    {blog.category}
                  </Badge>
                  <Badge variant={blog.is_published ? 'default' : 'secondary'}>
                    {blog.is_published ? (
                      <><Eye className="h-3 w-3 mr-1" /> Published</>
                    ) : (
                      <><EyeOff className="h-3 w-3 mr-1" /> Draft</>
                    )}
                  </Badge>
                </div>
                {blog.images && blog.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    +{blog.images.length - 1} more
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                  {blog.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {blog.content}
                </p>

                <div className="flex items-center text-xs text-muted-foreground gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(blog.event_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {blog.author_name}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(blog)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(blog.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Form */}
      <CreateEventBlogForm
        open={formOpen}
        onOpenChange={handleFormClose}
        blog={editingBlog}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Blog</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event blog? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default EventBlogsPage;
