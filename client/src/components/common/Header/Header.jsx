import React from 'react';
import './header.css'
import Drawer from './Drawer/Drawer';
import { observer } from 'mobx-react-lite';
import { store } from '../../../store/UserStore';


const Header = observer(({isAuth}) => {
    let style = {};
    if (isAuth){
        style = {justifyContent: "center"}
    }
    const logOut = () => {
        store.isLogin = false;
        store.login = '';
        store.email = '';
        store.role = '';
        store.userTickets = [];
        store.ticketsToBook = [];
        localStorage.setItem('token', '');
    }

    return (
        <div className='header' style={style}>
            {!isAuth && <Drawer/>}
            <div className='header__box-logo-text'>            
                <a href="/"><img className='header__logo' src="assets/logo.png" alt="logo"/></a>
                <a href="/"><p className='header__text'>Ticket.che</p></a>
            </div>
            {!isAuth &&
            <div className='box-user-basket'>
                <a href={ window.location.pathname !== "/user" ? (store.isLogin ? "/user" : "/auth") : "/" }>
                    <img className='box-user-basket__button' style={{marginTop: "2px"}} 
                        src={window.location.pathname !== "/user" ? "assets/user.png" : "assets/exit.png"} alt="user"
                        onClick={window.location.pathname === "/user" ? () => logOut() : null}
                    />
                </a>
                <a href={ store.isLogin ? "/basket" : "/auth" }>
                    <img className='box-user-basket__button' style={{marginBottom: "2px"}} src="assets/backet.png" alt="backet"/>
                </a>
            </div>
            }
        </div>
    );
});

export default Header;
