import React from 'react';
import './concertPage.css'
import Header from '../common/Header/Header';
import AboutConcert from './AboutConcert/AboutConcert';

const ConcertPage = () => {
    return (
        <div className='wrapper-concert-page'>
            <Header/>
            <div style={{height: '110px'}}></div>
            <AboutConcert/>
            <hr className='concert-line'/>
            
        </div>
    );
}

export default ConcertPage;
