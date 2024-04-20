import React from 'react';
import ConcertItem from './ConcertItem/ConcertItem';
import {observer} from 'mobx-react-lite';
import { store } from '../../../store/UserStore';
import { CircularProgress, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
        yellow: {
            main: "#FFB800"
        }
    }
});

const ConcertsArray = observer(() => {
    const concerts = store.concerts?.map(concert => store.filters.typesArray.length ? (store.filters.typesArray.includes(concert.type) ? <ConcertItem key={concert._id} concert={concert} /> : null) : <ConcertItem key={concert._id} concert={concert} />)
    return (
        <ThemeProvider theme={theme}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                {
                    store.concerts.length ?  
                    concerts : (
                        <div style={{marginBottom: "30px"}}>
                            <CircularProgress color='yellow'/>
                        </div>
                    )
                }
            </div>
        </ThemeProvider>
    );
});

export default ConcertsArray;
