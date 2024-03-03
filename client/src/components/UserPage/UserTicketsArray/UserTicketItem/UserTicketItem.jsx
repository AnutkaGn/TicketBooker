import React, { useEffect, useState } from 'react';
import './userTicketItem.css';
import { getAboutConcert } from '../../../../http/concertAPI';
import moment from 'moment';
import 'moment/locale/uk';

const UserTicketItem = ({ticket}) => {
    const [concert, setConcert] = useState('');
    useEffect(() => {
        const fetchConcert = async () => {
            const data = await getAboutConcert(ticket.concertId);
            setConcert(data);
        }
        fetchConcert();
    }, [])
    

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
        <div className='user-ticket-card'>
            <div className='user-ticket-card__date'><span>{moment(concert.dateTime).locale('uk').format('D MMMM HH:mm').split(' ')[0]}</span>
            <span>{moment(concert.dateTime).locale('uk').format('D MMMM HH:mm').split(' ')[1]}</span>
            <span>{moment(concert.dateTime).locale('uk').format('D MMMM HH:mm').split(' ')[2]}</span></div>
            <img src="assets/poster.png" alt="poster"/>
            <div className='user-ticket-wrapper-information'>
                <p className='user-ticket-card__floor-row-seat'>{floor}, Ряд: {ticket.row}, Місце: {ticket.seat}</p>
                <p className='user-ticket-card__name'>{concert?.name}</p>
                <p className='user-ticket-card__type'>{concert?.type}</p>
                <p className='user-ticket-card__venue'>{concert?.venue}</p>
            </div>
        </div> 
    );
}

export default UserTicketItem;
