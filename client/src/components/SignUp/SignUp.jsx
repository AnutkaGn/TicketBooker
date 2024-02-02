import React from 'react';
import './signUp.css';

const SignUp = () => {
    return (
        <div className="wrapper-signUp"> 
            <div className='signUp'>
                <p className='signUp__name-block'>Sign Up</p>
                <div className='signUp__box-for-information'>
                    <label htmlFor="username">Username</label>
                    <input id='username' type="text" placeholder='Введіть своє і&apos;мя' />
                </div>
                <div className='signUp__box-for-information'>
                    <label htmlFor="password">Email</label>
                    <input id='password' type="email" placeholder='Введіть електронну пошту'/>
                </div>
                <div className='signUp__box-for-information'>
                    <label htmlFor="password">Password</label>
                    <input id='password' type="password" placeholder='Введіть пароль'/>
                </div>
                <button className='signUp-button'>Sign Up</button>
                <div className='signUp__box-logIn'>
                    <p>Do you have an account?</p>
                    <a href="">Log In</a>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
