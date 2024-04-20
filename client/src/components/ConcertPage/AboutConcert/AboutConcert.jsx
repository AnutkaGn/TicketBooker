import React from 'react';
import { observer } from 'mobx-react-lite';
import moment from 'moment'
import { typeConcert, venueConcert } from '../../../consts';
import { store } from '../../../store/UserStore';
import './aboutConcert.css';

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

const AboutConcert = observer(() => {
    const price = store.aboutConcert.price;
    const venue= venueConcert[store.aboutConcert.venue]?.address
    const venue_hall = venueConcert[store.aboutConcert.venue]?.hall
    const type = typeConcert[store.aboutConcert.type]
    const date = store.aboutConcert.dateTime.slice(0, store.aboutConcert.dateTime.length-5)
    return (
        <div className='about-concert'>
            <img src={`data:${store.aboutConcert.image.mimetype};base64,${_arrayBufferToBase64(store.aboutConcert.image.buffer?.data)}`} alt="poster"/>
            <div className='about-concert__wrapper-information'>
                <p className='about-concert__date'>{moment(date).locale('uk').format('D MMMM HH:mm')}</p>
                <p className='about-concert__name'>{store.aboutConcert.name}</p>
                <p className='about-concert__type'>{type}</p>
                <p className='about-concert__description'>{store.aboutConcert.description}</p>
                <div className='about-concert__wrapper-venue'>
                    <p>{venue_hall}</p>
                    <p>{venue}</p>
                </div>   
                <div className='about-concert__wrapper-price'>
                    <p>{price[0]} - {price[7]} грн</p>
                </div>
            </div>
        </div>
    );
});

export default AboutConcert;
