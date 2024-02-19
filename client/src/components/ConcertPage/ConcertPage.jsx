import React, { useEffect, useContext } from 'react';
import './concertPage.css'
import Header from '../common/Header/Header';
import AboutConcert from './AboutConcert/AboutConcert';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../..';
import { getAboutConcert } from '../../http/concertAPI';
import HallFilarmoniya from '../HallFilarmoniya/HallFilarmoniya';
import PriceForConcert from './PriceForConcert/PriceForConcert';

const ConcertPage = observer(() => {
    const {user} = useContext(Context);
    const {id} = useParams();
    useEffect(() => {
        const fetchAboutConcert = async () =>{
            const data = await getAboutConcert(id);
            user.aboutConcert = data;
        }
        fetchAboutConcert();
    }, [])
    if (!Object.values(user.aboutConcert).length) return(<p>Завантаження...</p>)
    else return (
        <div className='wrapper-concert-page'>
            <Header/>
            <div style={{height: '110px'}}></div>
            <AboutConcert/>
            <hr className='concert-line'/>
            <div style={{display:'flex', flexDirection:'row'}}>
                <HallFilarmoniya/>
                <PriceForConcert/>
            </div>
            
            {user.ticketsToBook.filter(ticket => !ticket.booked && ticket.concertId === id).length ? (
                <div className='wrapper-add-to-basket'>
                    <button className='add-to-basket__button'>Перейти до корзини</button>
                    <div className='add-to-basket__footer'>
                        <p>{`Сума (${user.ticketsToBook.filter(ticket => !ticket.booked && ticket.concertId === id).length}шт.): ${user.ticketsToBook.reduce((sum, ticket) => !ticket.booked && ticket.concertId === id ? Number(sum) + Number(ticket.price): 0, 0)} грн`}</p>
                    </div>
                </div>
            ):(<></>)}
        </div>
    );
});

export default ConcertPage;
