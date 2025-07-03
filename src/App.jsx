import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { ResumeProvider } from './hooks/useResumes';
import { JobOpportunitiesProvider } from './hooks/useJobOpportunities';
import { AppliedJobsProvider } from './hooks/useAppliedJobs';
import { AssignmentsProvider } from './hooks/useAssignments';
import JobMatchScoreInfo from './pages/JobMatchScoreInfo';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/dashboard/*"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />
      <Route path="/job-match-score-info" element={<JobMatchScoreInfo />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <JobOpportunitiesProvider>
          <AppliedJobsProvider>
            <AssignmentsProvider>
              <AppRoutes />
            </AssignmentsProvider>
          </AppliedJobsProvider>
        </JobOpportunitiesProvider>
      </ResumeProvider>
    </AuthProvider>
  );
}

export default App;