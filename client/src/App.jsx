import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <HomePage/> }/>
          <Route path='/about' element={<div>This page about concert</div>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
