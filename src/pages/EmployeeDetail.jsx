import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Building2, Calendar, CheckCircle, Clock } from 'lucide-react';
import { employeeAPI } from '../api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching employee details for ID:', id);
      
      // Fetch employee details
      const employeeData = await employeeAPI.getById(id);
      console.log('Employee data received:', employeeData);
      setEmployee(employeeData);

      // Fetch employee attendance
      try {
        const attendanceData = await employeeAPI.getAttendance(id);
        console.log('Attendance data received:', attendanceData);
        
        // Handle different response structures
        if (attendanceData && attendanceData.attendance) {
          setAttendance(attendanceData.attendance);
        } else if (Array.isArray(attendanceData)) {
          setAttendance(attendanceData);
        } else {
          setAttendance([]);
        }
      } catch (attErr) {
        console.error('Failed to load attendance:', attErr);
        setAttendance([]);
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError(err.response?.data?.message || 'Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceSummary = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    
    return { total, present, absent, attendanceRate };
  };

  if (loading) {
    return <Loading message="Loading employee details..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/employees')} className="btn-secondary flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/employees')} className="btn-secondary flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </button>
        <ErrorMessage message="Employee not found" />
      </div>
    );
  }

  const summary = getAttendanceSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/employees')} 
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </button>
        
        <Link
          to="/attendance"
          className="btn-primary flex items-center space-x-2"
        >
          <Clock className="w-4 h-4" />
          <span>Mark Attendance</span>
        </Link>
      </div>

      {/* Employee Info Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
            <p className="text-gray-600 mt-1">Employee ID: {employee.employee_id}</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              {employee.total_present_days || 0} Total Present
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900 font-medium">{employee.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-gray-900 font-medium">{employee.department}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary Card */}
      {attendance.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Records</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 mb-1">Present</p>
            <p className="text-2xl font-bold text-green-700">{summary.present}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-700">{summary.absent}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">Attendance Rate</p>
            <p className="text-2xl font-bold text-blue-700">{summary.attendanceRate}%</p>
          </div>
        </div>
      )}

      {/* Attendance History Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Attendance History</h2>
          <Link to="/attendance" className="text-sm text-primary-600 hover:text-primary-700">
            View all attendance →
          </Link>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records yet</h3>
            <p className="text-gray-600 mb-4">
              This employee doesn't have any attendance records.
            </p>
            <Link
              to="/attendance"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Mark Attendance</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => {
                  const date = new Date(record.date);
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;