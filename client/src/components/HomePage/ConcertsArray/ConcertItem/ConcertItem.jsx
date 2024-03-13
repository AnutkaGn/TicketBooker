import React from 'react';
import moment from 'moment';
import 'moment/locale/uk';
import './concertItem.css';
import { Link } from 'react-router-dom';


const ConcertItem = ({concert}) => {
    const formattedDate = moment(concert.dateTime).locale('uk').format('D MMMM HH:mm');
    const dateParts = formattedDate.split(' ');
    return (
        <div className='concert-card'>
            <div className='concert-card__poster'>
                <div className='background-of-picture'></div>
                <img src="assets/poster.png" alt="poster"/>
            </div>
            
            <div className='concert-wrapper-information'>
                <p className='concert-card__name'>{concert.name}</p>
                <p className='concert-card__type'>{concert.type}</p>
                <div className='concert-wrapper-venue-date'>
                    <div className='concert-card__date'><span>{moment(concert.dateTime).locale('uk').format('D MMMM HH:mm')}</span></div>
                    <p className='concert-card__venue'>{concert.venue}</p>
                </div>
                <div className='concert-wrapper-price'>
                    <p className='concert-card__price'>{concert.price[0]} - {concert.price[7]} грн</p> 
                </div>
            </div>
            <svg className='concert-arrow' width="207" height="173" viewBox="0 0 207 173" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.00032 131.281C3.98767 118.537 8.81159 111.342 18.2857 101.538C29.1595 90.2848 43.3301 86.4049 58.1142 89.2651C75.7142 92.6701 95.6901 101.181 105.125 116.486C107.925 121.029 110.572 130.534 104.74 133.997C77.7638 150.016 82.6349 108.437 86.6197 95.5472C97.5206 60.286 142.769 51.7531 178.61 54.1066" stroke="#4C3829" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M175.526 66.9004L195.995 51.9163C197.303 50.9591 196.834 48.8741 195.205 48.3983L171.366 41.4378" stroke="#4C3829" strokeWidth="1.5"/>
            </svg>  
            <Link to={`/concert/${concert._id}`}><div className='concert-card__button-book'><span>Хочу</span></div></Link> 
        </div>
    );
}

export default ConcertItem;
