import React from 'react';
import ConcertItem from './ConcertItem/ConcertItem';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ConcertsArray = () => {
    const [concerts, setConcerts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/concert')
        .then(response => setConcerts(response.data))
        .catch(error => console.error('Помилка при отриманні даних:', error));
    }, []);
 

    console.log(concerts)
    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            {concerts.map(concert => (
                <ConcertItem key={concert.id} concert={concert} />
            ))}
        </div>
    );
}

export default ConcertsArray;
