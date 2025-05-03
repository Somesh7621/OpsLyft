
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setProjects } from '@/store/projectsSlice';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { Plus } from 'lucide-react';
import { generateMockProjects, generateMockIssues } from '@/utils/mockData';
import { setIssues } from '@/store/issuesSlice';

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.projects.projects);

  useEffect(() => {
    if (projects.length === 0 && user) {
      const mockProjects = generateMockProjects(user.id);
      dispatch(setProjects(mockProjects));
      
      const mockIssues = generateMockIssues(mockProjects);
      dispatch(setIssues(mockIssues));
    }
  }, [user, dispatch, projects.length]);

  const getRecentProjects = () => {
    return [...projects].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }).slice(0, 3);
  };

  const recentProjects = getRecentProjects();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Button onClick={() => navigate('/projects/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Projects</CardTitle>
              <CardDescription>Your active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Open Issues</CardTitle>
              <CardDescription>Issues that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                12
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Completed Issues</CardTitle>
              <CardDescription>Issues marked as done</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                8
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </CardFooter>
              </Card>
            ))}
            {recentProjects.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">You haven't created any projects yet.</p>
                  <Button onClick={() => navigate('/projects/new')} className="mt-4">
                    Create your first project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
