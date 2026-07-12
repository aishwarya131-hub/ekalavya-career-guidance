import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import axios from 'axios';

const Results = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { student, quizResults, updateRecommendations } = useStudent();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    fetchRecommendations();
  }, [isAuthenticated, user, navigate]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Generating recommendations...');
      console.log('User:', user);
      
      // First, try to generate recommendations
      const generateResponse = await axios.post('/api/recommendations');
      console.log('Generate recommendations response:', generateResponse.data);
      
      if (generateResponse.data.success) {
        console.log('Recommendations generated successfully');
        // Now fetch the recommendations
        const fetchResponse = await axios.get('/api/recommendations');
        console.log('Fetch recommendations response:', fetchResponse.data);
        
        if (fetchResponse.data.success) {
          setRecommendations(fetchResponse.data.data);
          updateRecommendations(fetchResponse.data.data);
        } else {
          console.error('Fetch recommendations API returned error:', fetchResponse.data);
          setError(fetchResponse.data.message || 'Failed to fetch recommendations');
        }
      } else {
        console.error('Generate recommendations API returned error:', generateResponse.data);
        setError(generateResponse.data.message || 'Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Error with recommendations:', error);
      console.error('Error response:', error.response?.data);
      
      // If generation fails, try to fetch existing recommendations
      try {
        console.log('Trying to fetch existing recommendations...');
        const fetchResponse = await axios.get('/api/recommendations');
        console.log('Fetch existing recommendations response:', fetchResponse.data);
        
        if (fetchResponse.data.success) {
          setRecommendations(fetchResponse.data.data);
          updateRecommendations(fetchResponse.data.data);
        } else {
          setError(fetchResponse.data.message || 'No recommendations found. Please complete the quiz first.');
        }
      } catch (fetchError) {
        console.error('Error fetching existing recommendations:', fetchError);
        setError(fetchError.response?.data?.message || 'Failed to generate or fetch recommendations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const toggleCourseExpansion = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'Science': return '🔬';
      case 'Commerce': return '💼';
      case 'Arts': return '🎨';
      case 'Vocational': return '🛠️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommendation Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchRecommendations}
              className="btn-primary w-full"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-outline w-full"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Career Recommendations
          </h1>
          <p className="text-lg text-gray-600">
            Personalized course suggestions based on your aptitude and interests
          </p>
        </div>

        {/* Student Profile Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Student Information</h3>
              <p className="text-gray-900"><strong>Name:</strong> {user?.name || 'Student'}</p>
              <p className="text-gray-900"><strong>Email:</strong> {user?.email}</p>
              <p className="text-gray-900"><strong>Interest:</strong> {student?.declared_interest || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Aptitude Scores</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-900">Science:</span>
                  <span className="font-medium">{quizResults?.aptitude_scores?.science || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900">Commerce:</span>
                  <span className="font-medium">{quizResults?.aptitude_scores?.commerce || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900">Arts:</span>
                  <span className="font-medium">{quizResults?.aptitude_scores?.arts || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900">Vocational:</span>
                  <span className="font-medium">{quizResults?.aptitude_scores?.vocational || 0}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Dominant Domain</h3>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-xl">{getDomainIcon(quizResults?.dominant_domain || 'Science')}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{quizResults?.dominant_domain || 'Science'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI-ready Career Guidance (from quiz) */}
        {(quizResults?.streams?.length || quizResults?.career_guidance?.streams?.length) && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Career Guidance</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-primary-50 rounded-lg border border-primary-100">
                <h3 className="font-semibold text-gray-900 mb-2">🎯 Recommended Streams</h3>
                <div className="flex flex-wrap gap-2">
                  {(quizResults?.streams || quizResults?.career_guidance?.streams || []).map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full text-sm bg-white border border-gray-200 text-gray-900">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2">🧠 Why this suits you</h3>
                <p className="text-gray-700 leading-relaxed">
                  {quizResults?.explanation || quizResults?.career_guidance?.explanation || '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">📚 Courses to explore</h3>
                <ul className="space-y-2">
                  {(quizResults?.courses || quizResults?.career_guidance?.courses || []).map((c) => (
                    <li key={c} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span className="text-gray-800">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">💼 Career paths</h3>
                <ul className="space-y-2">
                  {(quizResults?.careers || quizResults?.career_guidance?.careers || []).map((c) => (
                    <li key={c} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span className="text-gray-800">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.recommendations && recommendations.recommendations.length > 0 && (
          <div className="space-y-8">
            {recommendations.recommendations.map((recommendation, recIndex) => (
              <div key={recommendation._id} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recommended Courses</h2>
                  <span className="text-sm text-gray-500">
                    {recommendation.recommended_courses ? recommendation.recommended_courses.length : 0} courses recommended
                  </span>
                </div>

                <div className="space-y-4">
                  {recommendation.recommended_courses && recommendation.recommended_courses.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCourseExpansion(index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg font-bold text-primary-600">#{rec.rank}</span>
                            <h3 className="text-xl font-semibold text-gray-900">{rec.course_name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
                              {rec.course_level || 'Degree Program'}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">Recommended specially for you based on domain analysis.</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Duration: {rec.course_duration || 'Standard'}</span>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-700">Match Score:</span>
                              <span className={`text-sm font-bold ${getScoreColor(rec.score)}`}>
                                {rec.score}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getScoreBgColor(rec.score)}`}
                                style={{ width: `${rec.score}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-1">Why this course?</h4>
                            <p className="text-blue-800 text-sm">{rec.reason}</p>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedCourse === index ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {expandedCourse === index && (
                      <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <div className="mt-2 pt-2">
                          <button
                            onClick={() => navigate(`/colleges?courseId=${encodeURIComponent(rec.course_name)}`)}
                            className="btn-primary text-sm w-full md:w-auto"
                          >
                            Explore Colleges Offering This Course
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-2xl">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Research Colleges</h3>
              <p className="text-gray-600 text-sm">Explore colleges that offer your recommended courses</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-2xl">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Check Eligibility</h3>
              <p className="text-gray-600 text-sm">Verify admission requirements and deadlines</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-2xl">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Apply</h3>
              <p className="text-gray-600 text-sm">Submit applications to your preferred colleges</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => navigate('/colleges')}
              className="btn-primary"
            >
              Explore Colleges
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-outline"
            >
              Start New Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
