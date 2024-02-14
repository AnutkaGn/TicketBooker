import { BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import UserPage from './components/UserPage/UserPage';
import BasketPage from './components/BasketPage/BasketPage';
import ConcertPage from './components/ConcertPage/ConcertPage';
import AuthPage from './components/AuthPage/AuthPage';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <HomePage/> }/>
          <Route path='/auth' element={ <AuthPage/> }/>
          <Route path='/user' element={ <UserPage/> }/>
          <Route path='/basket' element={ <BasketPage/> }/>
          <Route path='/concert/:id' element={ <ConcertPage/> }/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
