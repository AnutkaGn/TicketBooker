import React from 'react';
import './userTicketItem.css';
import moment from 'moment';
import 'moment/locale/uk';
import { floorLocalization, arrayBufferToBase64, venueConcert, typeConcert} from '../../../../consts';


const UserTicketItem = ({ticket}) => {
    const floor = floorLocalization[ticket.floor]
    const date = ticket.dateTime.slice(0, ticket.dateTime.length-5)
    const venue = venueConcert[ticket.venue].address
    const place = venueConcert[ticket.venue].hall
    const type = typeConcert[ticket.type]
    return (
        <div className='user-ticket-card'>
            <img className='user__image-poster' src={`data:${ticket.image.mimetype};base64,${arrayBufferToBase64(ticket.image.buffer?.data)}`} alt="poster"/>
            <div className='user-ticket-wrapper-information'>
            <p className='user-ticket-card__floor-row-seat'>{floor}, Ряд: {ticket.row}, Місце: {ticket.seat}</p>
                <p className='user-ticket-card__date'> {moment(date).locale('uk').format('D MMMM HH:mm')}</p>
                <p className='user-ticket-card__name'>{ticket.name}</p>
                <p className='user-ticket-card__type'>{type}</p>
                <p className='user-ticket-card__venue'>{venue}</p>
                <p className='user-ticket-card__place'>{place}</p>
            </div>
            <div className='user-ticket-card__dots'>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div> 
    );
}

export default UserTicketItem;
