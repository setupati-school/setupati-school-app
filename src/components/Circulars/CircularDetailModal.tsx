import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Circular } from '@/types/schoolStoreType';
import { Calendar, User, Users, Clock } from 'lucide-react';

interface CircularDetailModalProps {
  circular: Circular | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getTargetGroupColor = (group: string) => {
  switch (group.toLowerCase()) {
    case 'all':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'students':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'teachers':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'parents':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const isExpired = (validUntil: string): boolean => {
  return new Date(validUntil) < new Date();
};

export const CircularDetailModal: React.FC<CircularDetailModalProps> = ({
  circular,
  open,
  onOpenChange
}) => {
  if (!circular) return null;

  const expired = isExpired(circular.valid_until);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl font-semibold pr-8">
              {circular.title}
            </DialogTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge
              variant="outline"
              className={getTargetGroupColor(circular.targeted_group)}
            >
              <Users className="h-3 w-3 mr-1" />
              {circular.targeted_group}
            </Badge>
            {expired ? (
              <Badge variant="destructive">Expired</Badge>
            ) : (
              <Badge variant="secondary">Active</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <DialogDescription className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
            {circular.description}
          </DialogDescription>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Issued By</span>
              </div>
              <p className="text-sm font-medium">{circular.issued_by}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Issue Date</span>
              </div>
              <p className="text-sm font-medium">
                {new Date(circular.issued_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Valid Until</span>
              </div>
              <p
                className={`text-sm font-medium ${expired ? 'text-destructive' : ''}`}
              >
                {new Date(circular.valid_until).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Target Audience</span>
              </div>
              <p className="text-sm font-medium">{circular.targeted_group}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CircularDetailModal;
