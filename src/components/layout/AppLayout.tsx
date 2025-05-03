import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Sidebar } from './Sidebar';
import { UserButton } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    navigate('/sign-in');
    toast({
      title: "Authentication required",
      description: "Please sign in to access this page",
    });
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background border-b border-border shadow-sm">
          <div className="h-16 px-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Jira</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* <UserButton afterSignOutUrl="/" /> */}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
