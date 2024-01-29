import React from 'react';
import Header from '../components/common/Header/Header';
import ConcertsArray from '../components/ConcertsArray/ConcertsArray'

const HomePage = () => {
    return (
        <div>
            <Header/>
            <ConcertsArray/>
        </div>
    );
}

export default HomePage;
