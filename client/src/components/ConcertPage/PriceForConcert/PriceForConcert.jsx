import React from 'react';
import { observer } from 'mobx-react-lite';
import { store } from '../../../store/UserStore';
import './priceForConcert.css';

const PriceForConcert = observer(() => {
    const price = store.aboutConcert.price;
    return (
        <div className='wrapper-price-for-concert'>
            <div className='wrapper__price-for-concert__box'>
                <div className='price-for-concert__box'>
                    <div style={{backgroundColor:'rgb(40, 21, 189)'}}></div>
                    <p>{price[0]}.00 грн</p>
                </div>
                <div className='price-for-concert__box'>
                    <div style={{backgroundColor:'rgb(128, 102, 0)'}}></div>
                    <p>{price[1]}.00 грн</p>
                </div>
                <div className='price-for-concert__box'>
                    <div style={{backgroundColor:'rgb(250, 42, 127)'}}></div>
                    <p>{price[2]}.00 грн</p>
                </div>
                <div className='price-for-concert__box'>
                    <div style={{backgroundColor:'rgb(0, 128, 128)'}}></div>
                    <p>{price[3]}.00 грн</p>
                </div>
            </div>
            <div className='wrapper__price-for-concert__box'>
                <div className='price-for-concert__box'>
                    <div style={{backgroundColor:'rgb(252, 178, 3)'}}></div>
                    <p>{price[4]}.00 грн</p>
                </div>
                <div className='price-for-concert__box'>
                    <div style={{backgroundColor:'rgb(83, 172, 77)'}}></div>
                    <p>{price[5]}.00 грн</p>
                </div>
                <div className='price-for-concert__box'>
                    <div style={{backgroundColor:'rgb(207, 89, 207)'}}></div>
                    <p>{price[6]}.00 грн</p>
                </div>
                <div className='price-for-concert__box'>
                    <div style={{backgroundColor:'rgb(156, 17, 66)'}}></div>
                    <p>{price[7]}.00 грн</p>
                </div>
            </div>
        </div>
    );
});

export default PriceForConcert;
