import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { attendanceAPI, employeeAPI } from '../api';
import Modal from '../components/Model';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
  });

  const fetchAttendance = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      
      console.log('Fetching attendance with params:', params);
      const attendanceData = await attendanceAPI.getAll(params);
      console.log('Attendance loaded:', attendanceData);
      
      let filteredData = Array.isArray(attendanceData) ? attendanceData : [];
      
      // Client-side search
      if (searchTerm) {
        filteredData = filteredData.filter(record => 
          record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.employee_id_display?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setAttendance(filteredData);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setAttendance([]);
    }
  }, [statusFilter, dateFilter, searchTerm]);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch employees first
      console.log('Fetching employees...');
      const employeesData = await employeeAPI.getAll();
      console.log('Employees loaded:', employeesData);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      
      // Then fetch attendance
      await fetchAttendance();
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchAttendance]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

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
        employee: parseInt(formData.employee), // Make sure it's an integer
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
        setSuccess(`Attendance marked for ${getEmployeeName(formData.employee)}`);
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

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return '';
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    return employee ? employee.full_name : 'Unknown';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        setLoading(true);
        await attendanceAPI.delete(id);
        setSuccess('Record deleted successfully');
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
      date: record.date,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
    });
    setEditingRecord(null);
  };

  const openModal = () => {
    resetForm();
    // Refresh employees list when opening modal
    fetchEmployees();
    setIsModalOpen(true);
  };

  const fetchEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(r => r.date === today);
  const presentToday = todayRecords.filter(r => r.status === 'present').length;
  const absentToday = todayRecords.filter(r => r.status === 'absent').length;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  if (loading && attendance.length === 0) {
    return <Loading message="Loading attendance..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track and manage employee attendance records</p>
        </div>
        <button
          onClick={openModal}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Mark Attendance</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      <div className="stats-grid">
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
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="input-group">
              <Search className="input-icon" />
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field"
              style={{ width: '150px' }}
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="select-field"
              style={{ width: '180px' }}
              max={today}
            />

            {(searchTerm || statusFilter !== 'all' || dateFilter) && (
              <button
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="toolbar-right">
            <span className="text-sm text-gray-600">
              Total: {attendance.length} {attendance.length === 1 ? 'record' : 'records'}
            </span>
          </div>
        </div>

        {!loading && attendance.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Calendar className="w-16 h-16" />
            </div>
            <h3 className="empty-state-title">
              {searchTerm || statusFilter !== 'all' || dateFilter
                ? 'No attendance records found'
                : 'No attendance records yet'}
            </h3>
            <p className="empty-state-message">
              {searchTerm || statusFilter !== 'all' || dateFilter
                ? 'Try adjusting your filters'
                : 'Get started by marking attendance for an employee'}
            </p>
            {!searchTerm && statusFilter === 'all' && !dateFilter && (
              <button
                onClick={openModal}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Mark Attendance</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td className="font-semibold">{record.employee_id_display}</td>
                    <td>{record.employee_name}</td>
                    <td>{record.department || '-'}</td>
                    <td className="text-gray-600">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingRecord ? 'Edit Attendance Record' : 'Mark Attendance'}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required-field">Select Employee *</label>
              <select
                required
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="form-input"
                disabled={loading}
              >
                <option value="">-- Choose an employee --</option>
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_id} - {emp.full_name} ({emp.department || 'No Dept'})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No employees available</option>
                )}
              </select>
              {employees.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No employees found. Please add employees first.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required-field">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-input"
                disabled={loading}
                max={today}
              />
            </div>

            <div className="form-group">
              <label className="form-label required-field">Status *</label>
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

            {formData.employee && (
              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Marking attendance for:</span><br />
                  {getEmployeeName(formData.employee)} - {formData.date}
                </p>
              </div>
            )}
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
              className="btn-primary flex items-center space-x-2"
              disabled={loading || employees.length === 0}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingRecord ? 'Update Record' : 'Mark Attendance'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;