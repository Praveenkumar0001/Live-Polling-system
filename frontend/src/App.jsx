import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import StudentEnterName from './components/Student/StudentEnterName';
import StudentWaiting from './components/Student/StudentWaiting';
import StudentQuestion from './components/Student/StudentQuestion';
import StudentResults from './components/Student/StudentResults';
import StudentKickedOut from './components/Student/StudentKickedOut';
import TeacherJoin from './components/Teacher/TeacherJoin';
import TeacherCreateQuestion from './components/Teacher/TeacherCreateQuestion';
import TeacherResults from './components/Teacher/TeacherResults';
import TeacherPollHistory from './components/Teacher/TeacherPollHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Student Routes */}
        <Route path="/student/enter-name" element={<StudentEnterName />} />
        <Route path="/student/waiting" element={<StudentWaiting />} />
        <Route path="/student/question" element={<StudentQuestion />} />
        <Route path="/student/results" element={<StudentResults />} />
        <Route path="/student/kicked" element={<StudentKickedOut />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/join" element={<TeacherJoin />} />
        <Route path="/teacher/create-question" element={<TeacherCreateQuestion />} />
        <Route path="/teacher/results" element={<TeacherResults />} />
        <Route path="/teacher/poll-history" element={<TeacherPollHistory />} />
      </Routes>
    </Router>
  );
}

export default App;