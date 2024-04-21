import React from 'react';
import './adminPanel.css';
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import AddConcert from './AddConcert/AddConcert';
import { observer } from 'mobx-react-lite';
import { store } from '../../store/UserStore';


const AdminPanel = observer(() => {
    return (
        <div style={{display:"flex", flexDirection:'column', alignItems:'center'}}>
            <Header/>
                {store.role == 'ADMIN' ? <AddConcert/> : (<div style={{display:'flex', alignItems:'center', height:'56vh', marginTop:70, fontFamily: 'Vinnytsia Sans', color:'white', fontSize:40, fontWeight:700}}><p>Упс...</p></div>)}
            <Footer/>
        </div>
    );
});

export default AdminPanel;
