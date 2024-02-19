import { BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import UserPage from './components/UserPage/UserPage';
import BasketPage from './components/BasketPage/BasketPage';
import ConcertPage from './components/ConcertPage/ConcertPage';
import AuthPage from './components/AuthPage/AuthPage';
import HallFilarmoniya from './components/HallFilarmoniya/HallFilarmoniya';
import { Context } from "./index";
import { useContext, useEffect } from "react";
import { observer } from 'mobx-react-lite';
import { check } from './http/userAPI';

const App = observer(() => {
  const { user } = useContext(Context);
  useEffect(() => {
    const checkUser = async() => {
      const {login, email, role, tickets, message} = await check();
      user.login = login;
      user.email = email;
      user.role = role;
      user.userTickets = tickets;
      if (message) console.log(message);
    }
    checkUser();
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <HomePage/> }/>
          <Route path='/auth' element={ <AuthPage/> }/>
          <Route path='/user' element={ <UserPage/> }/>
          <Route path='/basket' element={ <BasketPage/> }/>
          <Route path='/concert/:id' element={ <ConcertPage/> }/>
          <Route path='/fila' element={ <HallFilarmoniya/> }/>
        </Routes>
      </BrowserRouter>
    </div>
  );
});

export default App;
