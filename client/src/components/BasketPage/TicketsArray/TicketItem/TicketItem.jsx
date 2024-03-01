import React, { useContext, useEffect, useState } from 'react';
import './ticketItem.css';
import moment from 'moment';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../..';
import { getAboutConcert } from '../../../../http/concertAPI';
import { deleteTicket } from '../../../../http/ticketAPI';
import { check, deleteFromTickets } from '../../../../http/userAPI';

const TicketItem = observer(({ticket, func}) => {
    const {user} = useContext(Context);
    const [concert, setConcert] = useState('');
    useEffect(() => { 
        const fetchConcert = async () => {
            const data = await getAboutConcert(ticket.concertId);
            setConcert(data);
        }
        const checkUser = async() => {
            const {login, email, role, tickets, message} = await check();
            user.login = login;
            user.email = email;
            user.role = role;
            user.userTickets = tickets;
            if (message) console.log(message);
          }

        fetchConcert();
        checkUser(); 

    }, []);
    const deleteFromBasket = async(id) => {
        const dataTicket = await deleteTicket(id);
        console.log(id)
        console.log(dataTicket);
        func(prev => prev.filter(ticket => JSON.stringify(ticket) !== JSON.stringify(dataTicket.deletedTicket)));
    }
    
    let floor;
    const floorUA = {
        'parterre': 'Партер',
        'balcony': 'Балкон',
        'leftLoggia': 'Ліва лоджія',
        'rightLoggia': 'Права лоджія',
        'mezzanine': 'Бельетаж',
        'mezzanineLoggia1': 'Бельетаж сектор 1',
        'mezzanineLoggia2': 'Бельетаж сектор 2',
        'mezzanineLoggia3': 'Бельетаж сектор 3',
        'mezzanineLoggia4': 'Бельетаж сектор 4',
        'mezzanineLoggia5': 'Бельетаж сектор 5',
        'mezzanineLoggia6': 'Бельетаж сектор 6',
        'balconyLoggia1': 'Балкон сектор 1',
        'balconyLoggia2': 'Балкон сектор 2',
        'balconyLoggia3': 'Балкон сектор 3',
        'balconyLoggia4': 'Балкон сектор 4',
        'balconyLoggia5': 'Балкон сектор 5',
        'balconyLoggia6': 'Балкон сектор 6',
        'baignoire1': 'Бенуар 1',
        'baignoire2': 'Бенуар 2',
    }

    floor = floorUA[ticket.floor]
    return (
       <div>
            <div className='basket-item-wrapper'>
                <img className='basket-item__image-ticket' src="assets/ticket.png" alt="ticket"/>
                <div className='basket-item__main-information'>
                    <p className='main-information__floor-row-seat'> {floor}, Ряд: {ticket.row}, Місце: {ticket.seat}</p>
                    <p className='main-information__name'>{concert?.name}</p>
                    <p className='main-information__date-venue'>{moment(concert?.dateTime).locale('uk').format('D MMMM HH:mm')}. {concert?.venue}</p>
                </div>
                <div className='basket-item__box-price'>
                    <p>{ticket.price} грн</p>
                </div>
                <img className='basket-item__image-cancel' src="assets/cancel.png" alt="cancel" onClick={() => deleteFromBasket(ticket._id)} />
            </div>
            <hr className='basket-line'/> 
        </div>
    );
});

export default TicketItem;
