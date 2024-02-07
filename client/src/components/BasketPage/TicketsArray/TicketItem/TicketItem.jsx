import React from 'react';
import './ticketItem.css';

const TicketItem = () => {
    return (
       <div>
            <div className='basket-item-wrapper'>
                <img className='basket-item__image-ticket' src="assets/ticket.png" alt="ticket"/>
                <div className='basket-item__main-information'>
                    <p className='main-information__floor-row-seat'> Партер, Ряд: 4, Місце: 23</p>
                    <p className='main-information__name'>Рок канікули. Весела музичнапоп-рок страшилка</p>
                    <p className='main-information__date-venue'>14 квітня, 16:00. Міський будинок культури ім. Івана Кулика</p>
                </div>
                <div className='basket-item__box-price'>
                    <p>590 грн</p>
                </div>
                <img className='basket-item__image-cancel' src="assets/cancel.png" alt="cancel" />
            </div>
            <hr className='basket-line'/> 
        </div>
    );
}

export default TicketItem;
