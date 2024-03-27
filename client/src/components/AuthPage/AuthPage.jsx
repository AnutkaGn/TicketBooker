import React from 'react';
import Header from '../common/Header/Header';
import { observer } from 'mobx-react-lite';
import LogIn from './LogIn/LogIn';
import SignUp from './SignUp/SignUp';
import { store } from '../../store/UserStore';

const AuthPage = observer(() => {
    return (
        <div>
            <Header isAuth={true}/>
            {store.isLogin ? <LogIn /> : <SignUp />}
        </div>
    );
})

export default AuthPage;
