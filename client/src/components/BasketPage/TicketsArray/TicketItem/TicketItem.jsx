import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { observer } from 'mobx-react-lite';
import { getAboutConcert } from '../../../../http/concertAPI';
import { deleteTicket } from '../../../../http/ticketAPI';
import { check } from '../../../../http/userAPI';
import { floorLocalization, venueConcert } from '../../../../consts';
import { store } from '../../../../store/UserStore';
import './ticketItem.css';

const TicketItem = observer(({ticket, func}) => {
    const [concert, setConcert] = useState('');
    useEffect(() => { 
        const fetchConcert = async () => {
            const data = await getAboutConcert(ticket.concertId);
            setConcert(data);
        }
        const checkUser = async() => {
            const {login, email, role, tickets, message} = await check();
            store.login = login;
            store.email = email;
            store.role = role;
            store.userTickets = tickets;
            if (message) console.log(message);
        }
        fetchConcert();
        checkUser(); 

    }, []);
    const deleteFromBasket = async(id) => {
        const dataTicket = await deleteTicket(id);
        func(prev => prev.filter(ticket => JSON.stringify(ticket) !== JSON.stringify(dataTicket.deletedTicket)));
    }
    const floor = floorLocalization[ticket.floor]
    const venue = venueConcert[concert?.venue]?.hall
    return (
       <div style={{display:'flex', flexDirection: 'column'}}>
            <div className='basket-item-wrapper'>
                <img className='basket-item__image-ticket' src="assets/ticket.png" alt="ticket"/>
                <div className='basket-item__main-information'>
                    <p className='main-information__floor-row-seat'> {floor}, Ряд: {ticket.row}, Місце: {ticket.seat}</p>
                    <p className='main-information__name'>{concert?.name}</p>
                    <p className='main-information__date-venue'>{moment(concert?.dateTime).format('D MMMM HH:mm')}. {venue}</p>
                </div>
                <div className='basket-item__box-price'>
                    <p>{ticket.price} грн</p>
                </div>
                <img className='basket-item__image-cancel' src="assets/cancel.png" alt="cancel" onClick={() => deleteFromBasket(ticket._id)} />
            </div>
            <div className='basket-line'/> 
        </div>
    );
});

export default TicketItem;
