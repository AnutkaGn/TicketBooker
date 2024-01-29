import React from 'react';

const ConcertFilter = () => {
    return (
        <div>
            <div>
                <input type="checkbox" name="type" id="all_types" value="all"/>
                <label for="all">Усі типи</label>
            </div>
            <div>
                <input type="checkbox" name="type" id="concert" value="cocert"/>
                <label for="cocert">Концерти</label>
            </div>
            <div>
                <input type="checkbox" name="type" id="stand_up" value="stand-up"/>
                <label for="stand-up">Stand Up</label>
            </div>
            <div>
                <input type="checkbox" name="type" id="theatre" value="theatre"/>
                <label for="theatre">Театр</label>
            </div>
            <div>
                <input type="checkbox" name="type" id="kids" value="kids"/>
                <label for="kids">Дітям</label>
            </div>
        </div>

    );
}

export default ConcertFilter;
