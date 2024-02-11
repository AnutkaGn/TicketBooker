import React from 'react';
import './ticketsArray.css';
import TicketItem from './TicketItem/TicketItem';

const TicketsArray = () => {
    return (
        <div className='basket-tickets'>
            <TicketItem/>
            <TicketItem/>
            <TicketItem/>
            <TicketItem/>
            <div className='basket-tickets__box-button-price'>
                <a href="http://localhost:3000/basket"><input type="button" value={"Забронювати"}/></a>
                <p>Разом: 500 грн</p>
            </div>
        </div>
    );
}

export default TicketsArray;
 