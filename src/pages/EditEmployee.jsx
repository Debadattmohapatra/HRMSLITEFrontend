import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { employeeAPI } from '../api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getById(id);
      setFormData({
        employee_id: data.employee_id,
        full_name: data.full_name,
        email: data.email,
        department: data.department || '',
      });
    } catch (err) {
      setError('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      await employeeAPI.update(id, formData);
      setSuccess('Employee updated successfully!');
      setTimeout(() => {
        navigate('/employees');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading employee details..." />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Employees</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="form-input bg-gray-50"
              placeholder="e.g., EMP001"
              required
              disabled={true}
            />
            <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
          </div>

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
              disabled={saving}
            />
          </div>

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
              disabled={saving}
            />
          </div>

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
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;