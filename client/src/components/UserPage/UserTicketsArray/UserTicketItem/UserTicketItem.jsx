import React from 'react';
import './userTicketItem.css';
import moment from 'moment';
import 'moment/locale/uk';
import { floorLocalization } from '../../../../consts';


const UserTicketItem = ({ticket}) => {
    const floor = floorLocalization[ticket.floor]
    const data = ticket.dateTime.slice(0, ticket.dateTime.length-5)
    return (
        <div className='user-ticket-card'>
            <div className='user-ticket-card__date'><span>{moment(ticket.dateTime).locale('uk').format('D MMMM HH:mm').split(' ')[0]}</span>
            <span>{moment(data).locale('uk').format('D MMMM HH:mm').split(' ')[1]}</span>
            <span>{moment(data).locale('uk').format('D MMMM HH:mm').split(' ')[2]}</span></div>
            <img src="assets/poster.png" alt="poster"/>
            <div className='user-ticket-wrapper-information'>
                <p className='user-ticket-card__floor-row-seat'>{floor}, Ряд: {ticket.row}, Місце: {ticket.seat}</p>
                <p className='user-ticket-card__name'>{ticket.name}</p>
                <p className='user-ticket-card__type'>{ticket.type}</p>
                <p className='user-ticket-card__venue'>{ticket.venue}</p>
            </div>
        </div> 
    );
}

export default UserTicketItem;
