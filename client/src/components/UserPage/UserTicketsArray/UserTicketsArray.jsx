import React, {useEffect, useState} from 'react';
import './userTicketsArray.css';
import UserTicketItem from './UserTicketItem/UserTicketItem';
import { getUserTickets } from '../../../http/ticketAPI';

const UserTicket = () => {
    const [bookedTickets, setBookedTickets] = useState([]);
    useEffect( () => {
        const fetchTickets = async () =>{
            const data = await getUserTickets();
            setBookedTickets(data.userTickets.filter(ticket => ticket.booked));
        }
        fetchTickets();
    }, [])
    return (
        <div>
            <p className='user-page__text'>Ваші заброньовані квиточки чекають вас!</p>
            {bookedTickets.map(ticket => (
                <UserTicketItem key={ticket._id} ticket={ticket}/>
            ))}
            <p className='user-page__text'>Спогади! Ви відвідували ці заходи</p>
            {bookedTickets.map(ticket => (
                <UserTicketItem key={ticket._id} ticket={ticket}/>
            ))}
        </div> 
    );
}

export default UserTicket;
