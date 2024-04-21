import { Drawer } from 'antd';
import React, { useState } from 'react';
import { Collapse } from 'antd';
import { observer } from 'mobx-react-lite';
import { store } from '../../../../store/UserStore';

const Drawers = observer(() => {
	const [open, setOpen] = useState(false);
	const showDrawer = () => {
		setOpen(true);
	};
	const onClose = () => {
		setOpen(false);
	};
	const items = [
		{
		  label: 'Черкаська обласна філармонія',
		  children: <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2594.156610291386!2d32.06194601155946!3d49.44375695921608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d14b7cf8766545%3A0x4cf11a5b20ad423a!2z0KfQtdGA0LrQsNGB0YzQutCwINC-0LHQu9Cw0YHQvdCwINGE0ZbQu9Cw0YDQvNC-0L3RltGP!5e0!3m2!1suk!2sua!4v1713717733924!5m2!1suk!2sua" width="300" height="200" style={{border:0}} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>,
		},
		{
			label: 'Драмтеатр',
			children: <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2594.249158949328!2d32.058802511559406!3d49.44200765934031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d14b7e808f4acd%3A0xf9a575629452e11a!2z0JTRgNCw0LzRgtC10LDRgtGALCDQsdGD0LvRjNCy0LDRgCDQqNC10LLRh9C10L3QutCwLCAyMzQsINCn0LXRgNC60LDRgdC4LCDQp9C10YDQutCw0YHRjNC60LAg0L7QsdC70LDRgdGC0YwsIDE4MDAw!5e0!3m2!1suk!2sua!4v1713718059172!5m2!1suk!2sua" width="300" height="200" style={{border:0}} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>,
		},
		{
		  label: 'Палац культури «Дружба народів»',
		  children: <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2594.4571385046656!2d32.06726265114585!3d49.4380763862746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d14b774670700d%3A0x843426237313cd05!2z0J_QsNC70LDRhiDQutGD0LvRjNGC0YPRgNC4IMKr0JTRgNGD0LbQsdCwINC90LDRgNC-0LTRltCywrs!5e0!3m2!1suk!2sua!4v1713717944843!5m2!1suk!2sua"  width="300" height="200" style={{border:0}} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>,
		},
	  ];
	return (
		<div className='wrapper-drawer'>
			<img className='header__button' src="assets/button.svg" alt="button" onClick={open ? onClose : showDrawer}/>
			<Drawer title="Basic Drawer" placement="left" onClose={onClose} open={open} width={400} zIndex={0}>
				<p style={{fontFamily:'Vinnytsia Sans', fontSize:15}}>Де шукати місця проведення заходів?</p>
				<div className='drawer-line' style={{marginBottom:10}}/> 
				<Collapse ghost items={items} />
				<p style={{fontFamily:'Vinnytsia Sans', marginTop:'30px', fontSize:15}}>Куди написати нам?</p>
				<div className='drawer-line'/> 
				<div style={{marginLeft:20, marginTop:15}}>
					<div className='wrapper-drawer-text'>
						<a href="" className='wrapper-drawer-text__image'><img src="assets/instagram-yellow.png" alt="instagram" width={30} height={30}/></a>
						<a href="" className='wrapper-drawer-text__text'><p>Інстаграм</p></a>
					</div>
					<div className='wrapper-drawer-text'>
						<a href="" className='wrapper-drawer-text__image'><img src="assets/viber-yellow.png" alt="viber" width={30} height={30}/></a>
						<a href="" className='wrapper-drawer-text__text'><p>Вайбер</p></a>
					</div>
					<div className='wrapper-drawer-text'>
						<a href="" className='wrapper-drawer-text__image'><img src="assets/facebook-yellow.png" alt="facebook" width={30} height={30}/></a>
						<a href="" className='wrapper-drawer-text__text'><p>Фейсбук</p></a>
					</div>
					<div className='wrapper-drawer-text'>
						<a href="" className='wrapper-drawer-text__image'><img src="assets/telegram-yellow.png" alt="telegram" width={30} height={30}/></a>
						<a href="" className='wrapper-drawer-text__text'><p>Телеграм</p></a>
					</div>
					<div className='wrapper-drawer-text'>
						<a href="" className='wrapper-drawer-text__image'><img src="assets/email-yellow.png" alt="email" width={30} height={30}/></a>
						<a href="" className='wrapper-drawer-text__text'><p>Електронна пошта</p></a>
					</div>
				</div>	
				<div className='drawer-line' style={{marginTop:30}}/> 
					
				{store.role == "ADMIN" ? (
					<><div className='wrapper-drawer-text' style={{marginTop:10, marginLeft:20}}>
						<img src="assets/plus.png" alt="add" width={20} height={20} style={{marginRight:10}}/>
						<p>Додати захід</p>
					</div>
					<div className='drawer-line' style={{marginTop:5}}/></>
				) : null}
			</Drawer>
		</div>
	);
});
export default Drawers;