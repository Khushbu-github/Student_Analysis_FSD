import React, { useState } from 'react';
import axios from 'axios';

const Prediction = () => {
    const [formData, setFormData] = useState({
        attendance: '',
        assignmentScore: '',
        internalMarks: '',
        projectMarks: '',
        finalExamMarks: ''
    });

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const calculatePrediction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setPrediction(null);

        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const token = localStorage.getItem('token');

            const payload = {
                ...formData,
                studentId: user?._id
            };

            const API_BASE_URL = 'http://localhost:5000/api';

            const response = await axios.post(
                `${API_BASE_URL}/prediction/predict`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setPrediction(response.data);
        } catch (err) {
            console.error('Prediction error:', err);
            setError(err.response?.data?.message || 'Failed to generate prediction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">
                    AI Performance Prediction
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                    Enter your academic metrics to generate an AI-powered forecast of your final grade.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Input Metrics</h2>
                            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">All fields required</span>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={calculatePrediction} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Attendance (%)</label>
                                    <input
                                        type="number"
                                        name="attendance"
                                        value={formData.attendance}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="0-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Assignment Score</label>
                                    <input
                                        type="number"
                                        name="assignmentScore"
                                        value={formData.assignmentScore}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="0-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Internal Marks</label>
                                    <input
                                        type="number"
                                        name="internalMarks"
                                        value={formData.internalMarks}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="0-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Marks</label>
                                    <input
                                        type="number"
                                        name="projectMarks"
                                        value={formData.projectMarks}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="0-100"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Final Exam Marks</label>
                                    <input
                                        type="number"
                                        name="finalExamMarks"
                                        value={formData.finalExamMarks}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="0-100"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-sm flex justify-center items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Analyzing Data...
                                    </>
                                ) : (
                                    'Generate Prediction'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-slate-900 text-white rounded-xl shadow-lg p-8 h-full flex flex-col relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -ml-16 -mb-16 opacity-50"></div>

                        {prediction ? (
                            <div className="relative z-10 animate-fade-in flex flex-col h-full">
                                <div className="text-center mb-8">
                                    <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">Predicted Grade</p>
                                    <div className="text-8xl font-bold text-white mb-2 tracking-tighter">
                                        {prediction.predictedGrade}
                                    </div>
                                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                                        Confidence: {Math.round(prediction.confidence)}%
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 rounded-lg p-6 mb-6 backdrop-blur-sm border border-slate-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-400 text-sm">Predicted Score</span>
                                        <span className="text-xl font-bold">{prediction.predictedValue?.toFixed(1)}</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-white h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(prediction.predictedValue, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {prediction.suggestions && prediction.suggestions.length > 0 && (
                                    <div className="mt-auto">
                                        <h4 className="font-semibold text-white mb-4 flex items-center text-sm">
                                            <span className="mr-2">💡</span> AI Recommendations
                                        </h4>
                                        <ul className="space-y-3">
                                            {prediction.suggestions.map((suggestion, index) => (
                                                <li key={index} className="flex items-start text-sm text-slate-300">
                                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                                    <span>{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 rotate-3">
                                    <span className="text-3xl">🤖</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Ready to Predict</h3>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                                    Fill in the metrics on the left to receive an AI-powered performance analysis.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Prediction;
