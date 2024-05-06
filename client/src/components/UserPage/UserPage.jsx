import React from 'react';
import Header from '../common/Header/Header';
import UserTicketsArray from './UserTicketsArray/UserTicketsArray';
import Footer from '../common/Footer/Footer';
import './userPage.css';

const UserPage = () => {
    return (
        <div className='wrapper-user-page'>
            <Header/>
            <UserTicketsArray/>
        </div>
    );
}

export default UserPage;
