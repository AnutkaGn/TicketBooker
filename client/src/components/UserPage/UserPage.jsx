import React from 'react';
import Header from '../common/Header/Header';
import UserTicketsArray from './UserTicketsArray/UserTicketsArray'
import './userPage.css';

const UserPage = () => {
    return (
        <div className='wrapper-user-page'>
            <Header/>
            <div style={{marginTop:'100px'}}></div>
            <UserTicketsArray/>
        </div>
    );
}

export default UserPage;
