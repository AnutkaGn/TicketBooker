import React from 'react';
import './concertFilter.css'
import Select from 'react-select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; 
import Checkbox from '@mui/material/Checkbox';

const ConcertFilter = () => {
    const options = [
        { value: "druzhbaNarodiv", label: 'ПК «Дружба народів»'},
        { value: "filarmoniya", label: 'Черкаська обласна філармонія'},
        { value: "dramteatr", label: 'Український музично-драматичний театр імені Т. Г. Шевченка'},
    ]
    return (
        <div className='wrapper-filtre'>
                <div className='filter__checkbox'>
                    <div className='checkbox-one'>
                    
                        <Checkbox sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6', borderBlockColor: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>
                        <label for="all">Усі типи</label>
                    </div>
                    <div className='checkbox-one'>
                        <Checkbox sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>  
                        <label for="cocert">Концерти</label>
                    </div>
                    <div className='checkbox-one'>
                        <Checkbox sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>  
                        <label for="stand-up">Stand Up</label>
                    </div>
                    <div className='checkbox-one'>
                        <Checkbox sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>  
                        <label for="theatre">Театр</label>
                    </div>
                    <div className='checkbox-one'>
                        <Checkbox sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 25 }}}/>  
                        <label for="kids">Дітям</label>
                    </div>        
            </div>

            <div className='filter__box-place-date'>
                <div>
                    <Select
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
                        <DatePicker label="Виберіть дату" 
                        sx={{
                            background: "#FDF9F6",
                        }}/>
                    </LocalizationProvider>
                </div>
            </div>
        </div>
    );
}

export default ConcertFilter;
