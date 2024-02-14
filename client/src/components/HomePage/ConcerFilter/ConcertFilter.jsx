import React, { useEffect, useContext, useState } from 'react';
import './concertFilter.css'
import Select from 'react-select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; 
import Checkbox from '@mui/material/Checkbox';
import { observer } from 'mobx-react-lite';
import { Context } from '../../..';
import { getConcerts } from '../../../http/concertAPI';

const ConcertFilter = observer(() => {
    const {user} = useContext(Context);
    const [concertType, setConcertType] = useState(false);
    const [comedyType, setComedyType] = useState(false);
    const [showType, setShowType] = useState(false);
    const [theatreType, setTheatreType] = useState(false);
    const [kidsType, setKidsType] = useState(false);
    const [venue, setVenue] = useState('');
    const [date, setDate] = useState(null);

    const options = [
        { value: "druzhbaNarodiv", label: 'ПК «Дружба народів»'},
        { value: "filarmoniya", label: 'Черкаська обласна філармонія'},
        { value: "dramteatr", label: 'Український музично-драматичний театр імені Т. Г. Шевченка'},
    ]

    
    useEffect(() => {
        let typesArray = [];
        if (concertType) typesArray.push('concert');
        if (comedyType) typesArray.push('Comedy');
        if (showType) typesArray.push('show');
        if (theatreType) typesArray.push('theatre');
        if (kidsType) typesArray.push('kids');
        const fetchData = async () => {
            const data = await getConcerts(typesArray, date, venue);
            user.concerts = data;
        }
        fetchData();
    }, [concertType, comedyType, showType, theatreType, kidsType, venue, date]);
    

    return (
        <div className='wrapper-filtre'>
                <div className='filter__checkbox'>
                    <div className='checkbox-one'>
                        <Checkbox id='concert' checked={concertType} onClick={() => setConcertType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>  
                        <label htmlFor="concert">Концерти</label>
                    </div>
                    <div className='checkbox-one'>
                        <Checkbox id='comedy' checked={comedyType} onClick={() => setComedyType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>  
                        <label htmlFor="comedy">Comedy</label>
                    </div>
                    <div className='checkbox-one'>
                        <Checkbox id='show' checked={showType} onClick={() => setShowType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>
                        <label htmlFor='show'>Шоу</label>
                    </div>
                    <div className='checkbox-one'>
                        <Checkbox id='theatre' checked={theatreType} onClick={() => setTheatreType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>  
                        <label htmlFor="theatre">Театр</label>
                    </div>
                    <div className='checkbox-one'>
                        <Checkbox id='kids' checked={kidsType} onClick={() => setKidsType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>  
                        <label htmlFor="kids">Дітям</label>
                    </div>        
            </div>

            <div className='filter__box-place-date'>
                <div>
                    <Select
                        getValue={() => venue}
                        onChange={value => setVenue(value.label)}
                        options={options}
                        isClearable={true}
                        placeholder='Виберіть місце проведення'
                        theme={theme => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                            ...theme.colors,
                            primary25: '#b5aba4',
                            primary50: '#8e8782',
                            neutral0: '#FDF9F6',
                            neutral50: 'black'
                        }
                        })}
                        styles={{
                        control: base => ({
                            ...base,
                            fontFamily: "Roboto Slab",
                            borderRadius: "5px",
                            fontSize: '16px',
                            height: "56px",
                        })
                        }}
                    />
                </div>
                <div className='box-date'>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label="Виберіть дату" value={date} onChange={value => setDate(new Date(value.$d))}
                        sx={{
                            background: "#FDF9F6",
                        }}/>
                    </LocalizationProvider>
                </div>
            </div>
        </div>
    );
});

export default ConcertFilter;
