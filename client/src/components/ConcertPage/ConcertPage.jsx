import React, { useEffect, useContext, useState } from 'react';
import './concertPage.css'
import Header from '../common/Header/Header';
import AboutConcert from './AboutConcert/AboutConcert';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../..';
import { getAboutConcert } from '../../http/concertAPI';
import HallFilarmoniya from '../HallFilarmoniya/HallFilarmoniya';
import PriceForConcert from './PriceForConcert/PriceForConcert';
import HallDramteatr from '../HallDramteatr/HallDramteatr';
import HallDruzhbaNarodiv from '../HallDruzhbaNarodiv/HallDruzhbaNarodiv';
import TicketsPriceSum from './TicketsPriceSum/TicketsPriceSum';
import { getUserTickets } from '../../http/ticketAPI';




const ConcertPage = observer(() => {
    const {user} = useContext(Context);
    const {id} = useParams();
    const [priceTickets, setPriceTickets] = useState([]);
    useEffect(() => {
        const fetchAboutConcert = async () =>{
            const data = await getAboutConcert(id);
            user.aboutConcert = data;
        }
        fetchAboutConcert();

    }, [])
    useEffect(() => {
        const fetchTickets = async () =>{
            const response = await getUserTickets();
            if(response.length) setPriceTickets(response.userTickets.filter(ticket => !ticket.booked && ticket.concertId == id));
        }
        fetchTickets();   
    }, [user.userTickets]);
    
    if (!Object.values(user.aboutConcert).length) return(<p>Завантаження...</p>)
    else return (
        <div className='wrapper-concert-page'>
            <Header/>
            <div style={{height: '110px'}}></div>
            <AboutConcert/>
            <div className='concert-line'></div>
            <div style={{display:'flex', flexDirection:'row'}}>
                {user.aboutConcert.venue === 'Filarmoniya' ? <HallFilarmoniya /> : null}
                {user.aboutConcert.venue === 'Dramteatr' ? <HallDramteatr /> : null}
                {user.aboutConcert.venue ==='DruzhbaNarodiv' ? <HallDruzhbaNarodiv /> : null}
                <PriceForConcert/>
            </div>
            { priceTickets.length != 0 && <TicketsPriceSum priceTickets = {priceTickets}/>}
           
        </div>
    );
});

export default ConcertPage;
