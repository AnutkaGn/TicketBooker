import React, { useContext } from 'react';
import Header from '../common/Header/Header';
import { observer } from 'mobx-react-lite';
import { Context } from '../..';
import LogIn from './LogIn/LogIn';
import SignUp from './SignUp/SignUp';

const AuthPage = observer(() => {
    const {user} = useContext(Context);

    return (
        <div style={{height: '100%'}}>
            <Header />
            {user.isLogin ? <LogIn /> : <SignUp />}
        </div>
    );
})

export default AuthPage;
