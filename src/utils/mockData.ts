
import { v4 as uuidv4 } from 'uuid';
import { Project } from '@/store/projectsSlice';
import { Issue, Status, Priority } from '@/store/issuesSlice';
import { Comment } from '@/store/commentsSlice';

export const generateMockProjects = (userId: string, count = 3): Project[] => {
  const projects: Project[] = [];
  const projectNames = [
    "Website Redesign",
    "Mobile App Development",
    "Backend API Integration",
    "User Authentication System",
    "Payment Gateway Implementation"
  ];
  const descriptions = [
    "Redesign of the company website with modern UI/UX principles",
    "Development of a new mobile application for both iOS and Android",
    "Integration with third-party APIs for enhanced functionality",
    "Implementing a secure authentication system with multi-factor support",
    "Setting up a payment gateway with support for multiple payment methods"
  ];

  for (let i = 0; i < Math.min(count, projectNames.length); i++) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    
    projects.push({
      id: uuidv4(),
      name: projectNames[i],
      description: descriptions[i],
      createdBy: userId,
      createdAt: createdAt.toISOString(),
    });
  }

  return projects;
};

export const generateMockIssues = (projects: Project[], issuesPerProject = 5): Issue[] => {
  const issues: Issue[] = [];
  const issueTitles = [
    "Fix login bug on Safari",
    "Implement dark mode toggle",
    "Optimize database queries",
    "Add email notifications",
    "Update documentation",
    "Redesign landing page",
    "Fix mobile responsiveness",
    "Add offline support",
    "Implement caching mechanism",
    "Add user preference settings"
  ];
  const descriptions = [
    "Users reported issues logging in on Safari browsers. Need to investigate and fix.",
    "Add a toggle for users to switch between light and dark mode.",
    "Current queries are slow. Need to add indexes and optimize joins.",
    "Set up email notifications for important events.",
    "Update documentation to reflect recent changes.",
    "Redesign the landing page to improve conversion rates.",
    "Fix responsiveness issues on mobile devices.",
    "Add offline support to allow basic functionality without internet.",
    "Implement caching to improve performance.",
    "Add settings page for users to customize their experience."
  ];
  const statuses: Status[] = ['Open', 'In Progress', 'Done'];
  const priorities: Priority[] = ['Low', 'Medium', 'High'];
  const tags = ["frontend", "backend", "bug", "feature", "improvement", "documentation", "design"];

  projects.forEach(project => {
    for (let i = 0; i < issuesPerProject; i++) {
      const titleIndex = Math.floor(Math.random() * issueTitles.length);
      const descIndex = Math.floor(Math.random() * descriptions.length);
      
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14));
      
      const updatedAt = new Date(createdAt);
      updatedAt.setDate(updatedAt.getDate() + Math.floor(Math.random() * 3));
      
      // Randomly select 1-3 tags
      const issueTags: string[] = [];
      const tagCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < tagCount; j++) {
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        if (!issueTags.includes(randomTag)) {
          issueTags.push(randomTag);
        }
      }
      
      issues.push({
        id: uuidv4(),
        projectId: project.id,
        title: issueTitles[titleIndex],
        description: descriptions[descIndex],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        assignedTo: null,
        tags: issueTags,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      });
    }
  });

  return issues;
};

export const generateMockComments = (issueIds: string[], userId: string, userName: string): Comment[] => {
  const comments: Comment[] = [];
  const commentContents = [
    "I think we should approach this differently.",
    "I've been working on this and found a solution.",
    "Can you provide more details?",
    "This has been fixed in the latest commit.",
    "Let's discuss this in the next meeting.",
    "I suggest we prioritize this issue.",
    "The root cause appears to be in the authentication module.",
    "I've added a detailed report in the documentation.",
    "This is similar to the issue we resolved last sprint."
  ];

  issueIds.forEach(issueId => {
    const commentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      const content = commentContents[Math.floor(Math.random() * commentContents.length)];
      
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 7));
      
      comments.push({
        id: uuidv4(),
        issueId,
        userId,
        userName,
        content,
        createdAt: createdAt.toISOString(),
      });
    }
  });

  return comments;
};
