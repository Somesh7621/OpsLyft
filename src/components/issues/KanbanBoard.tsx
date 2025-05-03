import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Issue, Status, updateIssueStatus } from '@/store/issuesSlice';
import { KanbanColumn } from './KanbanColumn';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addActivityLog } from '@/store/issuesSlice';
import { useUser } from '@clerk/clerk-react';
import { v4 as uuidv4 } from 'uuid';

interface KanbanBoardProps {
  openIssues: Issue[];
  inProgressIssues: Issue[];
  doneIssues: Issue[];
  projectId: string;
}

export const KanbanBoard = ({
  openIssues,
  inProgressIssues,
  doneIssues,
  projectId,
}: KanbanBoardProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issueId = active.id as string;
    
    const allIssues = [...openIssues, ...inProgressIssues, ...doneIssues];
    const issue = allIssues.find((i) => i.id === issueId);
    
    if (issue) {
      setActiveIssue(issue);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const issueId = active.id as string;
    const newStatus = over.id as Status;
    
    const allIssues = [...openIssues, ...inProgressIssues, ...doneIssues];
    const issue = allIssues.find((i) => i.id === issueId);
    
    if (issue && issue.status !== newStatus) {
      dispatch(updateIssueStatus({ issueId, status: newStatus }));
      
      // Log the activity
      if (user) {
        dispatch(addActivityLog({
          id: uuidv4(),
          issueId,
          userId: user.id,
          action: `changed status from ${issue.status} to ${newStatus}`,
          timestamp: new Date().toISOString(),
        }));
      }
      
      toast({
        title: "Issue Updated",
        description: `Issue moved to ${newStatus}`,
      });
    }
    
    setActiveIssue(null);
  };

  const handleCardClick = (issue: Issue) => {
    navigate(`/projects/${projectId}/issues/${issue.id}`);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn
          title="Open"
          issues={openIssues}
          status="Open"
          onCardClick={handleCardClick}
        />
        <KanbanColumn
          title="In Progress"
          issues={inProgressIssues}
          status="In Progress"
          onCardClick={handleCardClick}
        />
        <KanbanColumn
          title="Done"
          issues={doneIssues}
          status="Done"
          onCardClick={handleCardClick}
        />
      </div>
      <DragOverlay>
        {activeIssue && (
          <div className="p-4 bg-white shadow-lg rounded-md border border-primary w-[300px]">
            <h3 className="font-medium line-clamp-2">{activeIssue.title}</h3>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
