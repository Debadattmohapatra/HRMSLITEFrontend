import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Users, Eye } from 'lucide-react';
import { employeeAPI } from '../api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const Employee = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        searchEmployees();
      } else {
        fetchEmployees();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching employees...');
      const data = await employeeAPI.getAll();
      console.log('Employees data received:', data);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.message || 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const searchEmployees = async () => {
    if (!searchTerm.trim()) {
      fetchEmployees();
      return;
    }
    
    try {
      setLoading(true);
      console.log('Searching employees with term:', searchTerm);
      const data = await employeeAPI.search(searchTerm);
      console.log('Search results:', data);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error searching employees:', err);
      setError(err.response?.data?.message || 'Failed to search employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        setLoading(true);
        await employeeAPI.delete(id);
        setSuccess('Employee deleted successfully');
        await fetchEmployees();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError(err.response?.data?.message || 'Failed to delete employee');
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && employees.length === 0) {
    return <Loading message="Loading employees..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your employee information and records</p>
        </div>
        <button
          onClick={() => navigate('/employees/add')}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Employee</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="input-group">
              <Search className="input-icon" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary text-sm"
              >
                Clear
              </button>
            )}
          </div>
          <div className="toolbar-right">
            <span className="text-sm text-gray-600">
              Total: {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
            </span>
          </div>
        </div>

        {!loading && employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users className="w-16 h-16" />
            </div>
            <h3 className="empty-state-title">
              {searchTerm ? 'No employees found' : 'No employees yet'}
            </h3>
            <p className="empty-state-message">
              {searchTerm 
                ? `No results found for "${searchTerm}"`
                : 'Get started by adding your first employee'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => navigate('/employees/add')}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Employee</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Present Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="font-semibold">
                      <Link 
                        to={`/employees/${employee.id}`} 
                        className="text-primary-600 hover:underline"
                      >
                        {employee.employee_id}
                      </Link>
                    </td>
                    <td>
                      <Link 
                        to={`/employees/${employee.id}`} 
                        className="text-gray-900 hover:text-primary-600"
                      >
                        {employee.full_name}
                      </Link>
                    </td>
                    <td className="text-gray-600">{employee.email}</td>
                    <td>{employee.department || '-'}</td>
                    <td>
                      <span className="badge badge-success">
                        {employee.total_present_days || 0} {employee.total_present_days === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="btn-icon"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => navigate(`/employees/edit/${employee.id}`)}
                          className="btn-icon"
                          title="Edit Employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="btn-icon"
                          style={{ color: 'var(--error)' }}
                          title="Delete Employee"
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
    </div>
  );
};

export default Employee;