import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/DashboardHome';
import ResumeUpload from '../components/ResumeUpload';
import NewApplication from '../components/NewApplication';
import ApplicationHistory from '../components/ApplicationHistory';
import Settings from '../components/Settings';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/new-application" element={<NewApplication />} />
          <Route path="/history" element={<ApplicationHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}