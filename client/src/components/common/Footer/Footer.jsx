import React from 'react';
import './footer.css'

const Footer = () => {
    return (
        <div className='wrapper-footer'>
            <div className='footer__email'>
                <p className='footer__text-before-email'>Є питання, побажання?</p>
                <a href=""><img className='footer__email-image' src="assets/email.png" alt="email" /></a>
                <a className='footer__text-after-email' href="">Напишіть нам!</a>
            </div>
            <hr className='footer-line'/>
            <div className='footer__information-box'>
                <div className='box-logo-text'>
                    <img src="assets/logo.png" alt="logo" />
                    <p className='box__footer-text'>Ticket.che</p>
                </div>
                <p className='footer-text-center'>Ticket.Che.com 2024</p>
                <div className='box-image'>
                    <img src="assets/telegram.png" alt="telegram" />
                    <img src="assets/viber.png" alt="viber" />
                    <img src="assets/instagram.png" alt="instagram" />
                    <img src="assets/facebook.png" alt="facebook" />
                </div>
            </div>
        </div>
    );
}

export default Footer;
