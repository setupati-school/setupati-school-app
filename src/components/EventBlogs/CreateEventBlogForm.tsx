import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/axiosConfig';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { firebaseErrorParser } from '@/lib/firebaseErrorParser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/text-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { EventBlog } from '@/types/schoolStoreType';
import { Loader2, Plus, X, Image as ImageIcon } from 'lucide-react';
import { eventBlogSchema } from '@/components/zod';
import { useSchoolStore } from '@/store/schoolStore';

type EventBlogFormData = z.infer<typeof eventBlogSchema>;

interface CreateEventBlogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: EventBlog | null;
  onSuccess: () => void;
}

export const CreateEventBlogForm: React.FC<CreateEventBlogFormProps> = ({
  open,
  onOpenChange,
  blog,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const { currentUser } = useSchoolStore();
  const isEditing = !!blog;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<EventBlogFormData>({
    resolver: zodResolver(eventBlogSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'Other',
      event_date: new Date().toISOString().split('T')[0],
      author_name: '',
      images: [],
      is_published: true
    }
  });

  useEffect(() => {
    if (blog) {
      reset({
        title: blog?.title,
        content: blog?.content,
        category: blog?.category,
        event_date: blog?.event_date?.split('T')[0],
        author_name: blog?.author_name,
        images: blog?.images || [],
        is_published: blog?.is_published ?? true
      });
      setImages(blog?.images || []);
    } else {
      // Get current user's name for author
      const authorName = currentUser?.name || '';
      reset({
        title: '',
        content: '',
        category: 'Other',
        event_date: new Date().toISOString().split('T')[0],
        author_name: authorName,
        images: [],
        is_published: true
      });
      setImages([]);
    }
  }, [blog, reset, open, currentUser]);

  const addImage = () => {
    if (imageUrl && images.length < 10) {
      try {
        new URL(imageUrl); // Validate URL
        const newImages = [...images, imageUrl];
        setImages(newImages);
        setValue('images', newImages);
        setImageUrl('');
      } catch {
        toast({
          title: 'Error',
          description: 'Please enter a valid URL',
          variant: 'destructive'
        });
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue('images', newImages);
  };

  const onSubmit: SubmitHandler<EventBlogFormData> = async (data) => {
    if (loading) return;
    setLoading(true);

    try {
      const payload = {
        ...data,
        event_date: new Date(data?.event_date).toISOString(),
        images: images
      };

      if (isEditing && blog) {
        await api.put(`/event-blogs/update/${blog?.id}`, payload);
        toast({
          title: 'Success',
          description: 'Event blog updated successfully'
        });
      } else {
        await api.post('/event-blogs/create', payload);
        toast({
          title: 'Success',
          description: 'Event blog created successfully'
        });
      }

      reset();
      setImages([]);
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const { message } = firebaseErrorParser(err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Event Blog' : 'Create New Event Blog'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              {...register('title')}
            />
            {errors?.title && (
              <p className="text-sm text-destructive">{errors?.title?.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write about the event..."
              className="min-h-[150px]"
              {...register('content')}
            />
            {errors?.content && (
              <p className="text-sm text-destructive">
                {errors?.content?.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author_name">Author Name *</Label>
              <Input
                id="author_name"
                placeholder="Your name"
                {...register('author_name')}
              />
              {errors?.author_name && (
                <p className="text-sm text-destructive">
                  {errors?.author_name?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Ceremony">Ceremony</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.category && (
                <p className="text-sm text-destructive">
                  {errors?.category?.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input id="event_date" type="date" {...register('event_date')} />
              {errors?.event_date && (
                <p className="text-sm text-destructive">
                  {errors?.event_date?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Publish Status</Label>
              <Controller
                control={control}
                name="is_published"
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={field.value ? 'true' : 'false'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Published</SelectItem>
                      <SelectItem value="false">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Image URLs Section */}
          <div className="space-y-3">
            <Label>Images (Optional - max 10)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={images.length >= 10}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addImage}
                disabled={images.length >= 10 || !imageUrl}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span className="max-w-[150px] truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Blog' : 'Create Blog'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventBlogForm;
