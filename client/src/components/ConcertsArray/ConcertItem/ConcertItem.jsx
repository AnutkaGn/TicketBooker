import React from 'react';
import moment from 'moment';
import 'moment/locale/uk';
import './concertItem.css';


const ConcertItem = ({concert}) => {

    const formattedDate = moment(concert.dateTime).locale('uk').format('D MMMM HH:mm');
    const dateParts = formattedDate.split(' ');
    return (
        <div className='concert-card'>
            <div className='concert-card__date'><span>{dateParts[0]}</span><span>{dateParts[1]}</span><span>{dateParts[2]}</span></div>
            <img src="assets/poster.png" alt="poster"/>
            <div className='concert-wrapper-information'>
                <p className='concert-card__name'>{concert.name}</p>
                <p className='concert-card__type'>{concert.type}</p>
                <div className='concert-wrapper-venue'>
                    <img src='assets/placeholder-point.png' alt="placeholder-point"/>
                    <p className='concert-card__venue'>{concert.venue}</p>
                </div>
                <div className='concert-wrapper-price-and-button'>
                    <div className='concert-wrapper-price'>
                        <img src="assets/wallet.png" alt="wallet"/>
                        <p className='concert-card__price'>{concert.price} грн</p>
                    </div>
                        <a href=""><input className='concert-card__button-book' type="button" value="Забронювати"/></a>
                </div>
            </div>
        </div>
    );
}

export default ConcertItem;
