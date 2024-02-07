import React from 'react';
import './aboutConcert.css';

const AboutConcert = () => {
    return (
        <div className='about-concert'>
            <img src="assets/poster.png" alt="poster"/>
            <div className='about-concert__wrapper-information'>
                <p className='about-concert__date'> 14 квітня, 17:00 </p>
                <p className='about-concert__name'>Рок канікули. Весела музичнапоп-рок страшилка</p>
                <p className='about-concert__description'>Для отримання максимально точних результатів розробники радять виділяти по одному рядку.</p>
                <div className='about-concert__wrapper-venue'>
                    <img src='assets/placeholder-point.png' alt="placeholder-point"/>
                    <p>Міський будинок культури ім. Івана Кулика</p>
                </div>   
                <div className='about-concert__wrapper-price'>
                    <img src="assets/wallet.png" alt="wallet"/>
                    <p>590 - 800 грн</p>
                </div>
            </div>
        </div>
        
    );
}

export default AboutConcert;
