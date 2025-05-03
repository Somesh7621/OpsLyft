
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useUser, useClerk } from '@clerk/clerk-react';
import { RootState } from '@/store';
import { addIssue, Issue, AssignedUser, Status, Priority } from '@/store/issuesSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Tag, X, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Default users to show if no organization members are available
const defaultUsers: AssignedUser[] = [
  { id: 'default-1', name: 'Sarah Johnson', email: 'sarah.j@example.com', imageUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 'default-2', name: 'Michael Chen', email: 'mchen@example.com', imageUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: 'default-3', name: 'Aisha Patel', email: 'apatel@example.com', imageUrl: 'https://i.pravatar.cc/150?img=3' },
  { id: 'default-4', name: 'Carlos Rodriguez', email: 'carlos.r@example.com', imageUrl: 'https://i.pravatar.cc/150?img=4' },
  { id: 'default-5', name: 'Emma Wilson', email: 'e.wilson@example.com', imageUrl: 'https://i.pravatar.cc/150?img=5' }
];

const NewIssue = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useUser();
  const clerk = useClerk();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('Open');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [assignedTo, setAssignedTo] = useState<AssignedUser | null>(null);
  const project = useSelector((state: RootState) =>
    state.projects.projects.find(p => p.id === projectId)
  );

  const [availableUsers, setAvailableUsers] = useState<AssignedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (!projectId) {
      toast({
        title: "Project ID Missing",
        description: "Please select a project to create an issue.",
        variant: "destructive"
      });
      navigate('/projects');
    }
  }, [projectId, navigate, toast]);

  useEffect(() => {
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
  }, [clerk, user]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !projectId || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const newIssue: Issue = {
      id: uuidv4(),
      projectId: projectId,
      title: title.trim(),
      description: description.trim(),
      status: status,
      priority: priority,
      assignedTo: assignedTo,
      tags: tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addIssue(newIssue));
    toast({
      title: "Issue Created",
      description: "Your issue has been created successfully.",
    });
    navigate(`/projects/${projectId}/issues`);
  };

  const handleAssignUser = (selectedUser: AssignedUser) => {
    setAssignedTo(selectedUser);
  };

  const handleUnassignUser = () => {
    setAssignedTo(null);
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
              {project?.name} / New Issue
            </h3>
            <h1 className="text-2xl font-bold tracking-tight">Create Issue</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
                <CardDescription>Enter the details for the new issue.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    type="text"
                    placeholder="Enter issue title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Enter issue description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  <span>Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tag
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
                <CardDescription>Set status, priority, and assign the issue.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={status} 
                    onValueChange={(value: Status) => setStatus(value)}
                  >
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
                  <Select 
                    value={priority} 
                    onValueChange={(value: Priority) => setPriority(value)}
                  >
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
                  <label className="text-sm font-medium">Assign To</label>
                  <div className="mt-2">
                    {assignedTo ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {assignedTo.imageUrl ? (
                            <Avatar className="h-8 w-8">
                              <img src={assignedTo.imageUrl} alt={assignedTo.name} />
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {assignedTo.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{assignedTo.name}</div>
                            <div className="text-xs text-muted-foreground">{assignedTo.email}</div>
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
              </CardContent>
            </Card>

            <Button className="w-full" onClick={handleSubmit}>
              Create Issue
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NewIssue;
