import React from 'react';
import './ticketsPriceSum.css'

const TicketsPriceSum = ({priceTickets}) => {

    return (
        <div className='wrapper-add-to-basket'>
            <button className='add-to-basket__button'>Перейти до корзини</button>
            <div className='add-to-basket__footer'>
                <p>{`Сума (${priceTickets.length}шт.): ${priceTickets.reduce((sum, ticket) => sum + ticket.price, 0)} грн`}</p>
            </div>
        </div>
    );
}

export default TicketsPriceSum;
