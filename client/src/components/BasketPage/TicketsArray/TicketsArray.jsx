import React, {useState, useEffect} from 'react';
import './ticketsArray.css';
import TicketItem from './TicketItem/TicketItem';
import { bookManyTickets, getUserTickets } from '../../../http/ticketAPI';


const TicketsArray = () => {
    const [selectedTickets, setSelectedTickets] = useState([]);
    useEffect(() => {
        const fetchTickets = async () =>{
            const data = await getUserTickets();
            setSelectedTickets(data.userTickets.filter(ticket => !ticket.booked));
        }
        fetchTickets();
    }, []);
    
    const bookTickets = async(tickets) => {
        await bookManyTickets(tickets);
        setSelectedTickets(prev => prev.filter(ticket => !tickets.includes(ticket._id))) 
        alert("Ваші квиткочки успішно заброньовані!")
    }

    if (!selectedTickets.length) return (
        <div className='basket-tickets'>
            <div className='wrapper-basket-empty'>
                <p>Кошик порожній...</p>
                <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                    <p style={{fontSize: 20, marginTop:'-5px', fontWeight: 400, paddingRight:5}}>За квиточками тобі</p>
                    <a href="/" style={{fontSize: 23, marginTop:'-5px', fontWeight: 600, cursor:'pointer', color: '#FFB800', marginBottom: '20px'}}> сюди</a>
                </div>
            </div>
        </div>
    )
    else return (
        <div className='basket-tickets'>
            {selectedTickets.map(ticket => (
                <TicketItem key={ticket._id} ticket={ticket} func={setSelectedTickets}/>
            ))}
            <div className='basket-tickets__box-button-price'>
                <input type="button" value={"Забронювати"} onClick={() => bookTickets(selectedTickets.map(ticket => ticket._id))}/>
                <p>Разом: {selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0)}  грн</p>
            </div>
        </div>
    );
}

export default TicketsArray;
 