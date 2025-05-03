import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Status = 'Open' | 'In Progress' | 'Done';
export type Priority = 'Low' | 'Medium' | 'High';

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignedTo: AssignedUser | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ActivityLog {
  id: string;
  issueId: string;
  userId: string;
  action: string;
  timestamp: string;
}

interface IssuesState {
  issues: Issue[];
  currentIssue: Issue | null;
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;
}

const initialState: IssuesState = {
  issues: [],
  currentIssue: null,
  activityLogs: [],
  loading: false,
  error: null,
};

export const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setIssues: (state, action: PayloadAction<Issue[]>) => {
      state.issues = action.payload;
    },
    addIssue: (state, action: PayloadAction<Issue>) => {
      state.issues.push(action.payload);
    },
    updateIssue: (state, action: PayloadAction<Issue>) => {
      const index = state.issues.findIndex(issue => issue.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
    },
    deleteIssue: (state, action: PayloadAction<string>) => {
      state.issues = state.issues.filter(issue => issue.id !== action.payload);
    },
    setCurrentIssue: (state, action: PayloadAction<Issue | null>) => {
      state.currentIssue = action.payload;
    },
    addActivityLog: (state, action: PayloadAction<ActivityLog>) => {
      state.activityLogs.push(action.payload);
    },
    setActivityLogs: (state, action: PayloadAction<ActivityLog[]>) => {
      state.activityLogs = action.payload;
    },
    updateIssueStatus: (state, action: PayloadAction<{issueId: string, status: Status}>) => {
      const issue = state.issues.find(issue => issue.id === action.payload.issueId);
      if (issue) {
        issue.status = action.payload.status;
        issue.updatedAt = new Date().toISOString();
      }
    },
    assignIssue: (state, action: PayloadAction<{issueId: string, user: AssignedUser | null}>) => {
      const issue = state.issues.find(issue => issue.id === action.payload.issueId);
      if (issue) {
        issue.assignedTo = action.payload.user;
        issue.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const { 
  setLoading,
  setError,
  setIssues,
  addIssue,
  updateIssue,
  deleteIssue,
  setCurrentIssue,
  addActivityLog,
  setActivityLogs,
  updateIssueStatus,
  assignIssue,
} = issuesSlice.actions;

export default issuesSlice.reducer;
