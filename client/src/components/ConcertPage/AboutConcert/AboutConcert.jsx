import React , {useContext} from 'react';
import './aboutConcert.css';
import { observer } from 'mobx-react-lite';
import { Context } from '../../..';
import moment from 'moment'
 
const AboutConcert = observer(() => {
    const {user} = useContext(Context);
    const price = user.aboutConcert.price;
    console.log(price)
    return (
        <div className='about-concert'>
            <img src="assets/poster.png" alt="poster"/>
            <div className='about-concert__wrapper-information'>
                <p className='about-concert__date'>{moment(user.aboutConcert.dateTime).locale('uk').format('D MMMM HH:mm')}</p>
                <p className='about-concert__name'>{user.aboutConcert.name}</p>
                <p className='about-concert__description'>{user.aboutConcert.description}</p>
                <div className='about-concert__wrapper-venue'>
                    <img src='assets/placeholder-point.png' alt="placeholder-point"/>
                    <p>{user.aboutConcert.venue}</p>
                </div>   
                <div className='about-concert__wrapper-price'>
                    <img src="assets/wallet.png" alt="wallet"/>
                    <p>{price[0]} - {price[7]} грн</p>
                </div>
            </div>
        </div>
    );
});

export default AboutConcert;
