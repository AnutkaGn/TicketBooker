import React from 'react';

const ConcertItem = ({concert}) => {
    return (
        <div className='concert-card'>
            <p className='concert-card__date'>{concert.dateTime}</p>
            <img className='concert-card__poster' src="" alt="poster"/>
            <p className='concert-card__name'>{concert.name}</p>
            <p className='concert-card__type'>{concert.type}</p>
            <div className='concert-box-venue'>
                <img src="" alt="placeholder-point"/>
                <p className='concert-card__venue'>{concert.venue}</p>
            </div>
            <div className='concert-box-price'>
                <img src="" alt="wallet"/>
                <p className='concert-card__price'>{concert.price}</p>
            </div>
            <a href="">
                <input className='concert-card__button-book' type="button" value="Забронювати"/>
            </a> 
        </div>
    );
}

export default ConcertItem;
