import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import UserPage from './components/UserPage/UserPage';
import BasketPage from './components/BasketPage/BasketPage';
import ConcertPage from './components/ConcertPage/ConcertPage';
import AuthPage from './components/AuthPage/AuthPage';
import HallFilarmoniya from './components/HallFilarmoniya/HallFilarmoniya';
import { useEffect } from "react";
import { observer } from 'mobx-react-lite';
import { check } from './http/userAPI';
import HallDruzhbaNarodiv from './components/HallDruzhbaNarodiv/HallDruzhbaNarodiv';
import HallDramteatr from './components/HallDramteatr/HallDramteatr';
import { store } from './store/UserStore';
import AdminPanel from './components/AdminPanel/AdminPanel';


const App = observer(() => {
  useEffect(() => {
    const checkUser = async() => {
      const {login, email, role, tickets, message} = await check();
      if (message) {
        console.log(message);
        return;
      }
      store.login = login;
      store.email = email;
      store.role = role;
      store.userTickets = tickets;
      store.isLogin = true;
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
          <Route path='/druzhba' element={ <HallDruzhbaNarodiv/> }/>
          <Route path='/dram' element={ <HallDramteatr/> }/>
          <Route path='/create' element={ <AdminPanel/> }/>
          <Route path="*" element={<Navigate to="/"/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
});

export default App;
