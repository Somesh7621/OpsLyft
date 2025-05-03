
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Issue, Priority, Status } from '@/store/issuesSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowLeft, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const ProjectIssuesList = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const project = useSelector((state: RootState) => 
    state.projects.projects.find(p => p.id === projectId)
  );
  
  const issues = useSelector((state: RootState) => 
    state.issues.issues.filter(issue => issue.projectId === projectId)
  );

  const [filteredIssues, setFilteredIssues] = useState<Issue[]>(issues);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');

  useEffect(() => {
    if (!project) {
      toast({
        title: "Project not found",
        description: "The requested project could not be found.",
        variant: "destructive"
      });
      navigate('/projects');
    }
    
    let result = [...issues];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(issue => issue.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'All') {
      result = result.filter(issue => issue.priority === priorityFilter);
    }
    
    setFilteredIssues(result);
  }, [project, issues, searchTerm, statusFilter, priorityFilter, navigate, toast]);

  const getStatusBadgeClass = (status: Status) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-in-progress';
      case 'Done':
        return 'status-done';
      default:
        return '';
    }
  };

  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return '';
    }
  };

  if (!project) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}: Issues</h1>
          </div>
          <Button onClick={() => navigate(`/projects/${projectId}/issues/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            New Issue
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <Input 
              placeholder="Search issues..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status | 'All')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Priority | 'All')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[120px]">Assigned To</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow
                  key={issue.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)}
                >
                  <TableCell className="font-medium">{issue.title}</TableCell>
                  <TableCell>
                    <Badge className={cn("status-badge", getStatusBadgeClass(issue.status))}>
                      {issue.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("status-badge", getPriorityBadgeClass(issue.priority))}>
                      {issue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {issue.assignedTo ? (
                      <div className="flex items-center gap-2">
                        {issue.assignedTo.imageUrl ? (
                          <Avatar className="h-6 w-6">
                            <img src={issue.assignedTo.imageUrl} alt={issue.assignedTo.name} />
                          </Avatar>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                            {issue.assignedTo.name.charAt(0)}
                          </div>
                        )}
                        <span className="truncate max-w-[100px]">{issue.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <UserRound className="h-3 w-3" />
                        <span>Unassigned</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {issue.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {issue.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{issue.tags.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(issue.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {filteredIssues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All'
                      ? "No issues match your filters"
                      : "No issues have been created yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProjectIssuesList;
