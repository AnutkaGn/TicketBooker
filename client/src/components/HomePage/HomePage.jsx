import React from 'react';
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import ConcertsArray from '../ConcertsArray/ConcertsArray';
import ConcertFilter from '../ConcerFilter/ConcertFilter';

const HomePage = () => {
    return (
        <div>
            <Header/>
            <div style={{height:'100px'}}></div>
            <ConcertFilter/>
            <ConcertsArray/>
            <Footer/>
        </div>
    );
}

export default HomePage;
