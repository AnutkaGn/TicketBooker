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
    return (
        <div className='header' style={style}>
            {!isAuth && <Drawer/>}
            <div className='header__box-logo-text'>            
                <a href="/"><img className='header__logo' src="assets/logo.png" alt="logo"/></a>
                <a href="/"><p className='header__text'>Ticket.che</p></a>
            </div>
            {!isAuth &&
            <div className='box-user-basket'>
                <a href={ store.isLogin ? "/user" : "/auth" }><img className='box-user-basket__button' style={{marginTop: "2px"}} src="assets/user.png" alt="user" /></a>
                <a href={ store.isLogin ? "/basket" : "/auth" }><img className='box-user-basket__button' style={{marginBottom: "2px"}} src="assets/backet.png" alt="backet"/></a>
            </div>
            }
        </div>
    );
});

export default Header;
