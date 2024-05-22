import React, { useEffect, useState } from 'react';
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import ConcertsArray from './ConcertsArray/ConcertsArray';
import ConcertFilter from './ConcerFilter/ConcertFilter';
import Slider from './Slider/Slider';
import { ConfigProvider, Pagination } from 'antd';
import { observer } from 'mobx-react-lite';
import { store } from '../../store/UserStore';

const HomePage = observer(() => {
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);

    useEffect(() => {
        store.aboutConcert = {};
    }, []);

    return (
        <div>
            <Header/>
            <Slider/>
            <ConcertFilter page={page} setPage={setPage} setCount={setCount} />
            <ConcertsArray/>
            <ConfigProvider
                theme={{
                    components: {
                        Pagination: {
                            colorBgContainer: "#FDF9F6",
                            itemBg: "#FDF9F6",
                            itemActiveBg: "#FDF9F6",
                            colorPrimaryBorder: "#4C382C",
                            colorPrimaryHover: "#4C382C",
                            colorPrimary: "none",
                            colorBorder: "#4C382C",
                            borderRadius: 0,
                            fontFamily: "Golca Light",
                        }
                    }
                }}
            >
                <div style={{display: 'flex', width: "100%", justifyContent: "center"}}>
                    <Pagination pageSize={5} total={count} hideOnSinglePage={true} 
                    current={page} onChange={current => setPage(current)} />
                </div>
            </ConfigProvider>
            <Footer/>
        </div>
    );
});

export default HomePage;
