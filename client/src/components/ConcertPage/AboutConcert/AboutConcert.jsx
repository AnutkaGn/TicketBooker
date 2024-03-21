import React , {useContext} from 'react';
import './aboutConcert.css';
import { observer } from 'mobx-react-lite';
import { Context } from '../../..';
import moment from 'moment'
import { typeConcert, venueConcert } from '../../../consts';
 
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
    const {user} = useContext(Context);
    const price = user.aboutConcert.price;
    const venue= venueConcert[user.aboutConcert.venue]?.address
    const venue_hall = venueConcert[user.aboutConcert.venue]?.hall
    const type = typeConcert[user.aboutConcert.type]
    return (
        <div className='about-concert'>
            <img src={`data:${user.aboutConcert.image.mimetype};base64,${_arrayBufferToBase64(user.aboutConcert.image.buffer?.data)}`} alt="poster"/>
            <div className='about-concert__wrapper-information'>
                <p className='about-concert__date'>{moment(user.aboutConcert.dateTime).locale('uk').format('D MMMM HH:mm')}</p>
                <p className='about-concert__name'>{user.aboutConcert.name}</p>
                <p className='about-concert__type'>{type}</p>
                <p className='about-concert__description'>{user.aboutConcert.description}</p>
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
