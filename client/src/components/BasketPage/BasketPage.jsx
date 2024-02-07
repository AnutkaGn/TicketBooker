import React from 'react';
import Header from '../common/Header/Header';
import './basketPage.css';
import TicketsArray from './TicketsArray/TicketsArray';

const BasketPage = () => {
    return (
        <div className='wrapper-basket-page'>
            <Header/>
            <div style={{height: "100px"}}></div>
            <TicketsArray/>
        </div>
    );
}

export default BasketPage;
