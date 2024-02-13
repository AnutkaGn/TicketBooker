import React, { useContext } from 'react';
import ConcertItem from './ConcertItem/ConcertItem';
import {observer} from 'mobx-react-lite';
import { Context } from '../..';


const ConcertsArray = observer(() => {
    const {user} = useContext(Context);
    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            {user.concerts.map(concert => (
                <ConcertItem key={concert._id} concert={concert} />
            ))}
        </div>
    );
});

export default ConcertsArray;
