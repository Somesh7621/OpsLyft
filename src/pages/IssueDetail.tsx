import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useUser, useClerk } from '@clerk/clerk-react';
import { RootState } from '@/store';
import { Issue, Status, Priority, AssignedUser, addActivityLog, updateIssue, setCurrentIssue, assignIssue } from '@/store/issuesSlice';
import { Comment, addComment } from '@/store/commentsSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageSquare, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

// Default users to show if no organization members are available
const defaultUsers: AssignedUser[] = [
  { id: 'default-1', name: 'Sarah Johnson', email: 'sarah.j@example.com', imageUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 'default-2', name: 'Michael Chen', email: 'mchen@example.com', imageUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: 'default-3', name: 'Aisha Patel', email: 'apatel@example.com', imageUrl: 'https://i.pravatar.cc/150?img=3' },
  { id: 'default-4', name: 'Carlos Rodriguez', email: 'carlos.r@example.com', imageUrl: 'https://i.pravatar.cc/150?img=4' },
  { id: 'default-5', name: 'Emma Wilson', email: 'e.wilson@example.com', imageUrl: 'https://i.pravatar.cc/150?img=5' }
];

const IssueDetail = () => {
  const { projectId, issueId } = useParams<{ projectId: string; issueId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useUser();
  const clerk = useClerk();
  const { toast } = useToast();

  const project = useSelector((state: RootState) => 
    state.projects.projects.find(p => p.id === projectId)
  );
  
  const issue = useSelector((state: RootState) => 
    state.issues.issues.find(i => i.id === issueId)
  );
  
  const comments = useSelector((state: RootState) => 
    state.comments.comments.filter(c => c.issueId === issueId)
  );
  
  const activityLogs = useSelector((state: RootState) => 
    state.issues.activityLogs.filter(log => log.issueId === issueId)
  );

  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState<Status>(issue?.status || 'Open');
  const [priority, setPriority] = useState<Priority>(issue?.priority || 'Medium');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AssignedUser[]>([]);

  useEffect(() => {
    if (issue) {
      setStatus(issue.status);
      setPriority(issue.priority);
      dispatch(setCurrentIssue(issue));
    } else if (issueId && projectId) {
      toast({
        title: "Issue not found",
        description: "The requested issue could not be found.",
        variant: "destructive"
      });
      navigate(`/projects/${projectId}/issues`);
    }

    // Load available users from Clerk
    const loadUsers = async () => {
      if (clerk) {
        setIsLoadingUsers(true);
        try {
          // Fixed: Access the data property of the paginated response
          const response = await clerk.user.getOrganizationMemberships();
          const userList = response.data;
          
          // If we don't have organization members, create a list with default users
          // and add the current user if available
          let formattedUsers: AssignedUser[] = [];
          
          if (userList && userList.length > 0) {
            // Use organization members if available
            formattedUsers = userList.map(membership => ({
                id: membership.publicUserData.userId,
                name: membership.publicUserData.firstName && membership.publicUserData.lastName 
                  ? `${membership.publicUserData.firstName} ${membership.publicUserData.lastName}` 
                  : membership.publicUserData.identifier || 'Unknown User',
                email: membership.publicUserData.identifier || '',
                imageUrl: membership.publicUserData.imageUrl
            }));
          } else {
            // Use default users and add current user if available
            formattedUsers = [...defaultUsers];
            
            if (user) {
              formattedUsers.unshift({
                id: user.id,
                name: user.fullName || user.username || 'Current User',
                email: user.primaryEmailAddress?.emailAddress || '',
                imageUrl: user.imageUrl
              });
            }
          }
          
          setAvailableUsers(formattedUsers);
        } catch (error) {
          console.error("Error loading users:", error);
          
          // Fallback to default users if there's an error
          const formattedUsers = [...defaultUsers];
          if (user) {
            formattedUsers.unshift({
              id: user.id,
              name: user.fullName || user.username || 'Current User',
              email: user.primaryEmailAddress?.emailAddress || '',
              imageUrl: user.imageUrl
            });
          }
          setAvailableUsers(formattedUsers);
        } finally {
          setIsLoadingUsers(false);
        }
      } else {
        // No clerk instance, use default users
        setAvailableUsers(defaultUsers);
      }
    };

    loadUsers();
    
    return () => {
      dispatch(setCurrentIssue(null));
    };
  }, [issue, issueId, projectId, dispatch, navigate, toast, clerk, user]);

  if (!project || !issue) return null;

  const handleStatusChange = (newStatus: Status) => {
    const updatedIssue = {
      ...issue,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(updateIssue(updatedIssue));
    setStatus(newStatus);
    
    if (user) {
      dispatch(addActivityLog({
        id: uuidv4(),
        issueId: issue.id,
        userId: user.id,
        action: `changed status from ${issue.status} to ${newStatus}`,
        timestamp: new Date().toISOString(),
      }));
    }
    
    toast({
      title: "Status Updated",
      description: `Issue status changed to ${newStatus}`,
    });
  };

  const handlePriorityChange = (newPriority: Priority) => {
    const updatedIssue = {
      ...issue,
      priority: newPriority,
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(updateIssue(updatedIssue));
    setPriority(newPriority);
    
    if (user) {
      dispatch(addActivityLog({
        id: uuidv4(),
        issueId: issue.id,
        userId: user.id,
        action: `changed priority from ${issue.priority} to ${newPriority}`,
        timestamp: new Date().toISOString(),
      }));
    }
    
    toast({
      title: "Priority Updated",
      description: `Issue priority changed to ${newPriority}`,
    });
  };

  const handleAssignUser = (selectedUser: AssignedUser) => {
    const previousAssignee = issue.assignedTo?.name || 'no one';
    
    dispatch(assignIssue({ issueId: issue.id, user: selectedUser }));
    
    if (user) {
      dispatch(addActivityLog({
        id: uuidv4(),
        issueId: issue.id,
        userId: user.id,
        action: `assigned issue from ${previousAssignee} to ${selectedUser.name}`,
        timestamp: new Date().toISOString(),
      }));
    }
    
    toast({
      title: "Issue Assigned",
      description: `Issue assigned to ${selectedUser.name}`,
    });
  };

  const handleUnassignUser = () => {
    const previousAssignee = issue.assignedTo?.name || 'no one';
    
    dispatch(assignIssue({ issueId: issue.id, user: null }));
    
    if (user) {
      dispatch(addActivityLog({
        id: uuidv4(),
        issueId: issue.id,
        userId: user.id,
        action: `unassigned issue from ${previousAssignee}`,
        timestamp: new Date().toISOString(),
      }));
    }
    
    toast({
      title: "Issue Unassigned",
      description: "Issue is now unassigned",
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    
    const comment: Comment = {
      id: uuidv4(),
      issueId: issue.id,
      userId: user.id,
      userName: user.fullName || user.username || 'User',
      userImage: user.imageUrl,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    
    dispatch(addComment(comment));
    
    dispatch(addActivityLog({
      id: uuidv4(),
      issueId: issue.id,
      userId: user.id,
      action: 'added a comment',
      timestamp: new Date().toISOString(),
    }));
    
    setNewComment('');
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added successfully",
    });
  };

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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/projects/${projectId}/issues`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {project.name} / Issue
            </h3>
            <h1 className="text-2xl font-bold tracking-tight">{issue.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{issue.description || 'No description provided.'}</p>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  {issue.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Comments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{comment.userName}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="mb-2"
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Assigned To</label>
                  <div className="mt-2">
                    {issue.assignedTo ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {issue.assignedTo.imageUrl ? (
                            <Avatar className="h-8 w-8">
                              <img src={issue.assignedTo.imageUrl} alt={issue.assignedTo.name} />
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {issue.assignedTo.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{issue.assignedTo.name}</div>
                            <div className="text-xs text-muted-foreground">{issue.assignedTo.email}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleUnassignUser}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Issue
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {isLoadingUsers ? (
                            <DropdownMenuItem disabled>Loading users...</DropdownMenuItem>
                          ) : availableUsers.length > 0 ? (
                            availableUsers.map((user) => (
                              <DropdownMenuItem 
                                key={user.id}
                                onClick={() => handleAssignUser(user)}
                              >
                                <div className="flex items-center gap-2">
                                  {user.imageUrl ? (
                                    <Avatar className="h-6 w-6">
                                      <img src={user.imageUrl} alt={user.name} />
                                    </Avatar>
                                  ) : (
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                      {user.name.charAt(0)}
                                    </div>
                                  )}
                                  <span>{user.name}</span>
                                </div>
                              </DropdownMenuItem>
                            ))
                          ) : (
                            <DropdownMenuItem disabled>No users found</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={(value) => handleStatusChange(value as Status)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priority} onValueChange={(value) => handlePriorityChange(value as Priority)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-muted-foreground mt-1">
                    {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Last Updated</label>
                  <p className="text-muted-foreground mt-1">
                    {new Date(issue.updatedAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <p className="text-muted-foreground">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {[...activityLogs].sort((a, b) => 
                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    ).map((log) => (
                      <div key={log.id} className="text-sm">
                        <div className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div>User {log.action}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default IssueDetail;
