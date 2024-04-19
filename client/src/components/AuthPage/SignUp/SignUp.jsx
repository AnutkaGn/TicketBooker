import React, { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { signUp } from '../../../http/userAPI';
import { useNavigate } from 'react-router-dom';
import { store } from '../../../store/UserStore';
import './signUp.css';

const SignUp = observer(({changeIsLogin}) => {
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
                store.login = login;
                store.email = email;
                store.role = role;
                store.userTickets = tickets;
                store.isLogin = true;
                navigate('/');
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <div className="wrapper-signUp"> 
            <div className='signUp'>
                <p className='signUp__name-block'>Зареєструватися</p>
                <div className='signUp__box-for-information'>
                    <label htmlFor="password">Електронна пошта</label>
                    <input ref={emailRef} onChange={() => checkEmail()} id='password' type="email" placeholder='Введіть електронну пошту'/>
                    {!isValidEmail && <span style={{color: 'red', fontSize: '10px', marginTop: '3px', width: "270px"}} >Неправильна електронна адреса</span>}
                </div>
                <div className='signUp__box-for-information'>
                    <label htmlFor="username">Ім'я користувача</label>
                    <input ref={loginRef} id='username' type="text" placeholder='Введіть своє і&apos;мя' />
                </div>
                <div className='signUp__box-for-information'>
                    <label htmlFor="password">Пароль</label>
                    <input ref={passwordRef} onChange={() => checkPassword()} id='password' type="password" placeholder='Введіть пароль'/>
                    {!isValidPassword && <span style={{color: 'red', fontSize: '10px', marginTop: '3px', width: "270px"}} >Пароль повинен містити літери, цифри та один спеціальний символ (!, @, #, $, %, ^, &, *)</span>}
                </div>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: '30px'}}>
                    {error && <span style={{color: 'red', fontSize: '10px', marginBottom: '20px'}}>{error}</span>}
                    <button onClick={() => handleClick()} className='signUp-button'>Зареєструватися</button>
                </div>
                <div className='signUp__box-logIn'>
                    <p>Вже маєте обліковий запис?</p>
                    <p className='signUp-logIn-button' style={{textDecoration: 'underline', fontSize: '17px', cursor: 'pointer', marginTop:'-4px'}} onClick={() => changeIsLogin(true)}>Увійти</p>
                </div>
            </div>
        </div>
    );
})

export default SignUp;
