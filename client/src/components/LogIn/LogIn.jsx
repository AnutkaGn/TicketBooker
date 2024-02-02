import React from 'react';
import './logIn.css'

const LogIn = () => {
    return (
        <div className="wrapper-logIn"> 
            <div className='logIn'>
                <p className='logIn__name-block'>Log In</p>
                <p className='logIn__text'>Log in here username and password</p>
                <div className='logIn__box-for-information'>
                    <label htmlFor="username">Username</label>
                    <input id='username' type="text" placeholder='Введіть своє і&apos;мя' />
                </div>
                <div className='logIn__box-for-information'>
                    <label htmlFor="password">Password</label>
                    <input id='password' type="text" placeholder='Введіть пароль'/>
                </div>
                <button className='logIn-button'>Log In</button>
                <div className='logIn__box-signUp'>
                    <p>Don't have an account?</p>
                    <a href="">Sign Up</a>
                </div>
            </div>
        </div>
    );
}

export default LogIn;
