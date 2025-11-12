import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

const StudyPlanner = () => {
    const { user } = useContext(AuthContext);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatingPlan, setGeneratingPlan] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        topic: '',
        deadline: '',
        priority: 'medium'
    });

    const API_BASE_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchGoals();
    }, [user]);

    const fetchGoals = async () => {
        if (!user?._id) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/study-goals/${user._id}`);
            setGoals(response.data);
        } catch (error) {
            console.error('Error fetching study goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/study-goals/add`, {
                ...formData,
                studentId: user._id
            });
            setShowForm(false);
            setFormData({ subject: '', topic: '', deadline: '', priority: 'medium' });
            fetchGoals();
        } catch (error) {
            console.error('Error adding goal:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/study-goals/delete/${id}`);
            fetchGoals();
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_BASE_URL}/study-goals/update/${id}`, { status });
            fetchGoals();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleGenerateAIPlan = async () => {
        setGeneratingPlan(true);
        try {
            await axios.post(`${API_BASE_URL}/study-goals/generate`, {
                studentId: user._id
            });
            fetchGoals();
            alert("AI Study Plan Generated Successfully! 🚀");
        } catch (error) {
            console.error('Error generating plan:', error);
            alert(error.response?.data?.message || "Failed to generate plan. Ensure you have performance data.");
        } finally {
            setGeneratingPlan(false);
        }
    };

    if (loading && !goals.length) return <div className="p-10 text-center">Loading Planner...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Study Planner</h1>
                    <p className="text-slate-500 mt-2">Manage your academic goals and deadlines</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleGenerateAIPlan}
                        disabled={generatingPlan}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-200"
                    >
                        {generatingPlan ? 'Generating...' : '✨ Auto-Generate Plan'}
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        {showForm ? 'Cancel' : 'Add New Goal'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 animate-fade-in">
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                                placeholder="e.g. Mathematics"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                            <input
                                type="text"
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                                placeholder="e.g. Calculus Integration"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors">
                                Save Goal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {['pending', 'in-progress', 'completed'].map((status) => (
                    <div key={status} className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-fit">
                        <h3 className="font-bold text-slate-700 uppercase text-sm mb-4 tracking-wide flex justify-between">
                            {status.replace('-', ' ')}
                            <span className="bg-slate-200 text-slate-600 px-2 rounded-full text-xs flex items-center">
                                {goals.filter(g => g.status === status).length}
                            </span>
                        </h3>

                        <div className="space-y-3">
                            {goals.filter(g => g.status === status).map((goal) => (
                                <div key={goal._id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(goal.priority)}`}>
                                            {goal.priority}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(goal._id)}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <h4 className="font-bold text-slate-900">{goal.subject}</h4>
                                    <p className="text-sm text-slate-600 mb-3">{goal.topic}</p>

                                    <div className="flex items-center text-xs text-slate-500 mb-3">
                                        <span className="mr-2">📅 {new Date(goal.deadline).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        {status !== 'pending' && (
                                            <button
                                                onClick={() => updateStatus(goal._id, 'pending')}
                                                className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600"
                                            >
                                                ←
                                            </button>
                                        )}
                                        {status !== 'in-progress' && status !== 'completed' && (
                                            <button
                                                onClick={() => updateStatus(goal._id, 'in-progress')}
                                                className="text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-blue-600 flex-1"
                                            >
                                                Start
                                            </button>
                                        )}
                                        {status === 'in-progress' && (
                                            <button
                                                onClick={() => updateStatus(goal._id, 'completed')}
                                                className="text-xs bg-green-50 hover:bg-green-100 px-3 py-1 rounded text-green-600 flex-1"
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {goals.filter(g => g.status === status).length === 0 && (
                                <p className="text-center text-slate-400 text-sm py-4 italic">No items</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudyPlanner;
