import React, { useEffect, useState } from 'react';
import Header from '../common/Header/Header';
import AboutConcert from './AboutConcert/AboutConcert';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { getAboutConcert } from '../../http/concertAPI';
import HallFilarmoniya from '../HallFilarmoniya/HallFilarmoniya';
import PriceForConcert from './PriceForConcert/PriceForConcert';
import HallDramteatr from '../HallDramteatr/HallDramteatr';
import HallDruzhbaNarodiv from '../HallDruzhbaNarodiv/HallDruzhbaNarodiv';
import TicketsPriceSum from './TicketsPriceSum/TicketsPriceSum';
import { getUserTickets } from '../../http/ticketAPI';
import { store } from '../../store/UserStore';
import './concertPage.css';



const ConcertPage = observer(() => {
    const {id} = useParams();
    const [priceTickets, setPriceTickets] = useState([]);
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchAboutConcert = async () =>{
            const data = await getAboutConcert(id);
            store.aboutConcert = data;
        }
        fetchAboutConcert();
    }, [])
    useEffect(() => {
        const fetchTickets = async () =>{
            const response = await getUserTickets();
            if(response.length) setPriceTickets(response.userTickets.filter(ticket => !ticket.booked && ticket.concertId == id));
        }
        fetchTickets();   
    }, [store.userTickets]);
    
    if (!Object.values(store.aboutConcert).length) return(<p>Завантаження...</p>)
    else return (
        <div className='wrapper-concert-page'>
            <Header/>
            <div style={{height: '110px'}}></div>
            <AboutConcert/>
            <div className='concert-line'></div>
            <div style={{display:'flex', flexDirection:'row'}}>
                <PriceForConcert/>
                {store.aboutConcert.venue === 'Filarmoniya' ? <HallFilarmoniya /> : null}
                {store.aboutConcert.venue === 'Dramteatr' ? <HallDramteatr /> : null}
                {store.aboutConcert.venue ==='DruzhbaNarodiv' ? <HallDruzhbaNarodiv /> : null}
                
            </div>
            { priceTickets.length != 0 && <TicketsPriceSum priceTickets = {priceTickets}/>}
           
        </div>
    );
});

export default ConcertPage;
