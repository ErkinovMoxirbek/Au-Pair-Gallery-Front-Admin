import { Routes, Route } from 'react-router-dom';
import Jazo from './components/auth/Jazo';

function App() {
  return (
      <Routes>
        
        <Route path="*" element={<Jazo />} />
      </Routes>
  );
}

export default App;