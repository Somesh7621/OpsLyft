
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Issue, Status, Priority } from '@/store/issuesSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Search = () => {
  const navigate = useNavigate();
  const issues = useSelector((state: RootState) => state.issues.issues);
  const projects = useSelector((state: RootState) => state.projects.projects);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);

  useEffect(() => {
    let result = [...issues];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
    
    // Apply project filter
    if (projectFilter !== 'All') {
      result = result.filter(issue => issue.projectId === projectFilter);
    }
    
    setFilteredIssues(result);
  }, [issues, searchTerm, statusFilter, priorityFilter, projectFilter]);

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

  const getProjectNameById = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Search Issues</h1>

        <div className="flex items-center gap-4 rounded-md border p-4 mb-4">
          <SearchIcon className="h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by title, description, or tags..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

          <Select value={projectFilter} onValueChange={(value) => setProjectFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow
                  key={issue.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/projects/${issue.projectId}/issues/${issue.id}`)}
                >
                  <TableCell className="font-medium">{issue.title}</TableCell>
                  <TableCell>{getProjectNameById(issue.projectId)}</TableCell>
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
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <SearchIcon className="h-10 w-10 mb-2 opacity-20" />
                      {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || projectFilter !== 'All'
                        ? "No issues match your search criteria"
                        : "No issues have been created yet"}
                    </div>
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

export default Search;
