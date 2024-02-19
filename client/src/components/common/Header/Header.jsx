import React from 'react';
import './header.css'

const Header = ({isAuth}) => {
    let style = {};
    if (isAuth){
        style = {justifyContent: "center"}
    }
    return (
        <div className='header' style={style}>
            {!isAuth && <a href="/"><img className='header__button' src="assets/button.svg" alt="button"/></a>}
            <div className='header__box-logo-text'>            
                <a href="/"><img className='header__logo' src="assets/logo.png" alt="logo"/></a>
                <a href="/"><p className='header__text'>Ticket.che</p></a>
            </div>
            {!isAuth &&
            <div className='box-user-basket'>
                <a href="/auth"><img className='box-user-basket__button' src="assets/user.png" alt="user" /></a>
                <img className='box-user-basket__button' src="assets/backet.png" alt="backet"/>
            </div>
            }
        </div>
    );
}

export default Header;
