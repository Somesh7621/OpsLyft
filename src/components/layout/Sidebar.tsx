import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronRight, 
  Home, 
  Layout, 
  List, 
  LogOut, 
  Plus, 
  Settings, 
  Search 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const projects = useSelector((state: RootState) => state.projects.projects);
  const [expanded, setExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  return (
    <div
      className={cn(
        "group/sidebar h-screen bg-sidebar flex flex-col border-r border-border transition-all duration-300",
        expanded ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {expanded ? (
          <span className="font-semibold text-lg">Jira</span>
        ) : (
          <span className="font-bold mx-auto">J</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-2 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
              )
            }
          >
            <Home className="h-4 w-4" />
            {expanded && <span>Dashboard</span>}
          </NavLink>

          <div>
            <div
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-sidebar-accent"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
            >
              <Layout className="h-4 w-4" />
              {expanded && (
                <>
                  <span className="flex-1">Projects</span>
                  {projectsExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </div>

            {expanded && projectsExpanded && (
              <div className="ml-4 border-l border-border pl-2 mt-1 space-y-1">
                {projects.map(project => (
                  <NavLink
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )
                    }
                  >
                    <span>{project.name}</span>
                  </NavLink>
                ))}
                <NavLink
                  to="/projects/new"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Project</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavLink
            to="/issues"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
              )
            }
          >
            <List className="h-4 w-4" />
            {expanded && <span>All Issues</span>}
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
              )
            }
          >
            <Search className="h-4 w-4" />
            {expanded && <span>Search</span>}
          </NavLink>
        </nav>
      </div>

      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
            !expanded && "justify-center"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {expanded && <span>Sign out</span>}
        </Button>
      </div>
    </div>
  );
};
