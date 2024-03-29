import React from 'react';
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import ConcertsArray from './ConcertsArray/ConcertsArray';
import ConcertFilter from './ConcerFilter/ConcertFilter';
import Slider from './Slider/Slider';

const HomePage = () => {
    return (
        <div>
            <Header/>
            <Slider/>
            <ConcertFilter/>
            <ConcertsArray/>
            <Footer/>
        </div>
    );
}

export default HomePage;
