import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Home, 
  Upload, 
  FileText, 
  History, 
  Settings, 
  LogOut,
  Zap,
  Briefcase,
  CheckSquare,
  User,
  Search
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Upload Resume', href: '/dashboard/upload', icon: Upload },
  { name: 'New Application', href: '/dashboard/new-application', icon: FileText },
  { name: 'Job Search', href: '/dashboard/jobs', icon: Search },
  { name: 'Opportunities', href: '/dashboard/opportunities', icon: Briefcase },
  { name: 'Applied Jobs', href: '/dashboard/applied', icon: CheckSquare },
  { name: 'Assignments', href: '/dashboard/assignments', icon: FileText },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings }
];

export default function Sidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <span className="ml-3 text-xl font-bold text-gray-900">SmartApply</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center mb-3">
          <div className="bg-gray-200 rounded-full p-2">
            <span className="text-sm font-medium text-gray-700">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}