import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherPresent from './pages/TeacherPresent';
import StudentJoin from './pages/StudentJoin';
import StudentSession from './pages/StudentSession';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/present/:sessionCode" element={<TeacherPresent />} />
            <Route path="/student/join" element={<StudentJoin />} />
            <Route path="/student/session/:sessionCode" element={<StudentSession />} />
          </Routes>
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
