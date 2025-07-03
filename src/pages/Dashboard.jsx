import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/DashboardHome';
import ResumeUpload from '../components/ResumeUpload';
import ResumeBuilder from '../components/ResumeBuilder';
import NewApplication from '../components/NewApplication';
import ApplicationHistory from '../components/ApplicationHistory';
import Settings from '../components/Settings';
import JobOpportunities from '../components/JobOpportunities';
import AppliedJobs from '../components/AppliedJobs';
import Assignments from '../components/Assignments';
import Jobs from '../components/Jobs';
import UserProfile from '../components/UserProfile';
import JobMatchScoreInfo from './JobMatchScoreInfo';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/opportunities" element={<JobOpportunities />} />
          <Route path="/applied" element={<AppliedJobs />} />
          <Route path="/job-match-score-info" element={<JobMatchScoreInfo />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/new-application" element={<NewApplication />} />
          <Route path="/history" element={<ApplicationHistory />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}