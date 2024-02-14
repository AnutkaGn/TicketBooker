import React, { useEffect, useContext } from 'react';
import './concertPage.css'
import Header from '../common/Header/Header';
import AboutConcert from './AboutConcert/AboutConcert';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../..';
import { getAboutConcert } from '../../http/concertAPI';

const ConcertPage = observer(() => {
    const {user} = useContext(Context);
    const {id} = useParams();
    useEffect(() => {
        const data = getAboutConcert(id);
        user.aboutConcert = data;
    }, [])
    return (
        <div className='wrapper-concert-page'>
            <Header/>
            <div style={{height: '110px'}}></div>
            <AboutConcert/>
            <hr className='concert-line'/>
            
        </div>
    );
});

export default ConcertPage;
