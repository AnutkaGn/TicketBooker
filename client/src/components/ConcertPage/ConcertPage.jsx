import React, { useEffect, useContext } from 'react';
import './concertPage.css'
import Header from '../common/Header/Header';
import AboutConcert from './AboutConcert/AboutConcert';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { observer } from 'mobx-react-lite';
import { Context } from '../..';

const ConcertPage = observer(() => {
    const {user} = useContext(Context);
    const {id} = useParams();
    useEffect(() => {
        axios.get(`http://localhost:5000/api/concert/${id}`)
        .then(response => user.aboutConcert = response.data)
        .catch(error => console.error('Помилка при отриманні даних:', error));
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
