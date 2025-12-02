import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Circular } from '@/types/schoolStoreType';
import { Calendar, User, Users, Eye, Pencil, Trash2 } from 'lucide-react';
import { isExpired,getTargetGroupColor } from '../../lib/utils';

interface CircularCardProps {
  circular: Circular;
  isAdmin?: boolean;
  onView: (circular: Circular) => void;
  onEdit?: (circular: Circular) => void;
  onDelete?: (circular: Circular) => void;
}

export const CircularCard: React.FC<CircularCardProps> = ({
  circular,
  isAdmin = false,
  onView,
  onEdit,
  onDelete
}) => {
  const expired = isExpired(circular?.valid_until || '');

  return (
    <Card
      className={`shadow-soft hover:shadow-medium transition-shadow cursor-pointer ${
        expired ? 'opacity-60' : ''
      }`}
      onClick={() => onView(circular)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-2 flex-1">
            {circular?.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={`shrink-0 ${getTargetGroupColor(circular?.targeted_group)}`}
          >
            <Users className="h-3 w-3 mr-1" />
            {circular?.targeted_group}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {circular?.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{circular?.issued_by}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(circular?.issued_date || '').toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            {expired ? (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Valid until {new Date(circular?.valid_until || '').toLocaleDateString()}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onView(circular);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {isAdmin && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(circular);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(circular);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CircularCard;
