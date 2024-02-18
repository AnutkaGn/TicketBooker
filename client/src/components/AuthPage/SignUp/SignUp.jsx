import React, { useContext, useRef, useState } from 'react';
import './signUp.css';
import { observer } from 'mobx-react-lite';
import { Context } from '../../..';
import { signUp } from '../../../http/userAPI';
import { useNavigate } from 'react-router-dom';

const SignUp = observer(() => {
    const {user} = useContext(Context);
    const loginRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const checkEmail = () => {
        const regexp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
        if(emailRef.current.value.match(regexp)) setIsValidEmail(true);
        else setIsValidEmail(false);
    }

    const checkPassword = () => {
        const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
        if(passwordRef.current.value.match(regexp)) setIsValidPassword(true);
        else setIsValidPassword(false);
    }

    const handleClick = async () => {
        if (isValidEmail && isValidPassword){
            try {
                const {login, email, role, tickets, message} = await signUp(loginRef.current.value, emailRef.current.value, passwordRef.current.value);
                if(message) {
                    setError(message);
                    return;
                }
                user.login = login;
                user.email = email;
                user.role = role;
                user.userTickets = tickets;
                navigate('/');
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <div className="wrapper-signUp"> 
            <div className='signUp'>
                <p className='signUp__name-block'>Sign Up</p>
                <div className='signUp__box-for-information'>
                    <label htmlFor="password">Email</label>
                    <input ref={emailRef} onChange={() => checkEmail()} id='password' type="email" placeholder='Введіть електронну пошту'/>
                    {!isValidEmail && <span style={{color: 'red', fontSize: '14px', marginTop: '3px', width: "300px"}} >Неправильна електронна адреса</span>}
                </div>
                <div className='signUp__box-for-information'>
                    <label htmlFor="username">Username</label>
                    <input ref={loginRef} id='username' type="text" placeholder='Введіть своє і&apos;мя' />
                </div>
                <div className='signUp__box-for-information'>
                    <label htmlFor="password">Password</label>
                    <input ref={passwordRef} onChange={() => checkPassword()} id='password' type="password" placeholder='Введіть пароль'/>
                    {!isValidPassword && <span style={{color: 'red', fontSize: '14px', marginTop: '3px', width: "300px"}} >Пароль повинен містити літери, цифри та один спеціальний символ (!, @, #, $, %, ^, &, *)</span>}
                </div>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: '40px'}}>
                    {error && <span style={{color: 'red', fontSize: '16px', marginBottom: '30px'}}>{error}</span>}
                    <button onClick={() => handleClick()} className='signUp-button'>Sign Up</button>
                </div>
                <div className='signUp__box-logIn'>
                    <p>Do you have an account?</p>
                    <p style={{textDecoration: 'underline', fontSize: '20px', cursor: 'pointer'}} onClick={() => user.isLogin = true}>Log In</p>
                </div>
            </div>
        </div>
    );
})

export default SignUp;
