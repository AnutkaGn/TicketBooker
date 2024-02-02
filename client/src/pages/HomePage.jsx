import React from 'react';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';
import ConcertsArray from '../components/ConcertsArray/ConcertsArray';
import ConcertFilter from '../components/ConcerFilter/ConcertFilter';

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
