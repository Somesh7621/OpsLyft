
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { Issue } from '@/store/issuesSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/issues/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List } from 'lucide-react';
import { setCurrentProject } from '@/store/projectsSlice';
import { useToast } from '@/hooks/use-toast';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const project = useSelector((state: RootState) => 
    state.projects.projects.find(p => p.id === id)
  );
  
  const issues = useSelector((state: RootState) => 
    state.issues.issues.filter(issue => issue.projectId === id)
  );

  useEffect(() => {
    if (project) {
      dispatch(setCurrentProject(project));
    } else if (id) {
      toast({
        title: "Project not found",
        description: "The requested project could not be found.",
        variant: "destructive"
      });
      navigate('/projects');
    }
    
    return () => {
      dispatch(setCurrentProject(null));
    };
  }, [id, project, dispatch, navigate, toast]);

  if (!project) return null;

  const getIssuesByStatus = (status: 'Open' | 'In Progress' | 'Done') => {
    return issues.filter(issue => issue.status === status);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/issues`)}>
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button onClick={() => navigate(`/projects/${project.id}/issues/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              New Issue
            </Button>
          </div>
        </div>

        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban" className="space-y-4">
            <KanbanBoard 
              openIssues={getIssuesByStatus('Open')}
              inProgressIssues={getIssuesByStatus('In Progress')}
              doneIssues={getIssuesByStatus('Done')}
              projectId={project.id}
            />
          </TabsContent>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card rounded-lg shadow p-4">
                <h3 className="font-medium mb-2">Project Details</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    Total Issues: {issues.length}
                  </p>
                </div>
              </div>
              <div className="bg-card rounded-lg shadow p-4">
                <h3 className="font-medium mb-2">Issue Summary</h3>
                <div className="space-y-2">
                  <p className="text-sm">Open: {getIssuesByStatus('Open').length}</p>
                  <p className="text-sm">In Progress: {getIssuesByStatus('In Progress').length}</p>
                  <p className="text-sm">Done: {getIssuesByStatus('Done').length}</p>
                </div>
              </div>
              <div className="bg-card rounded-lg shadow p-4">
                <h3 className="font-medium mb-2">Priority Breakdown</h3>
                <div className="space-y-2">
                  <p className="text-sm">High: {issues.filter(i => i.priority === 'High').length}</p>
                  <p className="text-sm">Medium: {issues.filter(i => i.priority === 'Medium').length}</p>
                  <p className="text-sm">Low: {issues.filter(i => i.priority === 'Low').length}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProjectDetail;
