import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employee from './pages/Employee';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import EmployeeDetail from './pages/EmployeeDetail';
import Attendance from './pages/Attendance';
import AttendanceManagement from './pages/AttendanceManagement'; // New import

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employee />} />
          <Route path="/employees/add" element={<AddEmployee />} />
          <Route path="/employees/edit/:id" element={<EditEmployee />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/manage" element={<AttendanceManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;