import React, { useContext } from 'react';
import './priceForConcert.css'
import { observer } from 'mobx-react-lite';
import { Context } from '../../..';

const PriceForConcert = observer(() => {
    const {user} = useContext(Context);
    const price = user.aboutConcert.price;
    return (
        <div className='wrapper-price-for-concert'>
            <div className='price-for-concert__box'>
                <div style={{backgroundColor:'rgb(40, 21, 189)'}}><p>{price[0]}</p></div>
            </div>
            <div className='price-for-concert__box'>
                <div style={{backgroundColor:'rgb(128, 102, 0)'}}><p>{price[1]}</p></div>
            </div>
            <div className='price-for-concert__box'>
                <div style={{backgroundColor:'rgb(250, 42, 127)'}}><p>{price[2]}</p></div>
            </div>
            <div className='price-for-concert__box'>
                <div style={{backgroundColor:'rgb(0, 128, 128)'}}><p>{price[3]}</p></div>
            </div>
            <div className='price-for-concert__box'>
                <div style={{backgroundColor:'rgb(252, 178, 3)'}}><p>{price[4]}</p></div>
            </div>
            <div className='price-for-concert__box'>
                <div style={{backgroundColor:'rgb(83, 172, 77)'}}><p>{price[5]}</p></div>
            </div>
            <div className='price-for-concert__box'>
                <div style={{backgroundColor:'rgb(207, 89, 207)'}}><p>{price[6]}</p></div>
            </div>
            <div className='price-for-concert__box'>
                <div style={{backgroundColor:'rgb(156, 17, 66)'}}><p>{price[7]}</p></div>
            </div>
        </div>
    );
});

export default PriceForConcert;
