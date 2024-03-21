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
        <div className="wrapper-logIn"> 
            <div className='logIn'>
                <p className='logIn__name-block'>Авторизуватися </p>
                <p className='logIn__text'></p>
                <div className='logIn__box-for-information'>
                    <label htmlFor="username">Ім'я користувача</label>
                    <input ref={loginRef} id='username' type="text" placeholder='Введіть своє і&apos;мя' />
                </div>
                <div className='logIn__box-for-information'>
                    <label htmlFor="password">Пароль</label>
                    <input onChange={() => checkPassword()} ref={passwordRef} id='password' type="password" placeholder='Введіть пароль'/>
                    {!isValid && <span style={{color: 'red', fontSize: '10px', marginTop: '3px', width: "270px", alignSelf: 'center'}} >Пароль повинен містити літери, цифри та один спеціальний символ (!, @, #, $, %, ^, &, *)</span>}
                </div>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: '40px'}}>
                    {error && <span style={{color: 'red', fontSize: '10px', marginBottom: '30px'}}>{error}</span>}
                    <button onClick={() => handleClick()} className='logIn-button'>Увійти</button>
                </div>
                <div className='logIn__box-signUp'>
                    <p>Немає облікового запису?</p>
                    <p  className='logIn-signUp-button' style={{textDecoration: 'underline', fontSize: '17px', cursor: 'pointer', marginTop: '-2px'}} onClick={() => user.isLogin = false}>Зареєструватися</p>
                </div>
            </div>
        </div>
    );
})

export default LogIn;
