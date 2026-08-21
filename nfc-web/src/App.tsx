import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route element={<RequireAuth/>}>
        <Route path="/" element={<Homepage/>} />
        <Route path="*" element={<Homepage/>} />
      </Route>
    </Routes>
  );
}

export default App;
