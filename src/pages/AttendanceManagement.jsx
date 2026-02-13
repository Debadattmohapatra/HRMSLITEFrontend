import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Calendar, CheckCircle, 
  XCircle, Filter, RefreshCw, User, Clock, Download 
} from 'lucide-react';
import { attendanceAPI, employeeAPI } from '../api';
import Modal from '../components/Model';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const AttendanceManagement = () => {
  // State Management
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    employee_search: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
  });

  // Quick Attendance States
  const [quickEmployeeId, setQuickEmployeeId] = useState('');
  const [quickStatus, setQuickStatus] = useState('present');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAttendance();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, dateFilter, startDate, endDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch employees
      console.log('Fetching employees...');
      const employeesData = await employeeAPI.getAll();
      console.log('Employees loaded:', employeesData);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      
      // Fetch attendance
      await fetchAttendance();
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const params = {};
      
      // Apply filters
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (searchTerm) params.search = searchTerm;
      
      console.log('Fetching attendance with params:', params);
      const attendanceData = await attendanceAPI.getAll(params);
      console.log('Attendance loaded:', attendanceData);
      
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setAttendance([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate employee selection
      if (!formData.employee) {
        throw new Error('Please select an employee');
      }

      const payload = {
        employee: parseInt(formData.employee),
        date: formData.date,
        status: formData.status
      };
      
      console.log('Submitting attendance payload:', payload);
      
      let response;
      if (editingRecord) {
        response = await attendanceAPI.update(editingRecord.id, payload);
        console.log('Update response:', response);
        setSuccess('Attendance record updated successfully');
      } else {
        response = await attendanceAPI.create(payload);
        console.log('Create response:', response);
        const employee = getEmployeeById(formData.employee);
        setSuccess(`Attendance marked for ${employee?.full_name || 'Employee'}`);
      }
      
      // Close modal and reset
      setIsModalOpen(false);
      resetForm();
      
      // Refresh attendance list
      await fetchAttendance();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving attendance:', err);
      
      let errorMessage = 'Failed to save attendance record';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAttendance = async () => {
    if (!quickEmployeeId.trim()) {
      setError('Please enter Employee ID');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Find employee by ID
      const employee = employees.find(
        emp => emp.employee_id.toLowerCase() === quickEmployeeId.toLowerCase()
      );

      if (!employee) {
        setError(`Employee with ID "${quickEmployeeId}" not found`);
        setTimeout(() => setError(null), 3000);
        setLoading(false);
        return;
      }

      const payload = {
        employee: employee.id,
        date: new Date().toISOString().split('T')[0],
        status: quickStatus
      };

      console.log('Quick attendance payload:', payload);
      await attendanceAPI.create(payload);
      
      setSuccess(`Attendance marked for ${employee.full_name} as ${quickStatus}`);
      setQuickEmployeeId('');
      await fetchAttendance();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error marking quick attendance:', err);
      
      if (err.response?.data?.message?.includes('already exists')) {
        setError('Attendance already marked for this employee today');
      } else {
        setError('Failed to mark attendance');
      }
      
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        setLoading(true);
        await attendanceAPI.delete(id);
        setSuccess('Attendance record deleted successfully');
        await fetchAttendance();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting record:', err);
        setError('Failed to delete record');
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (record) => {
    console.log('Editing record:', record);
    setEditingRecord(record);
    setFormData({
      employee: record.employee.toString(),
      employee_search: '',
      date: record.date,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      employee_search: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
    });
    setEditingRecord(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const getEmployeeById = (id) => {
    if (!id) return null;
    return employees.find(emp => emp.id === parseInt(id));
  };

  const getEmployeeName = (id) => {
    const employee = getEmployeeById(id);
    return employee ? employee.full_name : 'Unknown';
  };

  const filterEmployees = () => {
    if (!formData.employee_search) return employees;
    
    return employees.filter(emp => 
      emp.employee_id.toLowerCase().includes(formData.employee_search.toLowerCase()) ||
      emp.full_name.toLowerCase().includes(formData.employee_search.toLowerCase()) ||
      emp.email.toLowerCase().includes(formData.employee_search.toLowerCase())
    );
  };

  const selectEmployee = (employeeId) => {
    setFormData({
      ...formData,
      employee: employeeId.toString(),
      employee_search: ''
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
    setStartDate('');
    setEndDate('');
  };

  // Statistics
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(r => r.date === today);
  const presentToday = todayRecords.filter(r => r.status === 'present').length;
  const absentToday = todayRecords.filter(r => r.status === 'absent').length;
  
  const totalPresent = attendance.filter(r => r.status === 'present').length;
  const totalAbsent = attendance.filter(r => r.status === 'absent').length;
  
  const uniqueEmployees = [...new Set(attendance.map(r => r.employee))].length;

  if (loading && attendance.length === 0) {
    return <Loading message="Loading attendance management..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">CRUD operations for employee attendance</p>
        </div>
        <button
          onClick={openModal}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Attendance</span>
        </button>
      </div>

      {/* Messages */}
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      {/* Quick Attendance Section */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Quick Mark Attendance
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={quickEmployeeId}
                onChange={(e) => setQuickEmployeeId(e.target.value)}
                placeholder="Enter Employee ID (e.g., 1, 2, 3, 4)"
                className="form-input pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available IDs: {employees.map(e => e.employee_id).join(', ')}
            </p>
          </div>
          
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={quickStatus}
              onChange={(e) => setQuickStatus(e.target.value)}
              className="form-input"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          
          <div>
            <button
              onClick={handleQuickAttendance}
              disabled={loading}
              className="btn-primary flex items-center space-x-2 px-6"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Mark Attendance</span>
            </button>
          </div>
          
          <div>
            <button
              onClick={fetchInitialData}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Total Records</div>
              <div className="stat-card-value">{attendance.length}</div>
            </div>
            <div className="stat-card-icon blue">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {uniqueEmployees} employees marked
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Present Today</div>
              <div className="stat-card-value">{presentToday}</div>
            </div>
            <div className="stat-card-icon green">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {todayRecords.length > 0 
              ? `${((presentToday / todayRecords.length) * 100).toFixed(0)}% rate` 
              : 'No records'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Absent Today</div>
              <div className="stat-card-value">{absentToday}</div>
            </div>
            <div className="stat-card-icon red">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {absentToday} employees absent
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Total Present</div>
              <div className="stat-card-value">{totalPresent}</div>
            </div>
            <div className="stat-card-icon purple">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {totalAbsent} total absent
          </div>
        </div>
      </div>

      {/* Main Card with Filters and Table */}
      <div className="card">
        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="input-group">
                <Search className="input-icon" />
                <input
                  type="text"
                  placeholder="Search by Employee ID, Name, or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field w-40"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="select-field w-40"
              placeholder="Date"
            />

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced</span>
            </button>

            {(searchTerm || statusFilter !== 'all' || dateFilter || startDate || endDate) && (
              <button
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Attendance Table */}
        {!loading && attendance.length === 0 ? (
          <div className="empty-state mt-8">
            <div className="empty-state-icon">
              <Calendar className="w-16 h-16" />
            </div>
            <h3 className="empty-state-title">No attendance records found</h3>
            <p className="empty-state-message">
              {searchTerm || statusFilter !== 'all' || dateFilter || startDate || endDate
                ? 'Try adjusting your filters'
                : 'Mark attendance using the Quick Mark section or New Attendance button'}
            </p>
          </div>
        ) : (
          <div className="table-container mt-6">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const date = new Date(record.date);
                  return (
                    <tr key={record.id}>
                      <td className="text-gray-500">{record.id}</td>
                      <td className="font-semibold">{record.employee_id_display}</td>
                      <td>{record.employee_name}</td>
                      <td>{record.department || '-'}</td>
                      <td className="text-gray-600">
                        {date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="text-gray-600">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </td>
                      <td>
                        <span className={`badge ${record.status === 'present' ? 'badge-success' : 'badge-error'}`}>
                          {record.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="btn-icon"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="btn-icon"
                            style={{ color: 'var(--error)' }}
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingRecord ? 'Edit Attendance Record' : 'Mark New Attendance'}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            {/* Employee Search */}
            <div className="form-group">
              <label className="form-label required-field">Search Employee</label>
              <input
                type="text"
                value={formData.employee_search}
                onChange={(e) => setFormData({ ...formData, employee_search: e.target.value })}
                className="form-input"
                placeholder="Type ID, name, or email to search..."
                disabled={loading}
              />
            </div>

            {/* Employee Selection */}
            <div className="form-group">
              <label className="form-label required-field">Select Employee</label>
              {formData.employee ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">
                      {getEmployeeName(formData.employee)}
                    </p>
                    <p className="text-sm text-blue-700">
                      ID: {getEmployeeById(formData.employee)?.employee_id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, employee: '' })}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {filterEmployees().length > 0 ? (
                    filterEmployees().map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => selectEmployee(emp.id)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <p className="font-medium">{emp.full_name}</p>
                        <p className="text-sm text-gray-600">
                          ID: {emp.employee_id} | Dept: {emp.department} | Email: {emp.email}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-gray-500 text-center">No employees found</p>
                  )}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label required-field">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-input"
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label required-field">Status</label>
              <div className="flex space-x-6 p-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="present"
                    checked={formData.status === 'present'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Present</span>
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="absent"
                    checked={formData.status === 'absent'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="flex items-center space-x-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Absent</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.employee}
            >
              {loading ? 'Saving...' : editingRecord ? 'Update Record' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;