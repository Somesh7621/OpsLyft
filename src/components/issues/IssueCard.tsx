import { useDraggable } from '@dnd-kit/core';
import { Issue } from '@/store/issuesSlice';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserRound } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
}

export const IssueCard = ({ issue, onClick }: IssueCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  });

  const getStatusBadgeClass = (status: Issue['status']) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Done':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
    }
  };

  const getPriorityBadgeClass = (priority: Issue['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Medium':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'Low':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-card p-4 rounded-md border shadow-sm cursor-grab",
        isDragging && "shadow-md opacity-50"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="space-y-2">
        <h3 className="font-medium line-clamp-2">{issue.title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Badge className={cn("status-badge", getStatusBadgeClass(issue.status))}>
              {issue.status}
            </Badge>
            <Badge className={cn("priority-badge", getPriorityBadgeClass(issue.priority))}>
              {issue.priority}
            </Badge>
          </div>
        </div>
        {issue.assignedTo ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            {issue.assignedTo.imageUrl ? (
              <div className="h-5 w-5 rounded-full overflow-hidden">
                <img 
                  src={issue.assignedTo.imageUrl} 
                  alt={issue.assignedTo.name} 
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <UserRound className="h-4 w-4" />
            )}
            <span>{issue.assignedTo.name}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
