import { BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import LogIn from './components/LogIn/LogIn';
import SignUp from './components/SignUp/SignUp';
import UserPage from './components/UserPage/UserPage';
import BasketPage from './components/BasketPage/BasketPage';
import ConcertPage from './components/ConcertPage/ConcertPage';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <HomePage/> }/>
          <Route path='/logIn' element={ <LogIn/> }/>
          <Route path='/signUp' element={ <SignUp/> }/>
          <Route path='/user' element={ <UserPage/> }/>
          <Route path='/basket' element={ <BasketPage/> }/>
          <Route path='/concert' element={ <ConcertPage/> }/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
