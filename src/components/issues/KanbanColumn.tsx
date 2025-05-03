import { useDroppable } from '@dnd-kit/core';
import { Issue, Status } from '@/store/issuesSlice';
import { IssueCard } from './IssueCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  issues: Issue[];
  status: Status;
  onCardClick: (issue: Issue) => void;
}

export const KanbanColumn = ({
  title,
  issues,
  status,
  onCardClick,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "kanban-column",
        isOver && "ring-2 ring-primary ring-opacity-50"
      )}
    >
      <h3 className="font-semibold mb-4 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs font-normal bg-muted text-muted-foreground px-2 py-1 rounded-full">
          {issues.length}
        </span>
      </h3>
      <div className="space-y-3">
        {issues.map((issue) => (
          <IssueCard 
            key={issue.id} 
            issue={issue} 
            onClick={() => onCardClick(issue)} 
          />
        ))}
        {issues.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm italic">
            No issues
          </div>
        )}
      </div>
    </div>
  );
};
