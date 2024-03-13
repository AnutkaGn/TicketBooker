import React, {useEffect, useState} from 'react';
import './userTicketsArray.css';
import UserTicketItem from './UserTicketItem/UserTicketItem';
import { getUserTickets } from '../../../http/ticketAPI';
import { getAboutConcert } from '../../../http/concertAPI';
import moment from 'moment';

const UserTicket = () => {
    const [bookedTickets, setBookedTickets] = useState([]);
    useEffect( () => {
        const fetchTickets = async () => {
            const data = await getUserTickets();
            const filterTickets = data.userTickets.filter(ticket => ticket.booked)
            const tickets = await Promise.all(filterTickets.map(async (t) => {
                const concertData = await getAboutConcert(t.concertId);
                return {
                    ...t,
                    name: concertData.name,
                    venue: concertData.venue,
                    dateTime: concertData.dateTime,
                    type: concertData.type
                };
            }));
            setBookedTickets(tickets);
        }
        fetchTickets();
    }, [])    
    return (
        <div>
            <p className='user-page__text'>Ваші заброньовані квиточки чекають вас!</p>
            {bookedTickets.filter(ticket => moment(ticket.dateTime) >= moment()).map(t => (
                <UserTicketItem key={t._id} ticket={t}/>
            ))}
            <p className='user-page__text'>Спогади! Ви відвідували ці заходи</p>
            {bookedTickets.filter(ticket => moment(ticket.dateTime) <= moment()).map(t => (
                <UserTicketItem key={t._id} ticket={t}/>
            ))}
        </div> 
    );
}

export default UserTicket;
