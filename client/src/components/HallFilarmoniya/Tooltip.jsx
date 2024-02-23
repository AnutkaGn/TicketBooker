import React from 'react';


const Tooltip = (props) => {
    console.log(props.x, props.y);
    let action = 'Додати в кошик'
    if (props.color == 'rgb(167, 167, 167)') action = "Зайнято"
    else if (props.color == 'rgb(89, 255, 0)') action = "Вже в кошику"
    else if (props.color == 'rgb(255,0,0)') action = "Зарезервовано"
    return (
        <div style={{position: 'absolute', top: props.y, left: props.x, zIndex: 9}}>
            <div style={{position: "relative", display: "inline-block" }}>
                <img src="assets/tooltip.svg" alt="tooltip"/>
                <div style={{ position: "absolute", top: "37%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", margin: "0px", width:"130px"}}>            
                    <p style={{fontSize: "10px", fontWeight: "600", margin: "0 0 5px 0"}}>{action}</p>
                    <p style={{fontSize: "10px", margin: "0px"}}>{props.floor}</p>
                    <p style={{fontSize: "10px", margin: "0px"}}>ряд: {props.row}, місце: {props.seat}</p> 
                </div>
            </div>
        </div>
    );
}

export default Tooltip;
