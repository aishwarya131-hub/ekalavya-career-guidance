import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Colleges = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    state: searchParams.get('state') || '',
    district: searchParams.get('district') || '',
    college_type: searchParams.get('college_type') || '',
    courseId: searchParams.get('courseId') || ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_colleges: 0,
    per_page: 10
  });

  useEffect(() => {
    fetchStates();
    fetchColleges();
  }, [filters, searchParams]);

  useEffect(() => {
    if (filters.state) {
      fetchCities(filters.state);
    } else {
      setCities([]);
    }
  }, [filters.state]);

  const fetchStates = async () => {
    try {
      const response = await axios.get('/api/colleges/states');
      if (response.data.success) {
        setStates(response.data.data.states);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCities = async (state) => {
    try {
      const response = await axios.get(`/api/colleges/states/${state}/districts`);
      if (response.data.success) {
        setCities(response.data.data.districts);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };


  const fetchColleges = async (pageOverride = null) => {
    setLoading(true);
    setError('');

    try {
      const currentPage = pageOverride || pagination.current_page;
      const params = new URLSearchParams({
        page: currentPage,
        limit: pagination.per_page,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      let url = '/api/colleges';
      if (filters.courseId) {
        url = '/api/colleges/by-course';
      }

      const response = await axios.get(`${url}?${params}`);
      
      if (response.data.success) {
        setColleges(response.data.data.colleges);
        
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        } else {
          setPagination({
            current_page: currentPage,
            total_pages: 1,
            total_colleges: response.data.data.total_colleges,
            per_page: response.data.data.colleges.length
          });
        }
      } else {
        setError(response.data.message || 'Failed to fetch colleges');
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setError('Failed to fetch colleges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) newParams.set(key, val);
    });
    setSearchParams(newParams);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchColleges();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: 1,
        limit: pagination.per_page,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const response = await axios.get(`/api/colleges/search?${params}`);
      
      if (response.data.success) {
        setColleges(response.data.data.colleges);
        setPagination(response.data.data.pagination);
      } else {
        setError(response.data.message || 'No colleges found');
      }
    } catch (error) {
      console.error('Error searching colleges:', error);
      setError('Failed to search colleges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
    fetchColleges(page);
  };

  const getCollegeTypeColor = (type) => {
    const lType = (type || '').toLowerCase();
    if (lType.includes('government') || lType.includes('public')) return 'bg-blue-100 text-blue-800';
    if (lType.includes('private')) return 'bg-green-100 text-green-800';
    if (lType.includes('aided')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading && colleges.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {filters.courseId ? 'Colleges Offering This Course' : 'Explore Colleges in India'}
          </h1>
          <p className="text-lg text-gray-600">
            {filters.courseId 
              ? `Showing colleges that offer "${filters.courseId}"` 
              : 'Find the perfect college with detailed insights, fees, and authentic reviews.'
            }
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Search & Filter</h2>
          
          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by college name, city, or state..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                disabled={!filters.state}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College Type</label>
              <select
                value={filters.college_type}
                onChange={(e) => handleFilterChange('college_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Types</option>
                <option value="Government">Government</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Private Unaided">Private Unaided</option>
              </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Target Course Name</label>
               <input
                 type="text"
                 value={filters.courseId}
                 onChange={(e) => handleFilterChange('courseId', e.target.value)}
                 placeholder="e.g. B.Tech, MBA..."
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
               />
             </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {pagination.total_colleges} colleges found
            </span>
            <button
              onClick={() => {
                setFilters({ state: '', district: '', college_type: '', courseId: '' });
                setSearchParams({});
                setSearchQuery('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Colleges List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading colleges...</p>
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No colleges found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="space-y-6">
            {colleges.map((college) => (
              <div key={college._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Main Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{college.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          {college.location && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {college.location.city}, {college.location.state}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getCollegeTypeColor(college.type)}`}>
                        {college.type || 'Unknown Type'}
                      </span>
                    </div>

                    {/* Stats and Badges */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {college.rating && (
                        <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-lg">
                          <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-semibold text-yellow-700">{college.rating}</span>
                          <span className="text-yellow-600 ml-1">/10</span>
                          {college.reviews && <span className="text-yellow-600 ml-1">({college.reviews} reviews)</span>}
                        </div>
                      )}
                      {college.avgPackage && (
                        <div className="flex items-center bg-green-50 px-3 py-1 rounded-lg">
                          <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="font-semibold text-green-700">{college.avgPackage}</span>
                        </div>
                      )}
                    </div>

                    {/* Accreditations */}
                    {college.accreditations && college.accreditations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {college.accreditations.map((acc, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-200">
                            {acc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Additional Info - NIRF Rank and Entrance Exams */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {college.nirfRank && (
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">NIRF Rank: </span>
                            <span className="text-purple-600 font-medium">#{college.nirfRank} in India</span>
                          </p>
                        </div>
                      )}
                      {college.entranceExams && college.entranceExams.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">Entrance Exams: </span>
                            <span className="text-orange-600 font-medium">{college.entranceExams.join(', ')}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Fee Range */}
                    {college.feeRange && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold">Overall Fee Range: </span>
                          <span className="text-blue-600 font-medium">{college.feeRange.raw}</span>
                        </p>
                      </div>
                    )}

                    {/* Courses Section */}
                    {college.courses && college.courses.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Top Courses
                        </h4>
                        <div className="space-y-2">
                          {college.courses.slice(0, 3).map((course, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-3 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 text-sm mb-1">{course.name}</p>
                                <div className="flex flex-wrap gap-1">
                                  {course.level && (
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{course.level}</span>
                                  )}
                                  {course.specialization && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">{course.specialization}</span>
                                  )}
                                  {course.mode && (
                                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">{course.mode}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 text-xs">
                                <span className="font-bold text-blue-600">{course.feesRaw}</span>
                                {course.duration && (
                                  <span className="text-gray-500">{course.duration}</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {college.courses.length > 3 && (
                            <p className="text-xs text-blue-600 font-medium pt-2 text-center bg-blue-50 rounded-lg py-2">
                              + {college.courses.length - 3} more courses offered
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  {college.sourceUrl ? (
                    <a 
                      href={college.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit College Page
                    </a>
                  ) : (
                    <button className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View Complete Details
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        page === pagination.current_page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;
