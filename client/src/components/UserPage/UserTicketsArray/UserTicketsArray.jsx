import React, {useEffect, useState} from 'react';
import './userTicketsArray.css';
import UserTicketItem from './UserTicketItem/UserTicketItem';
import { getUserTickets } from '../../../http/ticketAPI';
import { getAboutConcert } from '../../../http/concertAPI';
import moment from 'moment';


const LoadingPage = () =>{
    return (
        <div className='wrapper-loading-page'>
            <div className="bouncing-loader">          
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
} 

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
                    type: concertData.type,
                    image: concertData.image
                };
            }));
            setBookedTickets(tickets);
        }
        fetchTickets();
    }, [])  
    if (!bookedTickets.length) return( <LoadingPage/> )  
    else return (
        <div>
            <p className='user-page__text'>Заброньовані квиточки</p>
            {bookedTickets.filter(ticket => moment(ticket.dateTime) >= moment()).map(t => (
                <UserTicketItem key={t._id} ticket={t}/>
            ))}
            <p className='user-page__text'>Спогади! Ви відвідували ці заходи</p>
            {bookedTickets.filter(ticket => moment(ticket.dateTime) <= moment()).map(t => (
                <div style={{backgroundColor: 'black', opacity:'0.7'}}><UserTicketItem key={t._id} ticket={t}/></div>
                
            ))}
        </div> 
    );
}

export default UserTicket;
