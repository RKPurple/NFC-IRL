import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Editpage from './pages/Editpage';
import InventoryPage from './pages/InventoryPage';
import InventoryItemEditPage from './pages/InventoryItemEditPage';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route element={<RequireAuth/>}>
        <Route element={<Layout/>}>
          <Route path="/" element={<Homepage/>} />
          <Route path="/edit" element={<Editpage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/:id/edit" element={<InventoryItemEditPage />} />
          <Route path="*" element={<Homepage/>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
