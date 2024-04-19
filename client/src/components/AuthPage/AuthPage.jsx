import React, { useState } from 'react';
import Header from '../common/Header/Header';
import LogIn from './LogIn/LogIn';
import SignUp from './SignUp/SignUp';

const AuthPage = () => {
const [isLogin, setIsLogin] = useState(true);

    return (
        <div>
            <Header isAuth={true}/>
            {isLogin ? <LogIn changeIsLogin={setIsLogin} /> : <SignUp changeIsLogin={setIsLogin} />}
        </div>
    );
};

export default AuthPage;
