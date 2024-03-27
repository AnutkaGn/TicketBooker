import React from 'react';
import ConcertItem from './ConcertItem/ConcertItem';
import {observer} from 'mobx-react-lite';
import { store } from '../../../store/UserStore';


const ConcertsArray = observer(() => {
    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            {store.concerts.map(concert => (
                <ConcertItem key={concert._id} concert={concert} />
            ))}
        </div>
    );
});

export default ConcertsArray;
