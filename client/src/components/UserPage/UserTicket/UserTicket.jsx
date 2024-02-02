import React from 'react';
import './userTicket.css';
//import moment from 'moment';
//import 'moment/locale/uk';

const UserTicket = () => {

    //const formattedDate = moment(ticket.dateTime).locale('uk').format('D MMMM HH:mm');
    //const dateParts = formattedDate.split(' ');
    return (
        <div className='ticket-card'>
            <div className='ticket-card__date'><span>20</span><span>квітня</span><span>14:00</span></div>
            <img src="assets/poster.png" alt="poster"/>
            <div className='ticket-wrapper-information'>
                <p className='ticket-card__floor-row-seat'> Партер, Ряд: 4, Місце: 23</p>
                <p className='ticket-card__name'>Рок канікули. Весела музичнапоп-рок страшилка</p>
                <p className='ticket-card__type'>Стенд-ап</p>
                <p className='ticket-card__venue'>Міський будинок культури ім. Івана Кулика</p>
            </div>

        </div>
        
    );
}

export default UserTicket;
