import React, {useState, useEffect} from 'react';
import './ticketsArray.css';
import TicketItem from './TicketItem/TicketItem';
import { getUserTickets } from '../../../http/ticketAPI';



const TicketsArray = () => {
    const [selectedTickets, setSelectedTickets] = useState([]);
    useEffect(() => {
        const fetchTickets = async () =>{
            const response = await getUserTickets();
            setSelectedTickets(response.userTickets.filter(ticket => !ticket.booked));
        }
        fetchTickets(); 
    }, []);
    return (
        <div className='basket-tickets'>
            {selectedTickets.map(ticket => (
                <TicketItem key={ticket._id} ticket={ticket} func={setSelectedTickets}/>
            ))}
            <div className='basket-tickets__box-button-price'>
                <a href="http://localhost:3000/basket"><input type="button" value={"Забронювати"}/></a>
                <p>Разом: {selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0)}  грн</p>
            </div>
        </div>
    );
}

export default TicketsArray;
 