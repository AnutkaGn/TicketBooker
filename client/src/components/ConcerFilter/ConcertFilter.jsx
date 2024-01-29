import React from 'react';
import './concertFilter.css'

const ConcertFilter = () => {
    return (
        <div className='wrapper-filtre'>
        <div className='filter'>
            <div className='filter__checkbox'>
                <div className='checkbox-one'>
                    <input type="checkbox" name="type" id="all_types" value="all"/>
                    <label for="all">Усі типи</label>
                </div>
                <div className='checkbox-one'>
                    <input className='custom-checkbox' type="checkbox" name="type" id="concert" value="cocert"/>
                    <label for="cocert">Концерти</label>
                </div>
                <div className='checkbox-one'>
                    <input type="checkbox" name="type" id="stand_up" value="stand-up"/>
                    <label for="stand-up">Stand Up</label>
                </div>
                <div className='checkbox-one'>
                    <input type="checkbox" name="type" id="theatre" value="theatre"/>
                    <label for="theatre">Театр</label>
                </div>
                <div className='checkbox-one'>
                    <input type="checkbox" name="type" id="kids" value="kids"/>
                    <label for="kids">Дітям</label>
                </div>
            </div>
            <hr style={{width: '1008px'}}/>

            <div className='filter__box-place-date'>
                <div className='box-place'>
                    <select id="places" name="places">
                        <option value="choice">Виберіть місце</option>
                        <option value="druzhbaNarodiv">ПК «Дружба народів» </option>
                        <option value="filarmoniya">Черкаська обласна філармонія</option>
                        <option value="dramteatr">Український музично-драматичний театр імені Т. Г. Шевченка</option>
                    </select>
                </div>
                <div className='box-date'>
                    <input type="date" id="datepicker" value=""/>
                </div>
            </div>
        </div>
        </div>
    );
}

export default ConcertFilter;
