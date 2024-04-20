import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Checkbox from '@mui/material/Checkbox';
import { observer } from 'mobx-react-lite';
import { getConcerts } from '../../../http/concertAPI';
import { DatePicker, ConfigProvider } from 'antd';
import locale from 'antd/es/date-picker/locale/uk_UA';
import { store } from '../../../store/UserStore';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import './concertFilter.css';


const ConcertFilter = observer(({page, setPage, setCount}) => {
	const [concertType, setConcertType] = useState(false);
	const [comedyType, setComedyType] = useState(false);
	const [showType, setShowType] = useState(false);
	const [theatreType, setTheatreType] = useState(false);
	const [kidsType, setKidsType] = useState(false);
	const [venue, setVenue] = useState('');
	const [date, setDate] = useState('');

	const options = [
		{ value: "DruzhbaNarodiv", label: 'ПК «Дружба народів»'},
		{ value: "Filarmoniya", label: 'Черкаська обласна філармонія'},
		{ value: "Dramteatr", label: 'Український музично-драматичний театр імені Т. Г. Шевченка'},
	]	        
	useEffect(() => {
		let typesArray = [];
		if (concertType) typesArray.push('concert');
		if (comedyType) typesArray.push('comedy');
		if (showType) typesArray.push('show');
		if (theatreType) typesArray.push('theatre');
		if (kidsType) typesArray.push('kids');
		const fetchData = async () => {
			if (!date.length){
				setDate(new Date().toString()) 
			}
			const data = await getConcerts(typesArray, date, venue, page);
			store.concerts = data.concerts;
			setCount(data.count);
		}
		if (JSON.stringify(store.filters.typesArray) !== JSON.stringify(typesArray)) {
			setPage(1);
			store.filters = {page, typesArray};
		} 
		store.concerts = [];
		fetchData();
	}, [concertType, comedyType, showType, theatreType, kidsType, venue, date, page, setPage, setCount]);
	

	return (
		<div className='wrapper-filtre'>
			<div className='filter__checkbox'>
				<div className='checkbox-one'>
					<Checkbox id='concert' checked={concertType} onClick={() => setConcertType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 24 }}}/>  
					<label htmlFor="concert">Концерт</label>
				</div>
				<div className='checkbox-one'>
					<Checkbox id='comedy' checked={comedyType} onClick={() => setComedyType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 24 }}}/>  
					<label htmlFor="comedy">Стенд-ап</label>
				</div>
				<div className='checkbox-one'>
					<Checkbox id='show' checked={showType} onClick={() => setShowType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 24 }}}/>
					<label htmlFor='show'>Шоу</label>
				</div>
				<div className='checkbox-one'>
					<Checkbox id='theatre' checked={theatreType} onClick={() => setTheatreType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 24 }}}/>  
					<label htmlFor="theatre">Театр</label>
				</div>
				<div className='checkbox-one'>
					<Checkbox id='kids' checked={kidsType} onClick={() => setKidsType(prev => !prev)} sx={{color: '#FDF9F6', '&.Mui-checked': {color: '#FDF9F6'},'& .MuiSvgIcon-root': {fontSize: 24 }}}/>  
					<label htmlFor="kids">Дітям</label>
				</div>        
			</div>

			<div className='filter__box-place-date'>
				<div>
					<Select
						getValue={() => venue}
						onChange={value => setVenue(value?.value)}
						options={options}
						isClearable={true}
						placeholder='Виберіть місце проведення'
						theme={theme => ({
						...theme,
						borderRadius: 0,
						colors: {
							...theme.colors,
							primary25: '#b5aba4',
							primary50: '#8e8782',
							neutral0: '#FDF9F6',
							neutral50: '#383838',
							primary: "#4C382C",
						}
						})}
						styles={{
						control: (base, state) => ({
							...base,
							fontFamily: "Vinnytsia Sans",
							fontSize: '16px',
							height: "50px",
							border: "none",
							borderColor: state.isFocused ? "#4C382C" : null,
						})
						}}
					/>
				</div>
				<div className='box-date'>
					<ConfigProvider
						theme={{
							components: {
								DatePicker: {
									activeBorderColor: "red",
									hoverBorderColor: "red",
								},
							},
							token: {
								colorPrimary: "#4C382C",
								colorTextPlaceholder: "#383838",
								colorTextDisabled: "#4C382C",
								colorTextTertiary: "#4C382C",
								controlItemBgActive: "red"

							},
						}}
					>
						<DatePicker
							style={{ borderRadius: 0, height: 50, backgroundColor: "#FDF9F6", width: 250, fontFamily: "Vinnytsia Sans", fontSize: "16px"}}
							variant="filled"
							activeBorderColor="red"
							placeholder='Обери дату'
							locale={locale}
							minDate={dayjs()}
							onChange={(value) => value? setDate(new Date(value.$d)): setDate("")}
						/>
					</ConfigProvider>
				</div>
			</div>
		</div>
	);
});

export default ConcertFilter;
