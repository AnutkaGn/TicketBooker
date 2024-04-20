import React, { useCallback, useEffect } from 'react';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import './slider.css';
import { getConcerts } from '../../../http/concertAPI';
import { observer } from 'mobx-react-lite';
import { store } from '../../../store/UserStore';
import { Skeleton } from '@mui/material';
import { arrayBufferToBase64 } from '../../../consts';
import { useNavigate } from 'react-router-dom';


const responsive = {
    desktop: {
		breakpoint: { max: 3000, min: 1024 },
		items: 4,
		slidesToSlide: 4, // optional, default to 1.
	},
    tablet: {
		breakpoint: { max: 1024, min: 768 },
		items: 3,
		slidesToSlide: 3, // optional, default to 1.
    },
    mobile: {
		breakpoint: { max: 767, min: 464 },
		items: 2,
		slidesToSlide: 1, // optional, default to 1.
    },
};

const SkeletonArea = () => {
	return (
		<div className="slider">
			<Skeleton animation={'wave'} variant={'rectangular'} width={220} height={300}/>
		</div>
	);
};

const skeletonArray = Array.from({ length: 4 }, (v, i) => <SkeletonArea key={i}/>);

const SliderArea = ({id, image}) => {
	const navigate = useNavigate();

	const handleClick = () =>{
		navigate(`/concert/${id}`)
	}
	return (
		<div className="slider" onClick={() => handleClick()}>
			<img src={`data:${image.mimetype};base64,${arrayBufferToBase64(image.buffer?.data)}`} alt="poster"/>
		</div>
	)
}


const Slider = observer(() => {
	const fetchData = useCallback(async () => {
		const data = await getConcerts(undefined, new Date().toString(), undefined, 1, 12);
		store.sliderConcerts = data.concerts;
	});
	useEffect(() => {
		fetchData();
	}, []);

	console.log(skeletonArray)
    return (
        <div className='parent'>
            <Carousel
                responsive={responsive}
                autoPlay={true}
                swipeable={true}
                draggable={true}
                showDots={false}
                infinite={true}
                partialVisible={false}
            >
				{!store.sliderConcerts.length ? skeletonArray : 
				store.sliderConcerts.map(concert => {
                    return (
                        <SliderArea id={concert._id} image={concert.image}/>
                    );
                })}
            </Carousel>
        </div>
    );
});

export default Slider;
