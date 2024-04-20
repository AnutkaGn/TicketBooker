import { Drawer } from 'antd';
import React, { useState } from 'react';

const Drawers = () => {
	const [open, setOpen] = useState(false);
	const showDrawer = () => {
		setOpen(true);
	};
	const onClose = () => {
		setOpen(false);
	};
	return (
		<>
			<img className='header__button' src="assets/button.svg" alt="button" onClick={open ? onClose : showDrawer}/>
			<Drawer title="Basic Drawer" placement="left" onClose={onClose} open={open} width={450} zIndex={0}>
				<p>Some contents...</p>
				<p>Some contents...</p>
				<p>Some contents...</p>
			</Drawer>
		</>
	);
};
export default Drawers;