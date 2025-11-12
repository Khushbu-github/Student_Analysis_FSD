import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
import axios from 'axios';
import Prediction from './components/Prediction';
import StudyPlanner from './components/StudyPlanner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios interceptor to always include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Context
export const AuthContext = createContext();

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Navbar />
          <main className="container mx-auto px-6 py-12 max-w-7xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/study-planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
              <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
              <Route path="/performance/:studentId" element={<ProtectedRoute><StudentPerformance /></ProtectedRoute>} />
              <Route path="/prediction" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

// Navbar Component
function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-xs tracking-wider">AI</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">
              Student Analysis
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {user ? (
              <>
                <NavLink to="/dashboard" label="Dashboard" active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
                <NavLink to="/performance" label="Performance" active={isActive('/performance')} onClick={() => navigate('/performance')} />
                <NavLink to="/prediction" label="Prediction" active={isActive('/prediction')} onClick={() => navigate('/prediction')} />
                <NavLink to="/study-planner" label="Study Planner" active={isActive('/study-planner')} onClick={() => navigate('/study-planner')} />
                <NavLink to="/profile" label="Profile" active={isActive('/profile')} onClick={() => navigate('/profile')} />

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <button
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </button>
                <button
                  className="px-5 py-2 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-sm"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${active
        ? 'text-slate-900 bg-slate-100'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
        }`}
    >
      {label}
    </button>
  );
}

// Home Component
function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold tracking-wide uppercase mb-6">
          Advanced Analytics Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
          Student Performance <br /> Prediction
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Unlock actionable insights with AI-driven analysis. Track progress, predict outcomes, and optimize academic success.
        </p>

        {user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="px-8 py-3.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all shadow-sm"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
            <button
              className="px-8 py-3.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
              onClick={() => navigate('/performance')}
            >
              View Performance
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="px-8 py-3.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all shadow-sm"
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
            <button
              className="px-8 py-3.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-8 w-full max-w-6xl">
        <FeatureCard
          icon="📊"
          title="Performance Tracking"
          desc="Monitor academic progress with precision. Visualize trends across semesters and subjects."
        />
        <FeatureCard
          icon="🤖"
          title="AI Predictions"
          desc="Leverage advanced algorithms to forecast grades based on attendance and internal marks."
        />
        <FeatureCard
          icon="🎯"
          title="Actionable Insights"
          desc="Receive specific, data-backed recommendations to improve your academic standing."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 text-2xl">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

// Login Component
function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/students/login`, formData);
      const { token, student } = response.data;

      login(student, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Sign In
          </h2>
          <p className="text-slate-500 mt-2 text-sm">Access your performance dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            New student?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-slate-900 font-semibold hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Register Component
function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: '',
    semester: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/students/register`, formData);
      const { student } = response.data;

      const loginResponse = await axios.post(`${API_BASE_URL}/students/login`, {
        email: formData.email,
        password: formData.password
      });

      login(student, loginResponse.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-2xl w-full bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Create Account
          </h2>
          <p className="text-slate-500 mt-2 text-sm">Join the platform to track your academic journey</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
              placeholder="John Doe"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
              placeholder="e.g. 123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
              placeholder="e.g. CS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm bg-white"
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            Already registered?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-slate-900 font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Profile Component
// Profile Component
function Profile() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/students/profile`);
        setStudentData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Student Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your academic details</p>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <ProfileField label="Full Name" value={studentData?.name} />
            <ProfileField label="Email Address" value={studentData?.email} />
            <ProfileField label="Roll Number" value={studentData?.rollNumber} />
            <ProfileField label="Department" value={studentData?.department} />
            <ProfileField label="Semester" value={`Semester ${studentData?.semester}`} />
            <ProfileField
              label="Member Since"
              value={new Date(studentData?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      <p className="text-base font-medium text-slate-900 border-b border-slate-100 pb-2">{value}</p>
    </div>
  );
}

// Performance Component
function Performance() {
  const { user } = useContext(AuthContext);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    attendance: '',
    assignmentScore: '',
    internalMarks: '',
    projectMarks: '',
    finalExamMarks: ''
  });

  const fetchPerformances = React.useCallback(async () => {
    if (!user?._id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/performance/${user._id}`);
      setPerformances(response.data);
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPerformances();
  }, [fetchPerformances]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/performance/add`,
        { ...formData, studentId: user._id }
      );

      setShowForm(false);
      setFormData({
        subject: '',
        attendance: '',
        assignmentScore: '',
        internalMarks: '',
        projectMarks: '',
        finalExamMarks: ''
      });

      alert('Performance data added successfully!');
      fetchPerformances();

    } catch (error) {
      console.error('Error adding performance:', error);
      alert(error.response?.data?.message || 'Failed to add performance data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const getGradeStyle = (grade) => {
    const styles = {
      'A': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'C': 'bg-amber-100 text-amber-800 border-amber-200',
      'D': 'bg-orange-100 text-orange-800 border-orange-200',
      'F': 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[grade] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Records</h1>
          <p className="text-slate-500 text-sm mt-1">Track and managed your academic scores</p>
        </div>
        <button
          className="mt-4 sm:mt-0 px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all shadow-sm text-sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Record'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Add Performance Data</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
                placeholder="e.g. Mathematics"
              />
            </div>

            {['attendance', 'assignmentScore', 'internalMarks', 'projectMarks', 'finalExamMarks'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="number"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
                />
              </div>
            ))}

            <div className="md:col-span-2 mt-2">
              <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-sm text-sm">
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {performances.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-2xl">
              📊
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Records Found</h3>
            <p className="text-slate-500 mb-6 text-sm">Start by adding your first performance record.</p>
            <button
              className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all shadow-sm text-sm"
              onClick={() => setShowForm(true)}
            >
              Add Record
            </button>
          </div>
        ) : (
          performances.map((performance) => (
            <div key={performance._id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{performance.subject}</h4>
                  <p className="text-xs text-slate-400 mt-1">Added on {new Date(performance.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-semibold border ${getGradeStyle(performance.predictedGrade)}`}>
                  Grade {performance.predictedGrade}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <MetricItem label="Attendance" value={performance.attendance} />
                <MetricItem label="Assignment" value={performance.assignmentScore} />
                <MetricItem label="Internal" value={performance.internalMarks} />
                <MetricItem label="Project" value={performance.projectMarks} />
                <MetricItem label="Final Exam" value={performance.finalExamMarks} isLast />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MetricItem({ label, value, isLast }) {
  return (
    <div className={`text-center ${!isLast ? 'md:border-r md:border-slate-100' : ''}`}>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}

// StudentPerformance Component
function StudentPerformance() {
  return <Performance />;
}

// Dashboard Component
function Dashboard() {
  const { user } = useContext(AuthContext);
  const [recentPerformances, setRecentPerformances] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return;
      try {
        const perfResponse = await axios.get(`${API_BASE_URL}/performance/${user._id}`);
        const performances = perfResponse.data.slice(0, 5);
        setRecentPerformances(performances);

        if (performances.length > 0) {
          const latest = performances[0];
          setStats({
            latestGrade: latest.predictedGrade,
            totalSubjects: performances.length,
            averageAttendance: (performances.reduce((sum, p) => sum + p.attendance, 0) / performances.length).toFixed(1),
            averageScore: (performances.reduce((sum, p) => sum + p.finalExamMarks, 0) / performances.length).toFixed(1)
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getGradeStyle = (grade) => {
    const styles = {
      'A': 'bg-emerald-100 text-emerald-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-amber-100 text-amber-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };
    return styles[grade] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {user?.name}
        </h1>
        <p className="text-slate-500 mt-1">Here is the overview of your academic performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Latest Grade" value={stats.latestGrade || '-'} sublabel="Most recent subject" />
        <StatCard label="Subjects Tracked" value={stats.totalSubjects || '0'} sublabel="Total courses" />
        <StatCard label="Avg Attendance" value={`${stats.averageAttendance || 0}%`} sublabel="Across all subjects" />
        <StatCard label="Avg Score" value={`${stats.averageScore || 0}`} sublabel="Final exam average" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Performance Trend Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentPerformances.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line type="monotone" dataKey="finalExamMarks" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Comparison Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Subject Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentPerformances.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="assignmentScore" fill="#94a3b8" name="Assignment" radius={[4, 4, 0, 0]} />
                <Bar dataKey="finalExamMarks" fill="#0f172a" name="Final Exam" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Recent Activity</h3>
          {recentPerformances.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 mb-4 text-sm">No recent activity found.</p>
              <button
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all text-sm"
                onClick={() => window.location.href = '/performance'}
              >
                Add Performance Record
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPerformances.map((performance) => (
                <div key={performance._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{performance.subject}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(performance.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold ${getGradeStyle(performance.predictedGrade)}`}>
                    Grade {performance.predictedGrade}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickActionButton
              icon="➕"
              title="New Record"
              desc="Add marks & attendance"
              onClick={() => window.location.href = '/performance'}
            />
            <QuickActionButton
              icon="🔮"
              title="Get Prediction"
              desc="AI performance analysis"
              onClick={() => window.location.href = '/prediction'}
            />
            <QuickActionButton
              icon="👤"
              title="View Profile"
              desc="Account settings"
              onClick={() => window.location.href = '/profile'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sublabel }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="text-xs text-slate-400 mt-2">{sublabel}</div>
    </div>
  );
}

function QuickActionButton({ icon, title, desc, onClick }) {
  return (
    <button
      className="w-full text-left p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all flex items-center group"
      onClick={onClick}
    >
      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 text-lg group-hover:bg-slate-200 transition-colors">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-slate-900 text-sm">{title}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
    </button>
  );
}

export default App;