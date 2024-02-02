import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LogIn from './components/LogIn/LogIn';
import SignUp from './components/SignUp/SignUp';
import UserPage from './components/UserPage/UserPage';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <HomePage/> }/>
          <Route path='/about' element={<div>This page about concert</div>}/>
          <Route path='/logIn' element={<LogIn/>}/>
          <Route path='/signUp' element={<SignUp/>}/>
          <Route path='/user' element={<UserPage/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
