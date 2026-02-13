import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { employeeAPI } from '../api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating employee with data:', formData);
      const response = await employeeAPI.create(formData);
      console.log('Employee created:', response);
      
      setSuccess('Employee added successfully!');
      setTimeout(() => {
        navigate('/employees');
      }, 1500);
    } catch (err) {
      console.error('Error creating employee:', err);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (typeof errors === 'object') {
          const errorMessages = Object.values(errors).flat().join(', ');
          setError(errorMessages);
        } else {
          setError(err.response.data.message || 'Failed to add employee');
        }
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to add employee');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Employees</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
        </div>
      </div>

      {/* Messages */}
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      {/* Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee ID */}
          <div className="form-group">
            <label htmlFor="employee_id" className="form-label required-field">
              Employee ID
            </label>
            <input
              type="text"
              id="employee_id"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., EMP001"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier for the employee (letters, numbers, hyphens, underscores)
            </p>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="full_name" className="form-label required-field">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., John Doe"
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label required-field">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., john.doe@company.com"
              required
              disabled={loading}
            />
          </div>

          {/* Department */}
          <div className="form-group">
            <label htmlFor="department" className="form-label required-field">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Engineering"
              required
              disabled={loading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;