import React from 'react';
import Header from '../common/Header/Header';
import UserTicketsArray from './UserTicketsArray/UserTicketsArray'
import './userPage.css';

const UserPage = () => {
    return (
        <div className='wrapper-user-page'>
            <Header/>
            <div style={{marginTop:'100px'}}></div>
            <p className='user-page__text'>Ваші заброньовані квиточки чекають вас!</p>
            <UserTicketsArray/>
            <p className='user-page__text'>Спогади! Ви відвідували ці заходи</p>
        </div>
    );
}

export default UserPage;
