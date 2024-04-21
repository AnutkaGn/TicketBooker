import React, { useRef, useState } from 'react';
import './addConcert.css';
import Select from 'react-select';
import { DatePicker, ConfigProvider, Flex } from 'antd';
import locale from 'antd/es/date-picker/locale/uk_UA';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import { arrayBufferToBase64 } from '../../../consts';
import { createConcert } from '../../../http/concertAPI';



const AddConcert = () => {
    const name = useRef('');
    const description = useRef('');
    const [type, setType] = useState('');
    const [date, setDate] = useState();
    const [image, setImage] = useState({});
    const [venue, setVenue] = useState('');
    const poster = useRef('');
    const price_1 = useRef('');
    const price_2 = useRef('');
    const price_3 = useRef('');
    const price_4 = useRef('');
    const price_5 = useRef('');
    const price_6 = useRef('');
    const price_7 = useRef('');
    const price_8 = useRef('');
    const optionsVenue = [
		{ value: "DruzhbaNarodiv", label: 'ПК «Дружба народів»'},
		{ value: "Filarmoniya", label: 'Черкаська обласна філармонія'},
		{ value: "Dramteatr", label: 'Український музично-драматичний театр імені Т. Г. Шевченка'},
	]	
    const optionsType = [
		{ value: "concert", label: 'Концерт'},
		{ value: "comedy", label: 'Комедія'},
		{ value: "show", label: 'Шоу'},
        { value: "theatre", label: 'Театр'},
		{ value: "kids", label: 'Дітям'},
	]	

    const uploadImage = (e) => {
        const image = {fileName: e.target.files[0].name};
        var reader = new FileReader();
        reader.onload = function() {
            var arrayBuffer = this.result;
            image.buffer = arrayBuffer;
            image.file = e.target.files[0];
            setImage(image)
        }
        reader.readAsArrayBuffer(e.target.files[0]);
        
    }


    const create = async() =>{
        const formData = new FormData();
        formData.append('image', image.file);
        formData.append('name', name.current.value);
        formData.append('description', description.current.value);
        formData.append('type', type);
        formData.append('venue', venue);
        formData.append('dateTime', new Date(date.toString().slice(0, date.toString().length-42)).toISOString());
        formData.append('price', price_1.current.value);
        formData.append('price', price_2.current.value);
        formData.append('price', price_3.current.value);
        formData.append('price', price_4.current.value);
        formData.append('price', price_5.current.value);
        formData.append('price', price_6.current.value);
        formData.append('price', price_7.current.value);
        formData.append('price', price_8.current.value);
        const data = await createConcert(formData);
        if (data) alert('Концерт успішно створено');
    }
    
    return (
        <div className='wrapper-add-concert'>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <input ref={name} className='add-concert__input-name' type="text" placeholder='Введіть назву заходу' required={true}/>
                <textarea ref={description} className='add-concert__input-description' type="text" placeholder='Введіть опис заходу' maxLength={1000}/>
            </div>

            <div className='add-concert__input-image'>
                <label className='input-image-label' htmlFor='poster'>{JSON.stringify(image).length-2 ? 'Обрати іншу афішу' : 'Додати афішу'}</label>
                <input className='input-image-invis' type="file" id="poster" name="poster" accept="image/png, image/jpeg" onChange={e => uploadImage(e)} ref={poster}/>
            </div>
            <div style={{marginTop:10, height:80, width:250}}>

            {JSON.stringify(image).length-2 ? (
                <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                    <img className='input-image__poster' src={`data:${image.fileName.split('.')[1]};base64,${arrayBufferToBase64(image.buffer)}`} alt="poster" />
                    <p>{image.fileName}</p>
                    <img className='input-image__button-cancel' src="assets/cancel.png" alt="cansel" onClick={() => {setImage({})
                poster.current.value = null}}/>
                </div>
            ) : null}
            </div>
            

            <div style={{display: 'flex', flexDirection:'row'}}>
                <div style={{marginTop:'30px'}}>
                    <div style={{marginTop:20, width:300}}>
                        <Select
                            getValue={() => type}
                            onChange={value => setType(value?.value)}
                            options={optionsType}
                            isClearable={true}
                            placeholder='Виберіть тип заходу'
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
                                fontSize: '14px',
                                height: "40px",
                                width: "300px",
                                border: "1px solid #B4ADA9",
                                background: 'white',
                                borderColor: state.isFocused ? "#4C382C" : null,
                            })
                            }}
                        />
                    </div>


                    <div style={{marginTop:20, width:300}}>
                        <Select
                            getValue={() => type}
                            onChange={value => setVenue(value?.value)}
                            options={optionsVenue}
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
                                    fontSize: '14px',
                                    height: "40px",
                                    width: "300px",
                                    border: "1px solid #B4ADA9",
                                    background: 'white',
                                    borderColor: state.isFocused ? "#4C382C" : null,
                                })
                            }}
                        />
                    </div>

                    <div style={{marginTop:20}}>
                        <ConfigProvider
                            theme={{
                                components: {
                                    DatePicker: {
                                    },
                                },
                                token: {
                                    colorPrimary: "#FFB800",
                                    colorTextPlaceholder: "#383838",
                                    colorTextDisabled: "#4C382C",
                                    colorTextTertiary: "#4C382C",
                                    controlItemBgActive: "#FFB800"

                                },
                            }}
                        >
                            <DatePicker
                                style={{ borderRadius: 1, borderColor:"#B4ADA9", height: 40, backgroundColor: "white", width: 300, fontSize: "14px"}}
                                variant="filled"
                                showTime
                                activeBorderColor="red"
                                placeholder='Обери дату'
                                format={'YYYY-MM-DD HH:mm'}
                                locale={locale}
                                minDate={dayjs()}
                                onChange={(value) => value ? setDate(new Date(value.$d)) : setDate("")}
                            />
                        </ConfigProvider>
                    </div>
                    <input className='button-add-concert' type="button" value={"Створити"} onClick={() => create()}/>
                </div> 
                <div className='add-concert__wrapper-price'>
                    <div className='wrapper__price-block'>
                        <div className='price-block'>
                            <div style={{backgroundColor:'rgb(40, 21, 189)'}}></div>
                            <input ref={price_1} type="text" placeholder='Введіть ціну' />
                        </div>
                        <div className='price-block'>
                            <div style={{backgroundColor:'rgb(128, 102, 0)'}}></div>
                            <input ref={price_2} type="text" placeholder='Введіть ціну' />
                        </div>
                        <div className='price-block'>
                            <div style={{backgroundColor:'rgb(250, 42, 127)'}}></div>
                            <input ref={price_3} type="text" placeholder='Введіть ціну' />
                        </div>
                        <div className='price-block'>
                            <div style={{backgroundColor:'rgb(0, 128, 128)'}}></div>
                            <input ref={price_4} type="text" placeholder='Введіть ціну' />
                        </div>
                        <div className='price-block'>
                            <div style={{backgroundColor:'rgb(252, 178, 3)'}}></div>
                            <input ref={price_5} type="text" placeholder='Введіть ціну' />
                        </div>
                        <div className='price-block'>
                            <div style={{backgroundColor:'rgb(83, 172, 77)'}}></div>
                            <input ref={price_6} type="text" placeholder='Введіть ціну' />
                        </div>
                        <div className='price-block'>
                            <div style={{backgroundColor:'rgb(207, 89, 207)'}}></div>
                            <input ref={price_7} type="text" placeholder='Введіть ціну' />
                        </div>
                        <div className='price-block'>
                            <div style={{backgroundColor:'rgb(156, 17, 66)'}}></div>
                            <input ref={price_8} type="text" placeholder='Введіть ціну' />
                        </div>
                    </div>
                    <div className='wrapper__hall'>
                        {venue === 'DruzhbaNarodiv' ? (<img src="assets/druzhbaNarodiv.png" alt="" />) : (<div style={{height: 300, width: 200, background: 'grey'}}></div>)}
                        {venue === 'Filarmoniya' ? (<img src="assets/filarmoniya.png" alt="" />) : null}
                        {venue === 'Dramteatr' ? (<img src="assets/dramteatr.png" alt="" />) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddConcert;
