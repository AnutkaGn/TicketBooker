import React, { useContext, useRef, useState } from 'react';
import './logIn.css'
import { observer } from 'mobx-react-lite';
import { Context } from '../../..';
import { logIn } from '../../../http/userAPI';
import { useNavigate } from 'react-router-dom';

const LogIn = observer(() => {
    const {user} = useContext(Context);
    const loginRef = useRef();
    const passwordRef = useRef();
    const [isValid, setIsValid] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const checkPassword = () => {
        const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
        if(passwordRef.current.value.match(regexp)) setIsValid(true);
        else setIsValid(false);
    }
    const handleClick = async () => {
        if (isValid){
            try {
                const {login, email, role, tickets, message} = await logIn(loginRef.current.value, passwordRef.current.value);
                console.log(login, email, role, tickets, message)
                if(!message) {
                    console.log(message);
                    setError(message);
                    return;
                }
                user.login = login;
                user.email = email;
                user.role = role;
                user.tickets = tickets;
                navigate('/');
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <div className="wrapper-logIn"> 
            <div className='logIn'>
                <p className='logIn__name-block'>Log In</p>
                <p className='logIn__text'>Log in here username and password</p>
                <div className='logIn__box-for-information'>
                    <label htmlFor="username">Username</label>
                    <input ref={loginRef} id='username' type="text" placeholder='Введіть своє і&apos;мя' />
                </div>
                <div className='logIn__box-for-information'>
                    <label htmlFor="password">Password</label>
                    <input onChange={() => checkPassword()} ref={passwordRef} id='password' type="password" placeholder='Введіть пароль'/>
                    {!isValid && <span style={{color: 'red', fontSize: '14px', marginTop: '3px', width: "300px"}} >Пароль повинен містити літери, цифри та один спеціальний символ (!, @, #, $, %, ^, &, *)</span>}
                </div>
                {error && <span style={{color: 'red', fontSize: '14px', width: '300px'}}>{error}</span>}
                <button onClick={() => handleClick()} className='logIn-button'>Log In</button>
                <div className='logIn__box-signUp'>
                    <p>Don't have an account?</p>
                    <p style={{textDecoration: 'underline', fontSize: '20px', cursor: 'pointer'}} onClick={() => user.isLogin = false}>Sign Up</p>
                </div>
            </div>
        </div>
    );
})

export default LogIn;
