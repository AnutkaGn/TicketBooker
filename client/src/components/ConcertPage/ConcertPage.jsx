import React, { useEffect, useState } from 'react';
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import AboutConcert from './AboutConcert/AboutConcert';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { getAboutConcert } from '../../http/concertAPI';
import HallFilarmoniya from '../HallFilarmoniya/HallFilarmoniya';
import PriceForConcert from './PriceForConcert/PriceForConcert';
import HallDramteatr from '../HallDramteatr/HallDramteatr';
import HallDruzhbaNarodiv from '../HallDruzhbaNarodiv/HallDruzhbaNarodiv';
import { getUserTickets } from '../../http/ticketAPI';
import { store } from '../../store/UserStore';
import './concertPage.css';

const LoadingPage = () =>{
    return (
        <div className='wrapper-loading-page'>
            <div className='loading-page__box-logo-text'>            
                <img className='loading-page__logo' src="assets/logo.png" alt="logo"/>
                <p className='loading-page__text' style={{paddingRight:20}}>Ticket.che</p>
            </div>
            <div className="bouncing-loader">          
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
} 

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
    
    if (!Object.values(store.aboutConcert).length) return(<LoadingPage/>)
    else return (
        <div className='wrapper-concert-page'>
            <Header/>
            <div style={{height: '110px'}}></div>
            <AboutConcert/>
            <div className='concert-line'></div>
            <div className='concert-page__wrapper-hall'>
                <PriceForConcert/>
                {store.aboutConcert.venue === 'Filarmoniya' ? <HallFilarmoniya /> : null}
                {store.aboutConcert.venue === 'Dramteatr' ? <HallDramteatr /> : null}
                {store.aboutConcert.venue ==='DruzhbaNarodiv' ? <HallDruzhbaNarodiv /> : null}
            </div>
           <Footer/>
        </div>
    );
});

export default ConcertPage;
