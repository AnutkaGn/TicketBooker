import React, {useContext, useRef, useEffect} from 'react';
import './hallFilarmoniya.css';
import { observer } from 'mobx-react-lite';
import { Context } from '../..';
import { createTicket, getTickets, deleteTicket, getTicketId, getTicketPrice } from '../../http/ticketAPI';
import { addToTickets } from '../../http/userAPI';
// import Tooltip from './Tooltip';

const HallFilarmoniya = observer(() => {
  const {user} = useContext(Context);
  // const [seat, setSeat] = useState('');
  // const [row, setRow] = useState('');
  // const [floor, setFloor] = useState('');
  // const [color, setColor] = useState('');
  // const [showTooltip, setShowTooltip] = useState(false);
  // const [tooltipX, setTooltipX] = useState(0);
  // const [tooltipY, setTooltipY] = useState(0);
  const circleRef = useRef();
  // const wrapperRef = useRef();
  const id = user.aboutConcert._id;
  
  // Отримати заброньовані квитки
  // додати поле booked та reserved "true" та позначити ці місця сірим та червоним кольором
  useEffect(()=>{
    const fetchTickets = async() =>{
      const {tickets} = await getTickets(id);
      tickets.map(({_id, concertId, row, seat, floor, booked}) => {
        if (concertId === id){
          Array.from(circleRef.current.children).map(circle => {
            if (circle.getAttribute('row') == row && circle.getAttribute('seat') == seat && circle.getAttribute('floor') == floor && booked){
              circle.setAttribute('booked', true);
              circle.style.fill = '#a7a7a7';
            } 
            else if (!user.includesTicketId(_id) && circle.getAttribute('row') == row && circle.getAttribute('seat') == seat && circle.getAttribute('floor') == floor){
              circle.setAttribute('reserved', true);
              circle.style.fill = 'red';
            } 
            else if (user.includesTicketId(_id) && circle.getAttribute('row') == row && circle.getAttribute('seat') == seat && circle.getAttribute('floor') == floor){
              circle.style.fill = '#59ff00';
            }return null
          });
        } return null
      });
    };
    fetchTickets();
  }, []);


  const choosePlace = async(target) => {
    //Перевірка чи заброньований, чи зарезервований квиток
    if (!target.getAttribute('booked') && !target.getAttribute('reserved')){
      //Формування квитка без ціни та ID 
      const ticket = {
          concertId: id,
          row: target.getAttribute('row'),
          seat: target.getAttribute('seat'),
          floor: target.getAttribute('floor'),
      };

      const ticketId = await getTicketId(ticket);
      const concertPrices = user.aboutConcert.price;
      if(!ticketId.message) {
        ticket._id = ticketId;
        //Перевірка чи є даний квиток в сховищі
        if (user.includesTicketToBook(ticket) || user.includesTicketId(ticket._id)){
          ticket.price = await getTicketPrice(ticket._id);
          switch(ticket.price){
            case concertPrices[7] : target.style.fill = 'rgb(156, 17, 66)'; //червоний
              break;
            case concertPrices[6] : target.style.fill = 'rgb(207, 89, 207)'; //рожевий
              break;
            case concertPrices[5] : target.style.fill = 'rgb(83, 172, 77)'; //зелений
              break;
            case concertPrices[4] : target.style.fill = 'rgb(252, 178, 3)'; //помаранчевий 
              break;
            case concertPrices[3] : target.style.fill = 'rgb(0, 128, 128)'; //темнозелений
              break;
            case concertPrices[2] : target.style.fill = 'rgb(250, 42, 127)'; //кораловий
              break;
            case concertPrices[1] : target.style.fill = 'rgb(128, 102, 0)'; //коричневий
              break;
            case concertPrices[0] : target.style.fill = 'rgb(40, 21, 189)'; //синій
              break;      
          }
          
          //Видалити квиток з бази даних та оновити масив квитків у користувача
          const {tickets} = await deleteTicket(ticket._id);
          user.userTickets = tickets;
          user.deleteTicket(ticket);
        }
      }
      else {
          //Формування ціни
          let price;
          switch(target.style.fill){
            case 'rgb(156, 17, 66)': price = concertPrices[7]; //червоний
              break;
            case 'rgb(207, 89, 207)': price = concertPrices[6]; //рожевий
              break;
            case 'rgb(83, 172, 77)': price = concertPrices[5]; //зелений
              break;
            case 'rgb(252, 178, 3)': price = concertPrices[4]; //помаранчевий 
              break;
            case 'rgb(0, 128, 128)': price = concertPrices[3]; //темнозелений
              break;
            case 'rgb(250, 42, 127)': price = concertPrices[2]; //кораловий
              break;
            case 'rgb(128, 102, 0)': price = concertPrices[1]; //коричневий
              break;
            case 'rgb(40, 21, 189)': price = concertPrices[0]; //синій
              break;      
          }
          ticket.price = price;
          //Змінити колір місця (обраного квитка) на зелений
          target.style.fill = '#59ff00';
          //Створити квиток в базі даних
          const data = await createTicket(ticket);
          //Додати в масив квитків користувача
          const {tickets} = await addToTickets(data.newTicket._id);
          //Додати квиток до сховища
          ticket._id = data.newTicket._id;
          user.userTickets = tickets;
          user.ticketsToBook = [...user.ticketsToBook, ticket];
      };
      console.table(ticket);
      console.log(user.ticketsToBook, user.userTickets);
      return;
    } else return;   
  };

  // При наведенні курсора на місце (квиток) змінюєься розмір і додається кордон жовтого кольору
  const enterCircle = (event) =>{
    // const x = event.pageX - 68//- event.target.offsetLeft;
    // const y = event.pageY - wrapperRef.current.offsetTop - 90//- event.target.offsetTop;
    // setTooltipX(x);
    // setTooltipY(y);
    // setSeat(event.target.getAttribute("seat"))
    // setRow(event.target.getAttribute("row"))
    // setFloor(event.target.getAttribute("floor"))
    // setColor(event.target.style.fill)
    event.target.setAttribute('r', '2')
    event.target.style.stroke = 'yellow'
    event.target.style.strokeWidth = '0.5px'
    //setShowTooltip(true)
  }
  // При прибирання курсора з місця (квитка) розмір повертається до стандартного та прибирається кордон
  const leaveCircle = (event) =>{
    event.target.setAttribute('r', '1.25')
    event.target.style.stroke = 'none'
    event.target.style.strokeWidth = '0'
    //setShowTooltip(false)
  }
  // {showTooltip && <Tooltip seat={seat} row={row} floor={floor} color={color} x={tooltipX} y={tooltipY} />}
  return (
      <div className='wrapper-svg-filarmoniya' >
        <svg
    width="210mm"
  height="297mm"
  viewBox="0 0 210 297"
  version="1.1"
  id="svg1"
  xml_space="preserve"
  sodipodi_docname="Філармонія.svg"
  inkscape_version="1.3.2 (091e20e, 2023-11-25, custom)"
  inkscape_export-filename="Філармонія.svg"
  inkscape_export-xdpi="96"
  inkscape_export-ydpi="96"
  xmlns_inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns_sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
  xmlns="http://www.w3.org/2000/svg"
  xmlns_svg="http://www.w3.org/2000/svg"><sodipodi
    id="namedview1"
    pagecolor="#ffffff"
    bordercolor="#000000"
    borderopacity="0.25"
    showpageshadow="2"
    pageopacity="0.0"
    pagecheckerboard="0"
    deskcolor="#d1d1d1"
    document-units="mm"
    lockguides="false"
    zoom="1.3096875"
    cx="256.93152"
    cy="439.79957"
    window-width="1728"
    window-height="992"
    window-x="-8"
    window-y="-8"
    window-maximized="1"
    current-layer="layer4" 
    /><defs
    id="defs1"><path-effect
      effect="fillet_chamfer"
      id="path-effect1715"
      is_visible="true"
      lpeversion="1"
      nodesatellites_param="F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1"
      radius="0"
      unit="px"
      method="auto"
      mode="F"
      chamfer_steps="1"
      flexible="false"
      use_knot_distance="true"
      apply_no_radius="true"
      apply_with_radius="true"
      only_selected="false"
      hide_knots="false" /><path-effect
      effect="fillet_chamfer"
      id="path-effect1714"
      is_visible="true"
      lpeversion="1"
      nodesatellites_param="F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1"
      radius="0"
      unit="px"
      method="auto"
      mode="F"
      chamfer_steps="1"
      flexible="false"
      use_knot_distance="true"
      apply_no_radius="true"
      apply_with_radius="true"
      only_selected="false"
      hide_knots="false" /><rect
      x="97"
      y="471"
      width="48"
      height="15"
      id="rect1700" /><rect
      x="543.41156"
      y="751.30096"
      width="6.7175144"
      height="10.960155"
      id="rect1616" /><rect
      x="200.81833"
      y="766.50375"
      width="11.75565"
      height="10.16466"
      id="rect1613" /><rect
      x="200.81833"
      y="766.50375"
      width="11.861963"
      height="10.651335"
      id="rect1614" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1615" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1617" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1618" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1619" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1620" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1621" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1622" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1623" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1624" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1625" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1626" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1627" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1628" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1629" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1630" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1631" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1632" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1643" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1644" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1645" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1646" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1647" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1648" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1649" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1650" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1651" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1652" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1653" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1654" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1655" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1656" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1657" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1658" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1659" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1660" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1661" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1662" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1670" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1671" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1672" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1673" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1674" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1675" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1676" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1677" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1678" /><rect
      x="200.81833"
      y="766.50375"
      width="11.75565"
      height="10.16466"
      id="rect1680" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1681" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1682" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1683" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1684" /><rect
      x="200.81833"
      y="766.50375"
      width="11.75565"
      height="10.16466"
      id="rect1688" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1689" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1690" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1691" /><rect
      x="200.81833"
      y="766.50375"
      width="12.81631"
      height="11.667262"
      id="rect1692" /></defs><g
    groupmode="layer"
    id="layer4"
    label="Lable_number"
    style={{display: 'inline'}}><path
      id="rect1708"
      style= {{fill:"#f2f2f2", fillOpacity:1, strokeWidth:'0.279615'}}
      d="m 48.086004,91.153519 c -5.440492,0 -9.820587,4.44183 -9.820587,9.959091 v 116.36293 l 1.131197,-0.38344 1.488281,-0.45837 1.389061,-0.44131 1.124478,-0.37362 1.058334,-0.30541 0.942577,-0.28887 0.959115,-0.25477 0.892969,-0.2713 0.909505,-0.23771 0.892968,-0.22117 1.07487,-0.1695 0.942579,-0.17002 1.091405,-0.25476 1.124479,-0.2713 0.876434,-0.15297 0.892968,-0.2036 0.760678,-0.13591 0.644921,-0.13591 0.84336,-0.17002 1.240234,-0.25424 1.141017,-0.23772 1.223698,-0.20412 0.926042,-0.15296 1.17409,-0.15245 0.810286,-0.1359 1.107944,-0.13591 2.624646,-0.32091 1.637109,-0.28836 1.497067,-0.19172 1.355989,-0.19223 1.122929,-0.14418 1.262455,-0.0961 1.403532,-0.14366 1.35599,-0.14418 1.871203,-0.14417 2.104782,-0.0961 1.519803,-0.0481 1.473296,-0.0362 1.4149,-0.0357 1.298112,-0.0481 1.613852,-0.0724 1.76527,-0.0718 1.49707,-0.0599 2.27996,-0.0605 2.99362,-0.0481 2.385384,-0.0481 3.086644,-0.0481 2.99361,0.0971 1.63711,0.0481 h 1.96422 l 2.24534,0.11989 2.36162,0.0961 2.12803,0.14417 2.36213,0.0961 2.40864,0.19172 1.68413,0.16847 1.40302,0.11989 1.49655,0.16794 1.66036,0.16847 1.28675,0.11989 3.97598,0.49558 3.10885,0.33951 2.9006,0.4377 1.52032,0.26407 1.77716,0.33589 1.82417,0.33642 2.19832,0.50436 1.91771,0.43201 1.59009,0.38448 1.61386,0.38395 1.80093,0.4563 1.4733,0.43202 1.21596,0.36018 1.56684,0.55243 1.19269,0.40824 1.05213,0.36018 1.02939,0.38448 1.00563,0.38395 0.86506,0.33642 0.89659,0.31884 c 0.004,-0.0529 0.008,-0.10577 0.008,-0.15968 V 101.11261 c 0,-5.517261 -4.37958,-9.959091 -9.82009,-9.959091 z" /><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,3.1672834,0.61880829)"
      id="text1613"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan225"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan224">1</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,90.479823,0.41860134)"
      id="text1614"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan227"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan226">1</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,91.867786,-3.0853987)"
      id="text1615"
    style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan229"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan228">2</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,2.3380998,-3.0853987)"
      id="text1616"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan231"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan230">2</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,1.2380998,-6.7895656)"
      id="text1617"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan233"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan232">3</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,93.013061,-6.7895656)"
      id="text1618"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan235"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan234">3</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-22.135399)"
      id="text1619"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan237"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan236">4</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371474,-22.135399)"
      id="text1620"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan239"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan238">4</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-25.710399)"
      id="text1621"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan241"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan240">5</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-29.385399)"
      id="text1623"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan243"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan242">6</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-33.089568)"
      id="text1624"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan245"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan244">7</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-36.923399)"
      id="text1625"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan247"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan246">8</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-40.427399)"
      id="text1626"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan249"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan248">9</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-44.231399)"
      id="text1627"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan251"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan250">10</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-48.035399)"
      id="text1628"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan253"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan252">11</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-51.739399)"
      id="text1629"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan255"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan254">12</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-55.443399)"
      id="text1630"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan257"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan256">13</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-0.87856688,-59.247399)"
      id="text1631"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan259"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan258">14</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,14.11512,-75.650538)"
      id="text1632"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan261"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan260">15</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-25.710399)"
      id="text1633"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan263"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan262">5</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-29.385399)"
      id="text1634"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan265"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan264">6</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-33.089568)"
      id="text1635"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan267"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan266">7</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-36.923399)"
      id="text1636"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan269"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan268">8</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-40.427399)"
      id="text1637"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan271"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan270">9</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-44.231399)"
      id="text1638"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan273"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan272">10</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-48.035399)"
      id="text1639"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan275"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan274">11</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-51.739399)"
      id="text1640"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan277"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan276">12</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-55.443399)"
      id="text1641"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan279"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan278">13</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,94.371479,-59.247399)"
      id="text1642"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan281"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan280">14</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,78.49647,-75.751407)"
      id="text1643"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan283"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan282">15</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,14.11512,-79.354707)"
      id="text1653"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan285"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan284">16</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,14.11512,-83.058876)"
      id="text1654"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan287"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan286">17</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,14.11512,-86.763045)"
      id="text1655"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan289"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan288">18</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,14.11512,-90.596399)"
      id="text1657"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan291"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan290">19</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,14.11512,-94.300568)"
      id="text1658"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan293"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan292">20</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,14.11512,-98.004737)"
      id="text1659"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan295"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan294">21</tspan></tspan></text><path
      id="path1715"
      style={{fill: '#cccccc', fillOpacity: '1', strokeWidth: '0.267702'}}
      d="m 102.7984,213.72182 -3.077393,0.0481 -2.378239,0.0481 -2.984647,0.0481 -2.273136,0.0605 -1.492581,0.06 -1.759979,0.0718 -1.609021,0.0723 -1.294224,0.0481 -1.410661,0.0357 -1.468883,0.0362 -1.515251,0.0481 -2.098477,0.0961 -1.865597,0.14418 -1.351929,0.14417 -1.399327,0.14366 -1.258674,0.0961 -1.119565,0.14418 -1.351927,0.19224 -1.492583,0.19172 -1.632205,0.28835 -2.616783,0.32091 -1.104625,0.13591 -0.807858,0.13591 -1.170572,0.15244 -0.923268,0.15297 -1.220032,0.20412 -1.137598,0.23771 -1.236519,0.25425 -0.840834,0.17001 -0.642989,0.13591 -0.758399,0.13591 -0.890293,0.20361 -0.873808,0.15296 -1.121111,0.2713 -1.088136,0.25476 -0.939755,0.17002 -1.07165,0.1695 -0.890294,0.22117 -0.906781,0.23772 -0.890294,0.2713 -0.956241,0.25476 -0.939754,0.28887 -1.055164,0.30541 -1.121111,0.37362 -1.384901,0.44132 -1.483824,0.45837 -1.599231,0.54363 0.01649,7.40265 -0.01649,0.006 0.02474,11.02155 0.179295,-0.0403 0.217937,-0.0708 0.629594,-0.20412 0.699664,-0.26407 0.779522,-0.27181 0.766642,-0.28009 0.840833,-0.31419 0.964485,-0.33125 0.816102,-0.26303 1.195303,-0.33538 0.663598,-0.22945 0.61826,-0.18241 0.664629,-0.19327 0.839287,-0.2403 0.979426,-0.28835 0.955727,-0.23978 0.862987,-0.26459 1.18912,-0.26406 1.375627,-0.26407 1.585321,-0.3359 1.72546,-0.40824 2.005222,-0.28835 2.362782,-0.43047 1.137598,-0.19533 1.088137,-0.11059 1.203545,-0.18655 1.137598,-0.15297 1.228276,-0.16123 1.308134,-0.18552 1.125233,-0.15606 1.055163,-0.13229 1.1309,-0.11369 1.165419,-0.14418 2.52456,-0.27026 1.121111,-0.0677 1.318954,-0.13591 1.450849,-0.1695 1.879509,-0.10232 1.780588,-0.0677 2.818234,-0.18345 1.900117,-0.0718 3.183007,-0.15607 2.471493,-0.0723 h 2.074776 l 2.588447,-0.0238 h 3.170643 l 3.61424,0.0481 3.84713,0.0718 4.77966,0.2403 2.19173,0.0481 1.76049,0.0362 2.05159,0.10801 2.56475,0.23977 2.39009,0.2403 1.56214,0.14418 1.28236,0.11989 1.30556,0.0961 1.30608,0.14418 1.18911,0.11989 1.18913,0.19224 1.37563,0.16795 1.46888,0.14417 1.39881,0.2403 1.53895,0.26407 1.84189,0.26406 2.09848,0.38396 2.54929,0.52193 0.95625,0.2036 0.90677,0.22066 0.80787,0.17002 0.92326,0.18655 1.02219,0.25477 1.01807,0.24339 1.49259,0.40825 1.3988,0.38447 2.02841,0.57619 2.0753,0.67231 1.6322,0.62425 1.51525,0.55242 1.56214,0.67231 1.0871,0.44442 0.003,-10.81588 -0.002,-5.1e-4 0.002,-7.40782 -0.0175,-0.005 -0.93254,-0.33279 -0.86246,-0.33642 -1.00262,-0.38395 -1.02631,-0.38448 -1.04898,-0.36018 -1.18911,-0.40824 -1.56214,-0.55243 -1.21231,-0.36018 -1.46888,-0.43202 -1.79553,-0.4563 -1.60902,-0.38395 -1.58532,-0.38448 -1.91197,-0.43201 -2.19173,-0.50436 -1.81871,-0.33642 -1.77184,-0.33589 -1.51576,-0.26407 -2.89191,-0.4377 -3.09954,-0.33951 -3.96407,-0.49558 -1.2829,-0.11989 -1.65538,-0.16847 -1.49207,-0.16794 -1.39882,-0.11989 -1.67908,-0.16847 -2.40143,-0.19172 -2.35505,-0.0961 -2.12166,-0.14417 -2.35454,-0.0961 -2.23862,-0.11989 h -1.95833 l -1.63221,-0.0481 z" /><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,14.11512,-102.0384)"
      id="text1660"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan297"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan296">22</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,14.11512,-105.8424)"
      id="text1661"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan299"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan298">23</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,78.4731,-79.354707)"
      id="text1662"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan301"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan300">16</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,78.4731,-83.058876)"
      id="text1663"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan303"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan302">17</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,78.4731,-86.763045)"
      id="text1664"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan387"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan304">18</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,78.4731,-90.596399)"
      id="text1666"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan393"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan392">19</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,78.4731,-94.300568)"
      id="text1667"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan395"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan394">20</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,78.4731,-98.004737)"
      id="text1668"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan397"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan396">21</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,78.4731,-102.0384)"
      id="text1669"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan399"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan398">22</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,78.4731,-105.8424)"
      id="text1670"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan401"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan400">23</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-2.6535503,-124.3644)"
      id="text1678"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan403"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan402">1</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-2.5389002,-128.4274)"
      id="text1679"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan405"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan404">2</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-2.565772,-132.6314)"
      id="text1680"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan407"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan406">3</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-2.5254643,-136.7644)"
      id="text1682"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan409"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan408">4</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,-2.5802414,-140.84027)"
      id="text1683"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan411"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan410">5</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,95.771491,-124.3644)"
      id="text1684"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan413"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan412">1</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,95.886141,-128.4274)"
      id="text1685"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan415"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan414">2</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,95.859269,-132.7314)"
      id="text1686"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan417"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan416">3</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,95.899577,-136.7644)"
      id="text1687"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan419"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan418">4</tspan></tspan></text><text
      space="preserve"
      transform="matrix(0.26458333,0,0,0.26458333,95.8448,-140.84027)"
      id="text1688"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize:'8px', fontFamily: 'Arial', whiteSpace: 'pre', display: 'inline', fill: '#ff00ff', fillOpacity: '1'}}><tspan
        x="200.81836"
        y="773.70994"
        id="tspan421"><tspan
          style={{fill: '#1a1a1a'}}
          id="tspan420">5</tspan></tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '3.52778px', fontFamily: 'Arial', writingMode: 'tb-rl', textOrientation: 'sideways', fill: '#1a1a1a', fillOpacity: '1', strokeWidth:'0.264583'}}
      x="-173.15326"
      y="17.116259"
      id="text1696"
      transform="rotate(-90)"><tspan
        style={{fontSize: '3.52778px', textAlign: 'center', writingMode: 'tb-rl', direction: 'rtl', textOrientation: 'sideways', textAnchor: 'middle', strokeWidth: '0.264583'}}
        x="-173.15326"
        y="17.116259"
        role="line"
        id="tspan1699">ПРАВА</tspan><tspan
        style={{fontSize: '3.52778px', textAlign: 'center', writingMode: 'tb-rl', direction: 'rtl', textOrientation: 'sideways', textAnchor: 'middle', strokeWidth: '0.264583'}}
        x="-177.56299"
        y="17.116259"
        role="line"
        id="tspan1704">СТОРОНА</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '3.52778px', fontFamily: 'Arial', writingMode: 'tb-rl', textOrientation: 'sideways', fill: '#1a1a1a', fillOpacity: '1', strokeWidth:'0.264583'}}
      x="-173.68242"
      y="184.44926"
      id="text1702"
      transform="rotate(-90)"><tspan
        style={{fontSize: '3.52778px', textAlign: 'center', writingMode: 'tb-rl', direction: 'rtl', textOrientation: 'sideways', textAnchor: 'middle', strokeWidth: '0.264583'}}
        x="-173.68242"
        y="184.44926"
        role="line"
        id="tspan1703">ЛІВА </tspan><tspan
        style={{fontSize: '3.52778px', textAlign: 'center', writingMode: 'tb-rl', direction: 'rtl', textOrientation: 'sideways', textAnchor: 'middle', strokeWidth: '0.264583'}}
        x="-178.09215"
        y="184.44926"
        role="line"
        id="tspan1705">СТОРОНА</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '3.52778px', fontFamily: 'Arial', writingMode: 'tb-rl', textOrientation: 'sideways', fill: '#1a1a1a', fillOpacity: '1', strokeWidth:'0.264583'}}
      x="-87.163666"
      y="101.1055"
      id="text1707"
      transform="rotate(-90)"><tspan
        style={{fontSize: '3.52778px', textAlign: 'center', writingMode: 'tb-rl', direction: 'rtl', textOrientation: 'sideways', textAnchor: 'middle', strokeWidth: '0.264583'}}
        x="-87.163666"
        y="101.1055"
        role="line"
        id="tspan1707">БАЛКОН</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '5.64444px', fontFamily: 'Arial', writingMode: 'tb-rl', textOrientation: 'sideways', fill: '#1a1a1a', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="-224.48241"
      y="101.10503"
      id="text1708"
      transform="rotate(-90)"><tspan
        style={{fontSize: '5.64444px', textAlign: 'center', writingMode: 'tb-rl', direction: 'rtl', textOrientation: 'sideways', textAnchor: 'middle', strokeWidth: '0.264583'}}
        x="-224.48241"
        y="101.10503"
        role="line"
        id="tspan1708">СЦЕНА</tspan></text></g>
        <g ref={circleRef} label="Circle" groupmode="layer" id="layer1" style={{display: 'inline'}}>
    <circle
    onMouseOver={e => enterCircle(e)}
    onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill:'#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="path11"
      cx="139.2798"
      cy="204.30118"
      label="circle1"
      r="1.25"
      row="1"
      seat="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} 
      /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse11"
      cx="136.005"
      cy="204.30118"
      label="circle2"
      r="1.25"
      seat="2"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse12"
      cx="132.83005"
      cy="204.3168"
      label="circle3"
      r="1.25"
      seat="3"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse13"
      cx="129.755"
      cy="204.33223"
      label="circle4"
      r="1.25"
      seat="4"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse14"
      cx="126.58002"
      cy="204.33223"
      label="circle5"
      r="1.25"
      seat="5"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse15"
      cx="123.505"
      cy="204.3168"
      label="circle6"
      r="1.25"
      seat="6"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse16"
      cx="120.43"
      cy="204.3168"
      label="circle7"
      r="1.25"
      seat="7"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse17"
      cx="117.255"
      cy="204.3168"
      label="circle8"
      r="1.25"
      seat="8"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse18"
      cx="114.08"
      cy="204.3168"
      label="circle9"
      r="1.25"
      seat="9"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse19"
      cx="111.005"
      cy="204.3168"
      label="circle10"
      r="1.25"
      seat="10"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse20"
      cx="107.93"
      cy="204.3168"
      label="circle11"
      r="1.25"
      seat="11"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse21"
      cx="104.855"
      cy="204.3168"
      label="circle12"
      r="1.25"
      seat="12"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse22"
      cx="101.88"
      cy="204.3168"
      label="circle13"
      r="1.25"
      seat="13"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse23"
      cx="98.705002"
      cy="204.3168"
      label="circle14"
      r="1.25"
      seat="14"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse24"
      cx="95.730003"
      cy="204.3168"
      label="circle15"
      r="1.25"
      seat="15"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse25"
      cx="92.654999"
      cy="204.3168"
      label="circle16"
      r="1.25"
      seat="16"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse26"
      cx="89.580002"
      cy="204.3168"
      label="circle17"
      r="1.25"
      seat="17"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse27"
      cx="86.404999"
      cy="204.3168"
      label="circle18"
      r="1.25"
      seat="18"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse28"
      cx="83.330002"
      cy="204.3168"
      label="circle19"
      r="1.25"
      seat="19"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse29"
      cx="80.355003"
      cy="204.3168"
      label="circle20"
      r="1.25"
      seat="20"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse30"
      cx="77.379997"
      cy="204.3168"
      label="circle21"
      r="1.25"
      seat="21"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse31"
      cx="74.305"
      cy="204.3168"
      label="circle22"
      r="1.25"
      seat="22"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse32"
      cx="71.129997"
      cy="204.3168"
      label="circle23"
      r="1.25"
      seat="23"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse33"
      cx="67.855003"
      cy="204.3168"
      label="circle24"
      r="1.25"
      seat="24"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse34"
      cx="64.779999"
      cy="204.3168"
      label="circle25"
      r="1.25"
      seat="25"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse35"
      cx="61.604996"
      cy="204.3168"
      label="circle26"
      r="1.25"
      seat="26"
      row="1"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.247608'}}
      id="ellipse36"
      cx="140.77985"
      cy="200.83321"
      label="circle1"
      r="1.25"
      seat="1"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse37"
      cx="137.50505"
      cy="200.84163"
      label="circle2"
      r="1.25"
      seat="2"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse38"
      cx="134.33009"
      cy="200.84163"
      label="circle3"
      r="1.25"
      seat="3"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse39"
      cx="131.25505"
      cy="200.84163"
      label="circle4"
      r="1.25"
      seat="4"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse40"
      cx="128.08002"
      cy="200.84163"
      label="circle5"
      r="1.25"
      seat="5"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse41"
      cx="125.005"
      cy="200.84163"
      label="circle6"
      r="1.25"
      seat="6"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse42"
      cx="121.93"
      cy="200.84163"
      label="circle7"
      r="1.25"
      seat="7"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse43"
      cx="118.755"
      cy="200.84163"
      label="circle8"
      r="1.25"
      seat="8"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse44"
      cx="115.58"
      cy="200.84163"
      label="circle9"
      r="1.25"
      seat="9"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse45"
      cx="112.505"
      cy="200.84163"
      label="circle10"
      r="1.25"
      seat="10"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse46"
      cx="109.43"
      cy="200.84163"
      label="circle11"
      r="1.25"
      seat="11"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse47"
      cx="106.355"
      cy="200.84163"
      label="circle12"
      r="1.25"
      seat="12"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse48"
      cx="103.38"
      cy="200.84163"
      label="circle13"
      r="1.25"
      seat="13"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse49"
      cx="100.20499"
      cy="200.84163"
      label="circle14"
      r="1.25"
      seat="14"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse50"
      cx="97.229988"
      cy="200.84163"
      label="circle15"
      r="1.25"
      seat="15"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse51"
      cx="94.154984"
      cy="200.84163"
      label="circle16"
      r="1.25"
      seat="16"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse52"
      cx="91.079987"
      cy="200.84163"
      label="circle17"
      r="1.25"
      seat="17"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse53"
      cx="87.904984"
      cy="200.84163"
      label="circle18"
      r="1.25"
      seat="18"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse54"
      cx="84.829987"
      cy="200.84163"
      label="circle19"
      r="1.25"
      seat="19"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse55"
      cx="81.854988"
      cy="200.84163"
      label="circle20"
      r="1.25"
      seat="20"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse56"
      cx="78.879982"
      cy="200.84163"
      label="circle21"
      r="1.25"
      seat="21"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse57"
      cx="75.804985"
      cy="200.84163"
      label="circle22"
      r="1.25"
      seat="22"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse58"
      cx="72.629982"
      cy="200.84163"
      label="circle23"
      r="1.25"
      seat="23"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse59"
      cx="69.354988"
      cy="200.84163"
      label="circle24"
      r="1.25"
      seat="24"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse60"
      cx="66.279984"
      cy="200.84163"
      label="circle25"
      r="1.25"
      seat="25"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse61"
      cx="63.105"
      cy="200.84163"
      label="circle26"
      r="1.25"
      seat="26"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse62"
      cx="60.029999"
      cy="200.84163"
      label="circle27"
      r="1.25"
      seat="27"
      row="2"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse63"
      cx="142.57991"
      cy="197.13762"
      label="circle1"
      r="1.25"
      seat="1"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse64"
      cx="139.30511"
      cy="197.13762"
      label="circle2"
      r="1.25"
      seat="2"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse65"
      cx="136.13016"
      cy="197.13762"
      label="circle3"
      r="1.25"
      seat="3"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse66"
      cx="133.05511"
      cy="197.13762"
      label="circle4"
      r="1.25"
      seat="4"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse67"
      cx="129.88008"
      cy="197.13762"
      label="circle5"
      r="1.25"
      seat="5"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse68"
      cx="126.805"
      cy="197.13762"
      label="circle6"
      r="1.25"
      seat="6"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse69"
      cx="123.73"
      cy="197.13762"
      label="circle7"
      r="1.25"
      seat="7"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse70"
      cx="120.555"
      cy="197.13762"
      label="circle8"
      r="1.25"
      seat="8"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse71"
      cx="117.38"
      cy="197.13762"
      label="circle9"
      r="1.25"
      seat="9"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse72"
      cx="114.305"
      cy="197.13762"
      label="circle10"
      r="1.25"
      row="3"
      floor="parterre"
      seat="10" /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse73"
      cx="111.23"
      cy="197.13762"
      label="circle11"
      r="1.25"
      seat="11"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse74"
      cx="108.155"
      cy="197.13762"
      label="circle12"
      r="1.25"
      seat="12"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse75"
      cx="105.18"
      cy="197.13762"
      label="circle13"
      r="1.25"
      seat="13"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse76"
      cx="102.00499"
      cy="197.13762"
      label="circle14"
      r="1.25"
      seat="14"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse77"
      cx="99.029961"
      cy="197.13762"
      label="circle15"
      r="1.25"
      seat="15"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse78"
      cx="95.954956"
      cy="197.13762"
      label="circle16"
      r="1.25"
      seat="16"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse79"
      cx="92.879959"
      cy="197.13762"
      label="circle17"
      r="1.25"
      seat="17"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse80"
      cx="89.704956"
      cy="197.13762"
      label="circle18"
      r="1.25"
      seat="18"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse81"
      cx="86.629959"
      cy="197.13762"
      label="circle19"
      r="1.25"
      seat="19"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse82"
      cx="83.654961"
      cy="197.13762"
      label="circle20"
      r="1.25"
      seat="20"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse83"
      cx="80.679955"
      cy="197.13762"
      label="circle21"
      r="1.25"
      seat="21"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse84"
      cx="77.604958"
      cy="197.13762"
      label="circle22"
      r="1.25"
      seat="22"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse85"
      cx="74.429955"
      cy="197.13762"
      label="circle23"
      r="1.25"
      seat="23"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse86"
      cx="71.154961"
      cy="197.13762"
      label="circle24"
      r="1.25"
      seat="24"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse87"
      cx="68.079956"
      cy="197.13762"
      label="circle25"
      r="1.25"
      seat="25"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse88"
      cx="64.904984"
      cy="197.13762"
      label="circle26"
      r="1.25"
      seat="26"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse89"
      cx="61.830002"
      cy="197.13762"
      label="circle27"
      r="1.25"
      seat="27"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#9c1142', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="ellipse90"
      cx="58.654999"
      cy="197.13762"
      label="circle28"
      r="1.25"
      seat="28"
      row="3"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle228"
      cx="144.24272"
      cy="181.77657"
      label="circle1"
      r="1.25"
      seat="1"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle229"
      cx="140.96793"
      cy="181.77657"
      label="circle2"
      r="1.25"
      seat="2"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle230"
      cx="137.79297"
      cy="181.79219"
      label="circle3"
      r="1.25"
      seat="3"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="ellipse230"
      cx="134.71793"
      cy="181.80762"
      label="circle4"
      r="1.25"
      seat="4"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="ellipse231"
      cx="131.54295"
      cy="181.80762"
      label="circle5"
      r="1.25"
      seat="5"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle231"
      cx="128.46797"
      cy="181.79219"
      label="circle6"
      r="1.25"
      seat="6"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle232"
      cx="125.39297"
      cy="181.79219"
      label="circle7"
      r="1.25"
      seat="7"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle233"
      cx="122.21798"
      cy="181.79219"
      label="circle8"
      r="1.25"
      seat="8"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle234"
      cx="119.043"
      cy="181.79219"
      label="circle9"
      r="1.25"
      seat="9"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle235"
      cx="115.96798"
      cy="181.79219"
      label="circle10"
      r="1.25"
      seat="10"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle236"
      cx="112.89297"
      cy="181.79219"
      label="circle11"
      r="1.25"
      seat="11"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle237"
      cx="109.81799"
      cy="181.79219"
      label="circle12"
      r="1.25"
      seat="12"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle238"
      cx="106.84298"
      cy="181.79219"
      label="circle13"
      r="1.25"
      seat="13"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle239"
      cx="103.66798"
      cy="181.79219"
      label="circle14"
      r="1.25"
      seat="14"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle240"
      cx="100.69302"
      cy="181.79219"
      label="circle15"
      r="1.25"
      seat="15"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle241"
      cx="97.617996"
      cy="181.79219"
      label="circle16"
      r="1.25"
      seat="16"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle242"
      cx="94.542999"
      cy="181.79219"
      label="circle17"
      r="1.25"
      seat="17"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle243"
      cx="91.367996"
      cy="181.79219"
      label="circle18"
      r="1.25"
      seat="18"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle244"
      cx="88.292999"
      cy="181.79219"
      label="circle19"
      r="1.25"
      seat="19"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle245"
      cx="85.318001"
      cy="181.79219"
      label="circle20"
      r="1.25"
      seat="20"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle246"
      cx="82.342995"
      cy="181.79219"
      label="circle21"
      r="1.25"
      seat="21"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle247"
      cx="79.267998"
      cy="181.79219"
      label="circle22"
      r="1.25"
      seat="22"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle248"
      cx="76.092995"
      cy="181.79219"
      label="circle23"
      r="1.25"
      seat="23"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle249"
      cx="72.818001"
      cy="181.79219"
      label="circle24"
      r="1.25"
      seat="24"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle250"
      cx="69.742996"
      cy="181.79219"
      label="circle25"
      r="1.25"
      seat="25"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle251"
      cx="66.567993"
      cy="181.79219"
      label="circle26"
      r="1.25"
      seat="26"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#cf59cf', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="circle386"
      cx="63.427078"
      cy="181.79201"
      label="circle27"
      r="1.25"
      seat="27"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#cf59cf', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="circle387"
      cx="60.252083"
      cy="181.79201"
      label="circle28"
      r="1.25"
      seat="28"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#cf59cf', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="circle388"
      cx="57.07708"
      cy="181.79201"
      label="circle29"
      r="1.25"
      seat="29"
      row="4"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="ellipse251"
      cx="142.66783"
      cy="178.217"
      label="circle1"
      r="1.25"
      seat="1"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle252"
      cx="139.39304"
      cy="178.217"
      label="circle2"
      r="1.25"
      seat="2"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle253"
      cx="136.21808"
      cy="178.217"
      label="circle3"
      r="1.25"
      seat="3"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle254"
      cx="133.14304"
      cy="178.217"
      label="circle4"
      r="1.25"
      seat="4"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle255"
      cx="129.968"
      cy="178.217"
      label="circle5"
      r="1.25"
      seat="5"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle256"
      cx="126.89299"
      cy="178.217"
      label="circle6"
      r="1.25"
      seat="6"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle257"
      cx="123.81799"
      cy="178.217"
      label="circle7"
      r="1.25"
      seat="7"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle258"
      cx="120.64301"
      cy="178.217"
      label="circle8"
      r="1.25"
      seat="8"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle259"
      cx="117.46801"
      cy="178.217"
      label="circle9"
      r="1.25"
      seat="9"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle260"
      cx="114.39301"
      cy="178.217"
      label="circle10"
      r="1.25"
      seat="10"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle261"
      cx="111.31799"
      cy="178.217"
      label="circle11"
      r="1.25"
      seat="11"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle262"
      cx="108.243"
      cy="178.217"
      label="circle12"
      r="1.25"
      seat="12"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle263"
      cx="105.26801"
      cy="178.217"
      label="circle13"
      r="1.25"
      seat="13"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle264"
      cx="102.09299"
      cy="178.217"
      label="circle14"
      r="1.25"
      seat="14"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle265"
      cx="99.118004"
      cy="178.217"
      label="circle15"
      r="1.25"
      seat="15"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle266"
      cx="96.042984"
      cy="178.217"
      label="circle16"
      r="1.25"
      seat="16"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle267"
      cx="92.967987"
      cy="178.217"
      label="circle17"
      r="1.25"
      seat="17"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle268"
      cx="89.792984"
      cy="178.217"
      label="circle18"
      r="1.25"
      seat="18"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle269"
      cx="86.717987"
      cy="178.217"
      label="circle19"
      r="1.25"
      seat="19"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle270"
      cx="83.742989"
      cy="178.217"
      label="circle20"
      r="1.25"
      seat="20"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle271"
      cx="80.767982"
      cy="178.217"
      label="circle21"
      r="1.25"
      seat="21"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle272"
      cx="77.692986"
      cy="178.217"
      label="circle22"
      r="1.25"
      seat="22"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle273"
      cx="74.517982"
      cy="178.217"
      label="circle23"
      r="1.25"
      seat="23"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle274"
      cx="71.242989"
      cy="178.217"
      label="circle24"
      r="1.25"
      seat="24"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle275"
      cx="68.167984"
      cy="178.217"
      label="circle25"
      r="1.25"
      seat="25"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle276"
      cx="64.992996"
      cy="178.217"
      label="circle26"
      r="1.25"
      seat="26"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle277"
      cx="61.917999"
      cy="178.217"
      label="circle27"
      r="1.25"
      seat="27"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#cf59cf', fillOpacity:'1', strokeWidth: '0.248452'}}
      id="circle390"
      cx="58.611"
      cy="178.217"
      label="circle28"
      r="1.25"
      seat="28"
      row="5"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle278"
      cx="144.26788"
      cy="174.513"
      label="circle1"
      r="1.25"
      seat="1"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle279"
      cx="140.99309"
      cy="174.513"
      label="circle2"
      r="1.25"
      seat="2"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle280"
      cx="137.81813"
      cy="174.513"
      label="circle3"
      r="1.25"
      seat="3"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle281"
      cx="134.74309"
      cy="174.513"
      label="circle4"
      r="1.25"
      seat="4"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle282"
      cx="131.56805"
      cy="174.513"
      label="circle5"
      r="1.25"
      seat="5"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle283"
      cx="128.49298"
      cy="174.513"
      label="circle6"
      r="1.25"
      seat="6"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle284"
      cx="125.41797"
      cy="174.513"
      label="circle7"
      r="1.25"
      seat="7"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle285"
      cx="122.24298"
      cy="174.513"
      label="circle8"
      r="1.25"
      seat="8"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle286"
      cx="119.068"
      cy="174.513"
      label="circle9"
      r="1.25"
      seat="9"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle287"
      cx="115.99298"
      cy="174.513"
      label="circle10"
      r="1.25"
      seat="10"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle288"
      cx="112.91799"
      cy="174.513"
      label="circle11"
      r="1.25"
      seat="11"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle289"
      cx="109.84303"
      cy="174.513"
      label="circle12"
      r="1.25"
      seat="12"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle290"
      cx="106.86798"
      cy="174.513"
      label="circle13"
      r="1.25"
      seat="13"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle291"
      cx="103.693"
      cy="174.513"
      label="circle14"
      r="1.25"
      seat="14"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle292"
      cx="100.71797"
      cy="174.513"
      label="circle15"
      r="1.25"
      seat="15"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle293"
      cx="97.642952"
      cy="174.513"
      label="circle16"
      r="1.25"
      seat="16"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle294"
      cx="94.567955"
      cy="174.513"
      label="circle17"
      r="1.25"
      seat="17"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle295"
      cx="91.392952"
      cy="174.513"
      label="circle18"
      r="1.25"
      seat="18"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle296"
      cx="88.317955"
      cy="174.513"
      label="circle19"
      r="1.25"
      seat="19"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle297"
      cx="85.342957"
      cy="174.513"
      label="circle20"
      r="1.25"
      seat="20"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle298"
      cx="82.36795"
      cy="174.513"
      label="circle21"
      r="1.25"
      seat="21"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle299"
      cx="79.292953"
      cy="174.513"
      label="circle22"
      r="1.25"
      seat="22"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle300"
      cx="76.11795"
      cy="174.513"
      label="circle23"
      r="1.25"
      seat="23"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle301"
      cx="72.842957"
      cy="174.513"
      label="circle24"
      r="1.25"
      seat="24"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle302"
      cx="69.767952"
      cy="174.513"
      label="circle25"
      r="1.25"
      seat="25"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle303"
      cx="66.592979"
      cy="174.513"
      label="circle26"
      r="1.25"
      seat="26"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle304"
      cx="63.517998"
      cy="174.513"
      label="circle27"
      r="1.25"
      seat="27"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle305"
      cx="60.342999"
      cy="174.513"
      label="circle28"
      r="1.25"
      seat="28"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#cf59cf', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle385"
      cx="57.167995"
      cy="174.513"
      label="circle29"
      r="1.25"
      seat="29"
      row="6"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="ellipse391"
      cx="142.66783"
      cy="170.709"
      label="circle1"
      r="1.25"
      seat="1"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle391"
      cx="139.39304"
      cy="170.709"
      label="circle2"
      r="1.25"
      seat="2"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle392"
      cx="136.21808"
      cy="170.709"
      label="circle3"
      r="1.25"
      seat="3"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle393"
      cx="133.14304"
      cy="170.709"
      label="circle4"
      r="1.25"
      seat="4"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle394"
      cx="129.968"
      cy="170.709"
      label="circle5"
      r="1.25"
      seat="5"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle395"
      cx="126.89299"
      cy="170.709"
      label="circle6"
      r="1.25"
      seat="6"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle396"
      cx="123.81799"
      cy="170.709"
      label="circle7"
      r="1.25"
      seat="7"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle397"
      cx="120.64301"
      cy="170.709"
      label="circle8"
      r="1.25"
      seat="8"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle398"
      cx="117.46801"
      cy="170.709"
      label="circle9"
      r="1.25"
      seat="9"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle399"
      cx="114.39301"
      cy="170.709"
      label="circle10"
      r="1.25"
      seat="10"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle400"
      cx="111.31799"
      cy="170.709"
      label="circle11"
      r="1.25"
      seat="11"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle401"
      cx="108.243"
      cy="170.709"
      label="circle12"
      r="1.25"
      seat="12"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle402"
      cx="105.26801"
      cy="170.709"
      label="circle13"
      r="1.25"
      seat="13"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle403"
      cx="102.09299"
      cy="170.709"
      label="circle14"
      r="1.25"
      seat="14"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle404"
      cx="99.118004"
      cy="170.709"
      label="circle15"
      r="1.25"
      seat="15"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle405"
      cx="96.042984"
      cy="170.709"
      label="circle16"
      r="1.25"
      seat="16"
      floor="parterre"
      row="7" /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle406"
      cx="92.967987"
      cy="170.709"
      label="circle17"
      r="1.25"
      seat="17"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle407"
      cx="89.792984"
      cy="170.709"
      label="circle18"
      r="1.25"
      seat="18"
      floor="parterre"
      row="7" /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle408"
      cx="86.717987"
      cy="170.709"
      label="circle19"
      r="1.25"
      seat="19"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle409"
      cx="83.742989"
      cy="170.709"
      label="circle20"
      r="1.25"
      seat="20"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle410"
      cx="80.767982"
      cy="170.709"
      label="circle21"
      r="1.25"
      seat="21"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle411"
      cx="77.692986"
      cy="170.709"
      label="circle22"
      r="1.25"
      seat="22"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle412"
      cx="74.517982"
      cy="170.709"
      label="circle23"
      r="1.25"
      seat="23"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle413"
      cx="71.242989"
      cy="170.709"
      label="circle24"
      r="1.25"
      seat="24"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle414"
      cx="68.167984"
      cy="170.709"
      label="circle25"
      r="1.25"
      seat="25"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle415"
      cx="64.992996"
      cy="170.709"
      label="circle26"
      r="1.25"
      seat="26"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle416"
      cx="61.917999"
      cy="170.709"
      label="circle27"
      r="1.25"
      seat="27"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle417"
      cx="58.611"
      cy="170.709"
      label="circle28"
      r="1.25"
      seat="28"
      row="7"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle418"
      cx="144.26788"
      cy="167.005"
      label="circle1"
      r="1.25"
      seat="1"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle419"
      cx="140.99309"
      cy="167.005"
      label="circle2"
      r="1.25"
      seat="2"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle420"
      cx="137.81813"
      cy="167.005"
      label="circle3"
      r="1.25"
      seat="3"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle421"
      cx="134.74309"
      cy="167.005"
      label="circle4"
      r="1.25"
      seat="4"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle422"
      cx="131.56805"
      cy="167.005"
      label="circle5"
      r="1.25"
      seat="5"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle423"
      cx="128.49298"
      cy="167.005"
      label="circle6"
      r="1.25"
      seat="6"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle424"
      cx="125.41797"
      cy="167.005"
      label="circle7"
      r="1.25"
      seat="7"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle425"
      cx="122.24298"
      cy="167.005"
      label="circle8"
      r="1.25"
      seat="8"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle426"
      cx="119.068"
      cy="167.005"
      label="circle9"
      r="1.25"
      seat="9"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle427"
      cx="115.99298"
      cy="167.005"
      label="circle10"
      r="1.25"
      seat="10"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle428"
      cx="112.91799"
      cy="167.005"
      label="circle11"
      r="1.25"
      seat="11"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle429"
      cx="109.84303"
      cy="167.005"
      label="circle12"
      r="1.25"
      seat="12"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle430"
      cx="106.86798"
      cy="167.005"
      label="circle13"
      r="1.25"
      seat="13"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle431"
      cx="103.693"
      cy="167.005"
      label="circle14"
      r="1.25"
      seat="14"
      floor="parterre"
      row="8" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle432"
      cx="100.71797"
      cy="167.005"
      label="circle15"
      r="1.25"
      seat="15"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle433"
      cx="97.642952"
      cy="167.005"
      label="circle16"
      r="1.25"
      seat="16"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle434"
      cx="94.567955"
      cy="167.005"
      label="circle17"
      r="1.25"
      seat="17"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle435"
      cx="91.392952"
      cy="167.005"
      label="circle18"
      r="1.25"
      seat="18"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle436"
      cx="88.317955"
      cy="167.005"
      label="circle19"
      r="1.25"
      seat="19"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle437"
      cx="85.342957"
      cy="167.005"
      label="circle20"
      r="1.25"
      seat="20"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle438"
      cx="82.36795"
      cy="167.005"
      label="circle21"
      r="1.25"
      seat="21"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle439"
      cx="79.292953"
      cy="167.005"
      label="circle22"
      r="1.25"
      seat="22"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle440"
      cx="76.11795"
      cy="167.005"
      label="circle23"
      r="1.25"
      seat="23"
      floor="parterre"
      row="8" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle441"
      cx="72.842957"
      cy="167.005"
      label="circle24"
      r="1.25"
      seat="24"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle442"
      cx="69.767952"
      cy="167.005"
      label="circle25"
      r="1.25"
      seat="25"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle443"
      cx="66.592979"
      cy="167.005"
      label="circle26"
      r="1.25"
      seat="26"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle444"
      cx="63.517998"
      cy="167.005"
      label="circle27"
      r="1.25"
      seat="27"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle445"
      cx="60.342999"
      cy="167.005"
      label="circle28"
      r="1.25"
      seat="28"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle446"
      cx="57.167995"
      cy="167.005"
      label="circle29"
      r="1.25"
      seat="29"
      row="8"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="ellipse502"
      cx="142.66783"
      cy="163.40053"
      label="circle1"
      r="1.25"
      seat="1"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle502"
      cx="139.39304"
      cy="163.40053"
      label="circle2"
      r="1.25"
      seat="2"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle503"
      cx="136.21808"
      cy="163.40053"
      label="circle3"
      r="1.25"
      seat="3"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle504"
      cx="133.14304"
      cy="163.40053"
      label="circle4"
      r="1.25"
      seat="4"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle505"
      cx="129.968"
      cy="163.40053"
      label="circle5"
      r="1.25"
      seat="5"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle506"
      cx="126.89299"
      cy="163.40053"
      label="circle6"
      r="1.25"
      seat="6"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle507"
      cx="123.81799"
      cy="163.40053"
      label="circle7"
      r="1.25"
      seat="7"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle508"
      cx="120.64301"
      cy="163.40053"
      label="circle8"
      r="1.25"
      seat="8"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle509"
      cx="117.46801"
      cy="163.40053"
      label="circle9"
      r="1.25"
      seat="9"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle510"
      cx="114.39301"
      cy="163.40053"
      label="circle10"
      r="1.25"
      seat="10"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle511"
      cx="111.31799"
      cy="163.40053"
      label="circle11"
      r="1.25"
      seat="11"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle512"
      cx="108.243"
      cy="163.40053"
      label="circle12"
      r="1.25"
      seat="12"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle513"
      cx="105.26801"
      cy="163.40053"
      label="circle13"
      r="1.25"
      seat="13"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle514"
      cx="102.09299"
      cy="163.40053"
      label="circle14"
      r="1.25"
      seat="14"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle515"
      cx="99.118004"
      cy="163.40053"
      label="circle15"
      r="1.25"
      seat="15"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle516"
      cx="96.042984"
      cy="163.40053"
      label="circle16"
      r="1.25"
      seat="16"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle517"
      cx="92.967987"
      cy="163.40053"
      label="circle17"
      r="1.25"
      seat="17"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle518"
      cx="89.792984"
      cy="163.40053"
      label="circle18"
      r="1.25"
      seat="18"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle519"
      cx="86.717987"
      cy="163.40053"
      label="circle19"
      r="1.25"
      seat="19"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle520"
      cx="83.742989"
      cy="163.40053"
      label="circle20"
      r="1.25"
      seat="20"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle521"
      cx="80.767982"
      cy="163.40053"
      label="circle21"
      r="1.25"
      seat="21"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle522"
      cx="77.692986"
      cy="163.40053"
      label="circle22"
      r="1.25"
      seat="22"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle523"
      cx="74.517982"
      cy="163.40053"
      label="circle23"
      r="1.25"
      seat="23"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle524"
      cx="71.242989"
      cy="163.40053"
      label="circle24"
      r="1.25"
      seat="24"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle525"
      cx="68.167984"
      cy="163.40053"
      label="circle25"
      r="1.25"
      seat="25"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle526"
      cx="64.992996"
      cy="163.40053"
      label="circle26"
      r="1.25"
      seat="26"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle527"
      cx="61.917999"
      cy="163.40053"
      label="circle27"
      r="1.25"
      seat="27"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle528"
      cx="58.611"
      cy="163.40053"
      label="circle28"
      r="1.25"
      seat="28"
      row="9"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle529"
      cx="144.26788"
      cy="159.69653"
      label="circle1"
      r="1.25"
      seat="1"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle530"
      cx="140.99309"
      cy="159.69653"
      label="circle2"
      r="1.25"
      seat="2"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle531"
      cx="137.81813"
      cy="159.69653"
      label="circle3"
      r="1.25"
      seat="3"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle532"
      cx="134.74309"
      cy="159.69653"
      label="circle4"
      r="1.25"
      seat="4"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle533"
      cx="131.56805"
      cy="159.69653"
      label="circle5"
      r="1.25"
      seat="5"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle534"
      cx="128.49298"
      cy="159.69653"
      label="circle6"
      r="1.25"
      seat="6"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle535"
      cx="125.41797"
      cy="159.69653"
      label="circle7"
      r="1.25"
      seat="7"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle536"
      cx="122.24298"
      cy="159.69653"
      label="circle8"
      r="1.25"
      seat="8"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle537"
      cx="119.068"
      cy="159.69653"
      label="circle9"
      r="1.25"
      seat="9"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle538"
      cx="115.99298"
      cy="159.69653"
      label="circle10"
      r="1.25"
      seat="10"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle539"
      cx="112.91799"
      cy="159.69653"
      label="circle11"
      r="1.25"
      seat="11"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle540"
      cx="109.84303"
      cy="159.69653"
      label="circle12"
      r="1.25"
      seat="12"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle541"
      cx="106.86798"
      cy="159.69653"
      label="circle13"
      r="1.25"
      seat="13"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle542"
      cx="103.693"
      cy="159.69653"
      label="circle14"
      r="1.25"
      seat="14"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle543"
      cx="100.71797"
      cy="159.69653"
      label="circle15"
      r="1.25"
      seat="15"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle544"
      cx="97.642952"
      cy="159.69653"
      label="circle16"
      r="1.25"
      seat="16"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle545"
      cx="94.567955"
      cy="159.69653"
      label="circle17"
      r="1.25"
      seat="17"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle546"
      cx="91.392952"
      cy="159.69653"
      label="circle18"
      r="1.25"
      seat="18"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle547"
      cx="88.317955"
      cy="159.69653"
      label="circle19"
      r="1.25"
      seat="19"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle548"
      cx="85.342957"
      cy="159.69653"
      label="circle20"
      r="1.25"
      seat="20"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle549"
      cx="82.36795"
      cy="159.69653"
      label="circle21"
      r="1.25"
      seat="21"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle550"
      cx="79.292953"
      cy="159.69653"
      label="circle22"
      r="1.25"
      seat="22"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle551"
      cx="76.11795"
      cy="159.69653"
      label="circle23"
      r="1.25"
      seat="23"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle552"
      cx="72.842957"
      cy="159.69653"
      label="circle24"
      r="1.25"
      seat="24"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle553"
      cx="69.767952"
      cy="159.69653"
      label="circle25"
      r="1.25"
      seat="25"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle554"
      cx="66.592979"
      cy="159.69653"
      label="circle26"
      r="1.25"
      seat="26"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle555"
      cx="63.517998"
      cy="159.69653"
      label="circle27"
      r="1.25"
      seat="27"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle556"
      cx="60.342999"
      cy="159.69653"
      label="circle28"
      r="1.25"
      seat="28"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#53ac4d', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle557"
      cx="57.167995"
      cy="159.69653"
      label="circle29"
      r="1.25"
      seat="29"
      row="10"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="ellipse557"
      cx="142.66783"
      cy="155.89253"
      label="circle1"
      r="1.25"
      seat="1"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle558"
      cx="139.39304"
      cy="155.89253"
      label="circle2"
      r="1.25"
      seat="2"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle559"
      cx="136.21808"
      cy="155.89253"
      label="circle3"
      r="1.25"
      seat="3"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle560"
      cx="133.14304"
      cy="155.89253"
      label="circle4"
      r="1.25"
      seat="4"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle561"
      cx="129.968"
      cy="155.89253"
      label="circle5"
      r="1.25"
      seat="5"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle562"
      cx="126.89299"
      cy="155.89253"
      label="circle6"
      r="1.25"
      seat="6"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle563"
      cx="123.81799"
      cy="155.89253"
      label="circle7"
      r="1.25"
      seat="7"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle564"
      cx="120.64301"
      cy="155.89253"
      label="circle8"
      r="1.25"
      seat="8"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle565"
      cx="117.46801"
      cy="155.89253"
      label="circle9"
      r="1.25"
      seat="9"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle566"
      cx="114.39301"
      cy="155.89253"
      label="circle10"
      r="1.25"
      seat="10"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle567"
      cx="111.31799"
      cy="155.89253"
      label="circle11"
      r="1.25"
      seat="11"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle568"
      cx="108.243"
      cy="155.89253"
      label="circle12"
      r="1.25"
      seat="12"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle569"
      cx="105.26801"
      cy="155.89253"
      label="circle13"
      r="1.25"
      seat="13"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle570"
      cx="102.09299"
      cy="155.89253"
      label="circle14"
      r="1.25"
      seat="14"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle571"
      cx="99.118004"
      cy="155.89253"
      label="circle15"
      r="1.25"
      seat="15"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle572"
      cx="96.042984"
      cy="155.89253"
      label="circle16"
      r="1.25"
      seat="16"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle573"
      cx="92.967987"
      cy="155.89253"
      label="circle17"
      r="1.25"
      seat="17"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle574"
      cx="89.792984"
      cy="155.89253"
      label="circle18"
      r="1.25"
      seat="18"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle575"
      cx="86.717987"
      cy="155.89253"
      label="circle19"
      r="1.25"
      seat="19"
      floor="parterre"
      row="11" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle576"
      cx="83.742989"
      cy="155.89253"
      label="circle20"
      r="1.25"
      seat="20"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle577"
      cx="80.767982"
      cy="155.89253"
      label="circle21"
      r="1.25"
      seat="21"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle578"
      cx="77.692986"
      cy="155.89253"
      label="circle22"
      r="1.25"
      seat="22"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle579"
      cx="74.517982"
      cy="155.89253"
      label="circle23"
      r="1.25"
      seat="23"
      floor="parterre"
      row="11" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle580"
      cx="71.242989"
      cy="155.89253"
      label="circle24"
      r="1.25"
      seat="24"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle581"
      cx="68.167984"
      cy="155.89253"
      label="circle25"
      r="1.25"
      seat="25"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle582"
      cx="64.992996"
      cy="155.89253"
      label="circle26"
      r="1.25"
      seat="26"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle583"
      cx="61.917999"
      cy="155.89253"
      label="circle27"
      r="1.25"
      seat="27"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle584"
      cx="58.611"
      cy="155.89253"
      label="circle28"
      r="1.25"
      seat="28"
      row="11"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle585"
      cx="144.26788"
      cy="152.18854"
      label="circle1"
      r="1.25"
      seat="1"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle586"
      cx="140.99309"
      cy="152.18854"
      label="circle2"
      r="1.25"
      seat="2"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle587"
      cx="137.81813"
      cy="152.18854"
      label="circle3"
      r="1.25"
      seat="3"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle588"
      cx="134.74309"
      cy="152.18854"
      label="circle4"
      r="1.25"
      seat="4"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle589"
      cx="131.56805"
      cy="152.18854"
      label="circle5"
      r="1.25"
      seat="5"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle590"
      cx="128.49298"
      cy="152.18854"
      label="circle6"
      r="1.25"
      seat="6"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle591"
      cx="125.41797"
      cy="152.18854"
      label="circle7"
      r="1.25"
      seat="7"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle592"
      cx="122.24298"
      cy="152.18854"
      label="circle8"
      r="1.25"
      seat="8"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle593"
      cx="119.068"
      cy="152.18854"
      label="circle9"
      r="1.25"
      seat="9"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle594"
      cx="115.99298"
      cy="152.18854"
      label="circle10"
      r="1.25"
      seat="10"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle595"
      cx="112.91799"
      cy="152.18854"
      label="circle11"
      r="1.25"
      seat="11"
      floor="parterre"
      row="12" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle596"
      cx="109.84303"
      cy="152.18854"
      label="circle12"
      r="1.25"
      seat="12"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle597"
      cx="106.86798"
      cy="152.18854"
      label="circle13"
      r="1.25"
      seat="13"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle598"
      cx="103.693"
      cy="152.18854"
      label="circle14"
      r="1.25"
      seat="14"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle599"
      cx="100.71797"
      cy="152.18854"
      label="circle15"
      r="1.25"
      seat="15"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle600"
      cx="97.642952"
      cy="152.18854"
      label="circle16"
      r="1.25"
      seat="16"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle601"
      cx="94.567955"
      cy="152.18854"
      label="circle17"
      r="1.25"
      seat="17"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle602"
      cx="91.392952"
      cy="152.18854"
      label="circle18"
      r="1.25"
      seat="18"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle603"
      cx="88.317955"
      cy="152.18854"
      label="circle19"
      r="1.25"
      seat="19"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle604"
      cx="85.342957"
      cy="152.18854"
      label="circle20"
      r="1.25"
      seat="20"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle605"
      cx="82.36795"
      cy="152.18854"
      label="circle21"
      r="1.25"
      seat="21"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle606"
      cx="79.292953"
      cy="152.18854"
      label="circle22"
      r="1.25"
      seat="22"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle607"
      cx="76.11795"
      cy="152.18854"
      label="circle23"
      r="1.25"
      seat="23"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle608"
      cx="72.842957"
      cy="152.18854"
      label="circle24"
      r="1.25"
      seat="24"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle609"
      cx="69.767952"
      cy="152.18854"
      label="circle25"
      r="1.25"
      seat="25"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle610"
      cx="66.592979"
      cy="152.18854"
      label="circle26"
      r="1.25"
      seat="26"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle611"
      cx="63.517998"
      cy="152.18854"
      label="circle27"
      r="1.25"
      seat="27"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle612"
      cx="60.342999"
      cy="152.18854"
      label="circle28"
      r="1.25"
      seat="28"
      row="12"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle613"
      cx="57.167995"
      cy="152.18854"
      label="circle29"
      r="1.25"
      seat="29"
      floor="parterre"
      row="12" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="ellipse726"
      cx="142.66783"
      cy="148.4843"
      label="circle1"
      r="1.25"
      seat="1"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle726"
      cx="139.39304"
      cy="148.4843"
      label="circle2"
      r="1.25"
      seat="2"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle727"
      cx="136.21808"
      cy="148.4843"
      label="circle3"
      r="1.25"
      seat="3"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle728"
      cx="133.14304"
      cy="148.4843"
      label="circle4"
      r="1.25"
      seat="4"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle729"
      cx="129.968"
      cy="148.4843"
      label="circle5"
      r="1.25"
      seat="5"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle730"
      cx="126.89299"
      cy="148.4843"
      label="circle6"
      r="1.25"
      seat="6"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle731"
      cx="123.81799"
      cy="148.4843"
      label="circle7"
      r="1.25"
      seat="7"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle732"
      cx="120.64301"
      cy="148.4843"
      label="circle8"
      r="1.25"
      seat="8"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle733"
      cx="117.46801"
      cy="148.4843"
      label="circle9"
      r="1.25"
      seat="9"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle734"
      cx="114.39301"
      cy="148.4843"
      label="circle10"
      r="1.25"
      seat="10"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle735"
      cx="111.31799"
      cy="148.4843"
      label="circle11"
      r="1.25"
      seat="11"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle736"
      cx="108.243"
      cy="148.4843"
      label="circle12"
      r="1.25"
      seat="12"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle737"
      cx="105.26801"
      cy="148.4843"
      label="circle13"
      r="1.25"
      seat="13"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle738"
      cx="102.09299"
      cy="148.4843"
      label="circle14"
      r="1.25"
      seat="14"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle739"
      cx="99.118004"
      cy="148.4843"
      label="circle15"
      r="1.25"
      seat="15"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle740"
      cx="96.042984"
      cy="148.4843"
      label="circle16"
      r="1.25"
      seat="16"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle741"
      cx="92.967987"
      cy="148.4843"
      label="circle17"
      r="1.25"
      seat="17"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle742"
      cx="89.792984"
      cy="148.4843"
      label="circle18"
      r="1.25"
      seat="18"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle743"
      cx="86.717987"
      cy="148.4843"
      label="circle19"
      r="1.25"
      seat="19"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle744"
      cx="83.742989"
      cy="148.4843"
      label="circle20"
      r="1.25"
      seat="20"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle745"
      cx="80.767982"
      cy="148.4843"
      label="circle21"
      r="1.25"
      seat="21"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle746"
      cx="77.692986"
      cy="148.4843"
      label="circle22"
      r="1.25"
      seat="22"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle747"
      cx="74.517982"
      cy="148.4843"
      label="circle23"
      r="1.25"
      seat="23"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle748"
      cx="71.242989"
      cy="148.4843"
      label="circle24"
      r="1.25"
      seat="24"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle749"
      cx="68.167984"
      cy="148.4843"
      label="circle25"
      r="1.25"
      seat="25"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle750"
      cx="64.992996"
      cy="148.4843"
      label="circle26"
      r="1.25"
      seat="26"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle751"
      cx="61.917999"
      cy="148.4843"
      label="circle27"
      r="1.25"
      seat="27"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle752"
      cx="58.611"
      cy="148.4843"
      label="circle28"
      r="1.25"
      seat="28"
      row="13"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle753"
      cx="144.26788"
      cy="144.7803"
      label="circle1"
      r="1.25"
      seat="1"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle754"
      cx="140.99309"
      cy="144.7803"
      label="circle2"
      r="1.25"
      seat="2"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle755"
      cx="137.81813"
      cy="144.7803"
      label="circle3"
      r="1.25"
      seat="3"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle756"
      cx="134.74309"
      cy="144.7803"
      label="circle4"
      r="1.25"
      seat="4"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle757"
      cx="131.56805"
      cy="144.7803"
      label="circle5"
      r="1.25"
      seat="5"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle758"
      cx="128.49298"
      cy="144.7803"
      label="circle6"
      r="1.25"
      seat="6"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle759"
      cx="125.41797"
      cy="144.7803"
      label="circle7"
      r="1.25"
      seat="7"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle760"
      cx="122.24298"
      cy="144.7803"
      label="circle8"
      r="1.25"
      seat="8"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle761"
      cx="119.068"
      cy="144.7803"
      label="circle9"
      r="1.25"
      seat="9"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle762"
      cx="115.99298"
      cy="144.7803"
      label="circle10"
      r="1.25"
      seat="10"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle763"
      cx="112.91799"
      cy="144.7803"
      label="circle11"
      r="1.25"
      seat="11"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle764"
      cx="109.84303"
      cy="144.7803"
      label="circle12"
      r="1.25"
      seat="12"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle765"
      cx="106.86798"
      cy="144.7803"
      label="circle13"
      r="1.25"
      seat="13"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle766"
      cx="103.693"
      cy="144.7803"
      label="circle14"
      r="1.25"
      seat="14"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle767"
      cx="100.71797"
      cy="144.7803"
      label="circle15"
      r="1.25"
      seat="15"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle768"
      cx="97.642952"
      cy="144.7803"
      label="circle16"
      r="1.25"
      seat="16"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle769"
      cx="94.567955"
      cy="144.7803"
      label="circle17"
      r="1.25"
      seat="17"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle770"
      cx="91.392952"
      cy="144.7803"
      label="circle18"
      r="1.25"
      seat="18"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle771"
      cx="88.317955"
      cy="144.7803"
      label="circle19"
      r="1.25"
      seat="19"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle772"
      cx="85.342957"
      cy="144.7803"
      label="circle20"
      r="1.25"
      seat="20"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle773"
      cx="82.36795"
      cy="144.7803"
      label="circle21"
      r="1.25"
      seat="21"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle774"
      cx="79.292953"
      cy="144.7803"
      label="circle22"
      r="1.25"
      seat="22"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle775"
      cx="76.11795"
      cy="144.7803"
      label="circle23"
      r="1.25"
      seat="23"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle776"
      cx="72.842957"
      cy="144.7803"
      label="circle24"
      r="1.25"
      seat="24"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle777"
      cx="69.767952"
      cy="144.7803"
      label="circle25"
      r="1.25"
      seat="25"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle778"
      cx="66.592979"
      cy="144.7803"
      label="circle26"
      r="1.25"
      seat="26"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle779"
      cx="63.517998"
      cy="144.7803"
      label="circle27"
      r="1.25"
      seat="27"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle780"
      cx="60.342999"
      cy="144.7803"
      label="circle28"
      r="1.25"
      seat="28"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fcb203', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle781"
      cx="57.167995"
      cy="144.7803"
      label="circle29"
      r="1.25"
      seat="29"
      row="14"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle837"
      cx="143.83894"
      cy="140.94701"
      label="circle1"
      r="1.25"
      seat="1"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle838"
      cx="140.33514"
      cy="140.94701"
      label="circle2"
      r="1.25"
      seat="2"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle839"
      cx="136.63103"
      cy="140.94701"
      label="circle3"
      r="1.25"
      seat="3"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle840"
      cx="133.02682"
      cy="140.94701"
      label="circle4"
      r="1.25"
      seat="4"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle841"
      cx="129.452"
      cy="140.94701"
      label="circle5"
      r="1.25"
      seat="5"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle842"
      cx="125.818"
      cy="140.94701"
      label="circle6"
      r="1.25"
      seat="6"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle843"
      cx="122.243"
      cy="140.94701"
      label="circle7"
      r="1.25"
      seat="7"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle844"
      cx="118.61"
      cy="140.94701"
      label="circle8"
      r="1.25"
      seat="8"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle845"
      cx="114.935"
      cy="140.94701"
      label="circle9"
      r="1.25"
      seat="9"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle846"
      cx="111.30156"
      cy="140.94701"
      label="circle10"
      r="1.25"
      seat="10"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle847"
      cx="107.69738"
      cy="140.94701"
      label="circle11"
      r="1.25"
      seat="11"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle848"
      cx="104.0933"
      cy="140.94701"
      label="circle12"
      r="1.25"
      seat="12"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle849"
      cx="100.46"
      cy="140.94701"
      label="circle13"
      r="1.25"
      seat="13"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle850"
      cx="96.884911"
      cy="140.94701"
      label="circle14"
      r="1.25"
      seat="14"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle851"
      cx="93.280998"
      cy="140.94701"
      label="circle15"
      r="1.25"
      seat="15"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle852"
      cx="89.677002"
      cy="140.94701"
      label="circle16"
      r="1.25"
      seat="16"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle853"
      cx="86.071999"
      cy="140.94701"
      label="circle17"
      r="1.25"
      seat="17"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle854"
      cx="82.46817"
      cy="140.94701"
      label="circle18"
      r="1.25"
      seat="18"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle855"
      cx="78.864006"
      cy="140.94701"
      label="circle19"
      r="1.25"
      seat="19"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle856"
      cx="75.231003"
      cy="140.94701"
      label="circle20"
      r="1.25"
      seat="20"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle857"
      cx="71.539001"
      cy="140.94701"
      label="circle21"
      r="1.25"
      seat="21"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle858"
      cx="67.963997"
      cy="140.94701"
      label="circle22"
      r="1.25"
      seat="22"
      floor="parterre"
      row="14A" 
      booked="true"
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle859"
      cx="64.289001"
      cy="140.94701"
      label="circle23"
      r="1.25"
      seat="23"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle860"
      cx="60.714001"
      cy="140.94701"
      label="circle24"
      r="1.25"
      seat="24"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#a7a7a7', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle861"
      cx="57.139"
      cy="140.94701"
      label="circle25"
      r="1.25"
      seat="25"
      row="14A"
      booked="true"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle885"
      cx="153.06783"
      cy="128.276"
      label="circle1"
      r="1.25"
      seat="1"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle886"
      cx="149.79303"
      cy="128.276"
      label="circle2"
      r="1.25"
      seat="2"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle887"
      cx="146.61807"
      cy="128.276"
      label="circle3"
      r="1.25"
      seat="3"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle888"
      cx="143.54303"
      cy="128.276"
      label="circle4"
      r="1.25"
      seat="4"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle889"
      cx="140.368"
      cy="128.276"
      label="circle5"
      r="1.25"
      seat="5"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle893"
      cx="126.90503"
      cy="128.276"
      label="circle6"
      r="1.25"
      seat="6"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle894"
      cx="123.83001"
      cy="128.276"
      label="circle7"
      r="1.25"
      seat="7"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle895"
      cx="120.65503"
      cy="128.276"
      label="circle8"
      r="1.25"
      seat="8"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle896"
      cx="117.48005"
      cy="128.276"
      label="circle9"
      r="1.25"
      seat="9"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle897"
      cx="114.40503"
      cy="128.276"
      label="circle10"
      r="1.25"
      seat="10"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle898"
      cx="111.33003"
      cy="128.276"
      label="circle11"
      r="1.25"
      seat="11"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle899"
      cx="108.25509"
      cy="128.276"
      label="circle12"
      r="1.25"
      seat="12"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle900"
      cx="105.28003"
      cy="128.276"
      label="circle13"
      r="1.25"
      seat="13"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle901"
      cx="102.10505"
      cy="128.276"
      label="circle14"
      r="1.25"
      seat="14"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle902"
      cx="99.130013"
      cy="128.276"
      label="circle15"
      r="1.25"
      seat="15"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle903"
      cx="96.055"
      cy="128.276"
      label="circle16"
      r="1.25"
      seat="16"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle904"
      cx="92.980003"
      cy="128.276"
      label="circle17"
      r="1.25"
      seat="17"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle905"
      cx="89.805"
      cy="128.276"
      label="circle18"
      r="1.25"
      seat="18"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle906"
      cx="86.730003"
      cy="128.276"
      label="circle19"
      r="1.25"
      seat="19"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle907"
      cx="83.755005"
      cy="128.276"
      label="circle20"
      r="1.25"
      seat="20"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle908"
      cx="80.779999"
      cy="128.276"
      label="circle21"
      r="1.25"
      seat="21"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle909"
      cx="77.705002"
      cy="128.276"
      label="circle22"
      r="1.25"
      seat="22"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle910"
      cx="74.529999"
      cy="128.276"
      label="circle23"
      r="1.25"
      seat="23"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle927"
      cx="61.688988"
      cy="128.276"
      label="circle24"
      r="1.25"
      seat="24"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle928"
      cx="58.613983"
      cy="128.276"
      label="circle25"
      r="1.25"
      seat="25"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle929"
      cx="55.438995"
      cy="128.276"
      label="circle26"
      r="1.25"
      seat="26"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle930"
      cx="52.363998"
      cy="128.276"
      label="circle27"
      r="1.25"
      seat="27"
      row="15"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle931"
      cx="49.056999"
      cy="128.276"
      label="circle28"
      r="1.25"
      floor="parterre"
      seat="28"
      row="15" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle935"
      cx="153.06783"
      cy="124.57185"
      label="circle1"
      r="1.25"
      seat="1"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle936"
      cx="149.79303"
      cy="124.57185"
      label="circle2"
      r="1.25"
      seat="2"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle937"
      cx="146.61807"
      cy="124.57185"
      label="circle3"
      r="1.25"
      seat="3"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle938"
      cx="143.54303"
      cy="124.57185"
      label="circle4"
      r="1.25"
      seat="4"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle939"
      cx="140.368"
      cy="124.57185"
      label="circle5"
      r="1.25"
      seat="5"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle943"
      cx="125.51802"
      cy="124.572"
      label="circle6"
      r="1.25"
      seat="6"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle944"
      cx="122.44303"
      cy="124.572"
      label="circle7"
      r="1.25"
      seat="7"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle945"
      cx="119.26802"
      cy="124.572"
      label="circle8"
      r="1.25"
      seat="8"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle946"
      cx="116.09304"
      cy="124.572"
      label="circle9"
      r="1.25"
      seat="9"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle947"
      cx="113.01802"
      cy="124.572"
      label="circle10"
      r="1.25"
      seat="10"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle948"
      cx="109.94306"
      cy="124.572"
      label="circle11"
      r="1.25"
      seat="11"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle949"
      cx="106.86808"
      cy="124.572"
      label="circle12"
      r="1.25"
      seat="12"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle950"
      cx="103.89302"
      cy="124.572"
      label="circle13"
      r="1.25"
      seat="13"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle951"
      cx="100.71804"
      cy="124.572"
      label="circle14"
      r="1.25"
      seat="14"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle952"
      cx="97.743011"
      cy="124.572"
      label="circle15"
      r="1.25"
      seat="15"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle953"
      cx="94.667999"
      cy="124.572"
      label="circle16"
      r="1.25"
      seat="16"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle954"
      cx="91.593002"
      cy="124.572"
      label="circle17"
      r="1.25"
      seat="17"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle955"
      cx="88.417999"
      cy="124.572"
      label="circle18"
      r="1.25"
      seat="18"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle956"
      cx="85.343002"
      cy="124.572"
      label="circle19"
      r="1.25"
      seat="19"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle957"
      cx="82.368004"
      cy="124.572"
      label="circle20"
      r="1.25"
      seat="20"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle958"
      cx="79.392998"
      cy="124.572"
      label="circle21"
      r="1.25"
      seat="21"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle959"
      cx="76.318001"
      cy="124.572"
      label="circle22"
      r="1.25"
      seat="22"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle975"
      cx="61.788986"
      cy="124.572"
      label="circle23"
      r="1.25"
      seat="23"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle976"
      cx="58.513992"
      cy="124.572"
      label="circle24"
      r="1.25"
      seat="24"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle977"
      cx="55.438988"
      cy="124.572"
      label="circle25"
      r="1.25"
      seat="25"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle978"
      cx="52.264"
      cy="124.572"
      label="circle26"
      r="1.25"
      seat="26"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle979"
      cx="49.188999"
      cy="124.572"
      label="circle27"
      r="1.25"
      seat="27"
      row="16"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle983"
      cx="153.06783"
      cy="120.868"
      label="circle1"
      r="1.25"
      seat="1"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle984"
      cx="149.79303"
      cy="120.868"
      label="circle2"
      r="1.25"
      seat="2"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle985"
      cx="146.61807"
      cy="120.868"
      label="circle3"
      r="1.25"
      seat="3"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle986"
      cx="143.54303"
      cy="120.868"
      label="circle4"
      r="1.25"
      seat="4"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle987"
      cx="140.368"
      cy="120.868"
      label="circle5"
      r="1.25"
      seat="5"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle991"
      cx="126.90503"
      cy="120.96799"
      label="circle6"
      r="1.25"
      seat="6"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle992"
      cx="123.83001"
      cy="120.96799"
      label="circle7"
      r="1.25"
      seat="7"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle993"
      cx="120.65503"
      cy="120.96799"
      label="circle8"
      r="1.25"
      seat="8"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle994"
      cx="117.48005"
      cy="120.96799"
      label="circle9"
      r="1.25"
      seat="9"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle995"
      cx="114.40503"
      cy="120.96799"
      label="circle10"
      r="1.25"
      seat="10"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle996"
      cx="111.33002"
      cy="120.96799"
      label="circle11"
      r="1.25"
      seat="11"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle997"
      cx="108.25509"
      cy="120.96799"
      label="circle12"
      r="1.25"
      seat="12"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle998"
      cx="105.28003"
      cy="120.96799"
      label="circle13"
      r="1.25"
      seat="13"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle999"
      cx="102.10505"
      cy="120.96799"
      label="circle14"
      r="1.25"
      seat="14"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1000"
      cx="99.130013"
      cy="120.96799"
      label="circle15"
      r="1.25"
      seat="15"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1001"
      cx="96.055"
      cy="120.96799"
      label="circle16"
      r="1.25"
      seat="16"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1002"
      cx="92.980003"
      cy="120.96799"
      label="circle17"
      r="1.25"
      seat="17"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1003"
      cx="89.805"
      cy="120.96799"
      label="circle18"
      r="1.25"
      seat="18"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1004"
      cx="86.730003"
      cy="120.96799"
      label="circle19"
      r="1.25"
      seat="19"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1005"
      cx="83.755005"
      cy="120.96799"
      label="circle20"
      r="1.25"
      seat="20"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1006"
      cx="80.779999"
      cy="120.96799"
      label="circle21"
      r="1.25"
      seat="21"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1007"
      cx="77.705002"
      cy="120.96799"
      label="circle22"
      r="1.25"
      seat="22"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1008"
      cx="74.529999"
      cy="120.96799"
      label="circle23"
      r="1.25"
      seat="23"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1025"
      cx="61.817989"
      cy="120.868"
      label="circle24"
      r="1.25"
      seat="24"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1026"
      cx="58.742985"
      cy="120.868"
      label="circle25"
      r="1.25"
      seat="25"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1027"
      cx="55.567997"
      cy="120.868"
      label="circle26"
      r="1.25"
      seat="26"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1028"
      cx="52.493"
      cy="120.868"
      label="circle27"
      r="1.25"
      seat="27"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{display: 'inline', fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1029"
      cx="49.186001"
      cy="120.868"
      label="circle28"
      r="1.25"
      seat="28"
      row="17"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1033"
      cx="153.06783"
      cy="117.293"
      label="circle1"
      r="1.25"
      seat="1"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1034"
      cx="149.79303"
      cy="117.293"
      label="circle2"
      r="1.25"
      seat="2"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1035"
      cx="146.61807"
      cy="117.293"
      label="circle3"
      r="1.25"
      seat="3"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1036"
      cx="143.54303"
      cy="117.293"
      label="circle4"
      r="1.25"
      seat="4"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1037"
      cx="140.368"
      cy="117.293"
      label="circle5"
      r="1.25"
      seat="5"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1041"
      cx="122.57204"
      cy="117.093"
      label="circle6"
      r="1.25"
      seat="6"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1042"
      cx="119.49702"
      cy="117.093"
      label="circle7"
      r="1.25"
      seat="7"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1043"
      cx="116.32204"
      cy="117.093"
      label="circle8"
      r="1.25"
      seat="8"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1044"
      cx="113.14706"
      cy="117.093"
      label="circle9"
      r="1.25"
      seat="9"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1045"
      cx="110.07204"
      cy="117.093"
      label="circle10"
      r="1.25"
      seat="10"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1046"
      cx="106.99702"
      cy="117.093"
      label="circle11"
      r="1.25"
      seat="11"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1047"
      cx="103.92208"
      cy="117.093"
      label="circle12"
      r="1.25"
      seat="12"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1048"
      cx="100.94704"
      cy="117.093"
      label="circle13"
      r="1.25"
      seat="13"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1049"
      cx="97.772034"
      cy="117.093"
      label="circle14"
      r="1.25"
      seat="14"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1050"
      cx="94.797005"
      cy="117.093"
      label="circle15"
      r="1.25"
      seat="15"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1051"
      cx="91.721992"
      cy="117.093"
      label="circle16"
      r="1.25"
      seat="16"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1052"
      cx="88.646996"
      cy="117.093"
      label="circle17"
      r="1.25"
      seat="17"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1053"
      cx="85.471992"
      cy="117.093"
      label="circle18"
      r="1.25"
      seat="18"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1054"
      cx="82.396996"
      cy="117.093"
      label="circle19"
      r="1.25"
      seat="19"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1055"
      cx="79.421997"
      cy="117.093"
      label="circle20"
      r="1.25"
      seat="20"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1069"
      cx="61.717964"
      cy="117.293"
      label="circle21"
      r="1.25"
      seat="21"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1070"
      cx="58.642967"
      cy="117.293"
      label="circle22"
      r="1.25"
      seat="22"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1071"
      cx="55.467964"
      cy="117.293"
      label="circle23"
      r="1.25"
      seat="23"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1072"
      cx="52.19297"
      cy="117.293"
      label="circle24"
      r="1.25"
      seat="24"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1073"
      cx="49.117966"
      cy="117.293"
      label="circle25"
      r="1.25"
      seat="25"
      row="18"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1077"
      cx="153.06783"
      cy="113.389"
      label="circle1"
      r="1.25"
      seat="1"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1078"
      cx="149.79303"
      cy="113.389"
      label="circle2"
      r="1.25"
      seat="2"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1079"
      cx="146.61807"
      cy="113.389"
      label="circle3"
      r="1.25"
      seat="3"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1080"
      cx="143.54303"
      cy="113.389"
      label="circle4"
      r="1.25"
      seat="4"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1081"
      cx="140.368"
      cy="113.389"
      label="circle5"
      r="1.25"
      seat="5"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1085"
      cx="121.28452"
      cy="113.389"
      label="circle6"
      r="1.25"
      seat="6"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1086"
      cx="118.20953"
      cy="113.389"
      label="circle7"
      r="1.25"
      seat="7"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1087"
      cx="115.03452"
      cy="113.389"
      label="circle8"
      r="1.25"
      seat="8"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1088"
      cx="111.85954"
      cy="113.389"
      label="circle9"
      r="1.25"
      seat="9"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1089"
      cx="108.78452"
      cy="113.389"
      label="circle10"
      r="1.25"
      seat="10"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1090"
      cx="105.70953"
      cy="113.389"
      label="circle11"
      r="1.25"
      seat="11"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1091"
      cx="102.63458"
      cy="113.389"
      label="circle12"
      r="1.25"
      seat="12"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1092"
      cx="99.659523"
      cy="113.389"
      label="circle13"
      r="1.25"
      seat="13"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1093"
      cx="96.484535"
      cy="113.389"
      label="circle14"
      r="1.25"
      seat="14"
      floor="parterre"
      row="19" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1094"
      cx="93.509506"
      cy="113.389"
      label="circle15"
      r="1.25"
      seat="15"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1095"
      cx="90.434494"
      cy="113.389"
      label="circle16"
      r="1.25"
      seat="16"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1096"
      cx="87.359497"
      cy="113.389"
      label="circle17"
      r="1.25"
      seat="17"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1097"
      cx="84.184494"
      cy="113.389"
      label="circle18"
      r="1.25"
      seat="18"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1098"
      cx="81.109497"
      cy="113.389"
      label="circle19"
      r="1.25"
      seat="19"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1111"
      cx="61.717999"
      cy="113.389"
      label="circle20"
      r="1.25"
      seat="20"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1112"
      cx="58.742992"
      cy="113.389"
      label="circle21"
      r="1.25"
      seat="21"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1113"
      cx="55.667995"
      cy="113.389"
      label="circle22"
      r="1.25"
      seat="22"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1114"
      cx="52.492992"
      cy="113.389"
      label="circle23"
      r="1.25"
      seat="23"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1115"
      cx="49.217999"
      cy="113.389"
      label="circle24"
      r="1.25"
      seat="24"
      row="19"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1119"
      cx="153.06783"
      cy="109.614"
      label="circle1"
      r="1.25"
      seat="1"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1120"
      cx="149.79303"
      cy="109.614"
      label="circle2"
      r="1.25"
      seat="2"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1121"
      cx="146.61807"
      cy="109.614"
      label="circle3"
      r="1.25"
      seat="3"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1122"
      cx="143.54303"
      cy="109.614"
      label="circle4"
      r="1.25"
      seat="4"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1123"
      cx="140.368"
      cy="109.614"
      label="circle5"
      r="1.25"
      seat="5"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1127"
      cx="122.84303"
      cy="109.61398"
      label="circle6"
      r="1.25"
      seat="6"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1128"
      cx="119.76803"
      cy="109.61398"
      label="circle7"
      r="1.25"
      seat="7"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1129"
      cx="116.59303"
      cy="109.61398"
      label="circle8"
      r="1.25"
      seat="8"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1130"
      cx="113.41805"
      cy="109.61398"
      label="circle9"
      r="1.25"
      seat="9"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1131"
      cx="110.34303"
      cy="109.61398"
      label="circle10"
      r="1.25"
      seat="10"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1132"
      cx="107.26803"
      cy="109.61398"
      label="circle11"
      r="1.25"
      seat="11"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1133"
      cx="104.19308"
      cy="109.61398"
      label="circle12"
      r="1.25"
      seat="12"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1134"
      cx="101.21803"
      cy="109.61398"
      label="circle13"
      r="1.25"
      seat="13"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1135"
      cx="98.043037"
      cy="109.61398"
      label="circle14"
      r="1.25"
      seat="14"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1136"
      cx="95.068008"
      cy="109.61398"
      label="circle15"
      r="1.25"
      row="20"
      floor="parterre"
      seat="15" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1137"
      cx="91.992996"
      cy="109.61398"
      label="circle16"
      r="1.25"
      seat="16"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1138"
      cx="88.917999"
      cy="109.61398"
      label="circle17"
      r="1.25"
      seat="17"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1139"
      cx="85.742996"
      cy="109.61398"
      label="circle18"
      r="1.25"
      seat="18"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1140"
      cx="82.667999"
      cy="109.61398"
      label="circle19"
      r="1.25"
      seat="19"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1141"
      cx="79.693001"
      cy="109.61398"
      label="circle20"
      r="1.25"
      seat="20"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1155"
      cx="61.717999"
      cy="109.614"
      label="circle21"
      r="1.25"
      seat="21"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1156"
      cx="58.643002"
      cy="109.614"
      label="circle22"
      r="1.25"
      seat="22"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1157"
      cx="55.467999"
      cy="109.614"
      label="circle23"
      r="1.25"
      seat="23"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1158"
      cx="52.193005"
      cy="109.614"
      label="circle24"
      r="1.25"
      seat="24"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1159"
      cx="49.118"
      cy="109.614"
      label="circle25"
      r="1.25"
      seat="25"
      row="20"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1163"
      cx="153.06783"
      cy="105.852"
      label="circle1"
      r="1.25"
      seat="1"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1164"
      cx="149.79303"
      cy="105.852"
      label="circle2"
      r="1.25"
      seat="2"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1165"
      cx="146.61807"
      cy="105.852"
      label="circle3"
      r="1.25"
      seat="3"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1166"
      cx="143.54303"
      cy="105.852"
      label="circle4"
      r="1.25"
      seat="4"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1167"
      cx="140.368"
      cy="105.852"
      label="circle5"
      r="1.25"
      seat="5"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1171"
      cx="121.28403"
      cy="105.852"
      label="circle6"
      r="1.25"
      seat="6"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1172"
      cx="118.20904"
      cy="105.852"
      label="circle7"
      r="1.25"
      seat="7"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1173"
      cx="115.03403"
      cy="105.852"
      label="circle8"
      r="1.25"
      seat="8"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1174"
      cx="111.85905"
      cy="105.852"
      label="circle9"
      r="1.25"
      seat="9"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1175"
      cx="108.78403"
      cy="105.852"
      label="circle10"
      r="1.25"
      seat="10"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1176"
      cx="105.70904"
      cy="105.852"
      label="circle11"
      r="1.25"
      seat="11"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1177"
      cx="102.63409"
      cy="105.852"
      label="circle12"
      r="1.25"
      seat="12"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1178"
      cx="99.659027"
      cy="105.852"
      label="circle13"
      r="1.25"
      seat="13"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1179"
      cx="96.484039"
      cy="105.852"
      label="circle14"
      r="1.25"
      seat="14"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1180"
      cx="93.50901"
      cy="105.852"
      label="circle15"
      r="1.25"
      seat="15"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1181"
      cx="90.433998"
      cy="105.852"
      label="circle16"
      r="1.25"
      seat="16"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1182"
      cx="87.359001"
      cy="105.852"
      label="circle17"
      r="1.25"
      seat="17"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1183"
      cx="84.183998"
      cy="105.852"
      label="circle18"
      r="1.25"
      seat="18"
      floor="parterre"
      row="21" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1184"
      cx="81.109001"
      cy="105.852"
      label="circle19"
      r="1.25"
      seat="19"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1197"
      cx="61.717999"
      cy="105.852"
      label="circle20"
      r="1.25"
      seat="20"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1198"
      cx="58.742992"
      cy="105.852"
      label="circle21"
      r="1.25"
      seat="21"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1199"
      cx="55.667995"
      cy="105.852"
      label="circle22"
      r="1.25"
      seat="22"
      floor="parterre"
      row="21" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1200"
      cx="52.492992"
      cy="105.852"
      label="circle23"
      r="1.25"
      seat="23"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1201"
      cx="49.217999"
      cy="105.852"
      label="circle24"
      r="1.25"
      seat="24"
      row="21"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1205"
      cx="153.06783"
      cy="101.948"
      label="circle1"
      r="1.25"
      seat="1"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1206"
      cx="149.79303"
      cy="101.948"
      label="circle2"
      r="1.25"
      row="22"
      floor="parterre"
      seat="2" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1207"
      cx="146.61807"
      cy="101.948"
      label="circle3"
      r="1.25"
      seat="3"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1208"
      cx="143.54303"
      cy="101.948"
      label="circle4"
      r="1.25"
      seat="4"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1209"
      cx="140.368"
      cy="101.948"
      label="circle5"
      r="1.25"
      seat="5"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1213"
      cx="122.87203"
      cy="101.948"
      label="circle6"
      r="1.25"
      seat="6"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1214"
      cx="119.79702"
      cy="101.948"
      label="circle7"
      r="1.25"
      seat="7"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1215"
      cx="116.62203"
      cy="101.948"
      label="circle8"
      r="1.25"
      seat="8"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1216"
      cx="113.44705"
      cy="101.948"
      label="circle9"
      r="1.25"
      seat="9"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1217"
      cx="110.37203"
      cy="101.948"
      label="circle10"
      r="1.25"
      seat="10"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1218"
      cx="107.29702"
      cy="101.948"
      label="circle11"
      r="1.25"
      seat="11"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1219"
      cx="104.22209"
      cy="101.948"
      label="circle12"
      r="1.25"
      seat="12"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1220"
      cx="101.24703"
      cy="101.948"
      label="circle13"
      r="1.25"
      seat="13"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1221"
      cx="98.072037"
      cy="101.948"
      label="circle14"
      r="1.25"
      seat="14"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1222"
      cx="95.097008"
      cy="101.948"
      label="circle15"
      r="1.25"
      seat="15"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1223"
      cx="92.021996"
      cy="101.948"
      label="circle16"
      r="1.25"
      seat="16"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1224"
      cx="88.946999"
      cy="101.948"
      label="circle17"
      r="1.25"
      seat="17"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1225"
      cx="85.771996"
      cy="101.948"
      label="circle18"
      r="1.25"
      seat="18"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1226"
      cx="82.696999"
      cy="101.948"
      label="circle19"
      r="1.25"
      seat="19"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1227"
      cx="79.722"
      cy="101.948"
      label="circle20"
      r="1.25"
      seat="20"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1241"
      cx="61.717999"
      cy="101.948"
      label="circle21"
      r="1.25"
      seat="21"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1242"
      cx="58.643002"
      cy="101.948"
      label="circle22"
      r="1.25"
      seat="22"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1243"
      cx="55.467999"
      cy="101.948"
      label="circle23"
      r="1.25"
      seat="23"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1244"
      cx="52.193005"
      cy="101.948"
      label="circle24"
      r="1.25"
      seat="24"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1245"
      cx="49.118"
      cy="101.948"
      label="circle25"
      r="1.25"
      seat="25"
      row="22"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1249"
      cx="150.7218"
      cy="98.373001"
      label="circle1"
      r="1.25"
      seat="1"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1250"
      cx="147.44701"
      cy="98.373001"
      label="circle2"
      r="1.25"
      seat="2"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1251"
      cx="144.27205"
      cy="98.373001"
      label="circle3"
      r="1.25"
      seat="3"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1252"
      cx="141.19701"
      cy="98.373001"
      label="circle4"
      r="1.25"
      seat="4"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1255"
      cx="121.44317"
      cy="98.373001"
      label="circle5"
      r="1.25"
      seat="5"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1256"
      cx="118.36804"
      cy="98.373001"
      label="circle6"
      r="1.25"
      seat="6"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1257"
      cx="115.29305"
      cy="98.373001"
      label="circle7"
      r="1.25"
      seat="7"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1258"
      cx="112.11804"
      cy="98.373001"
      label="circle8"
      r="1.25"
      seat="8"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1259"
      cx="108.94305"
      cy="98.373001"
      label="circle9"
      r="1.25"
      seat="9"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1260"
      cx="105.86804"
      cy="98.373001"
      label="circle10"
      r="1.25"
      seat="10"
      floor="parterre"
      row="23" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1261"
      cx="102.79305"
      cy="98.373001"
      label="circle11"
      r="1.25"
      seat="11"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1262"
      cx="99.718117"
      cy="98.373001"
      label="circle12"
      r="1.25"
      seat="12"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1263"
      cx="96.743042"
      cy="98.373001"
      label="circle13"
      r="1.25"
      seat="13"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1264"
      cx="93.568039"
      cy="98.373001"
      label="circle14"
      r="1.25"
      seat="14"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1265"
      cx="90.59301"
      cy="98.373001"
      label="circle15"
      r="1.25"
      seat="15"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1266"
      cx="87.517998"
      cy="98.373001"
      label="circle16"
      r="1.25"
      seat="16"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1267"
      cx="84.443001"
      cy="98.373001"
      label="circle17"
      r="1.25"
      seat="17"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1268"
      cx="81.267998"
      cy="98.373001"
      label="circle18"
      r="1.25"
      seat="18"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1281"
      cx="61.747169"
      cy="98.373001"
      label="circle19"
      r="1.25"
      seat="19"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1282"
      cx="58.643002"
      cy="98.373001"
      label="circle20"
      r="1.25"
      seat="20"
      floor="parterre"
      row="23"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1283"
      cx="55.467999"
      cy="98.373001"
      label="circle21"
      r="1.25"
      seat="21"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#806600', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1284"
      cx="52.092999"
      cy="98.373001"
      label="circle22"
      r="1.25"
      seat="22"
      row="23"
      floor="parterre"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1576"
      cx="171.784"
      cy="176.63"
      label="circle1"
      r="1.25"
      seat="1"
      row="1"
      floor="leftLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1577"
      cx="171.05499"
      cy="173.05499"
      label="circle2"
      r="1.25"
      seat="2"
      row="1"
      floor="leftLoggia"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1578"
      cx="171.784"
      cy="161.41299"
      label="circle3"
      r="1.25"
      seat="3"
      row="1"
      floor="leftLoggia"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1579"
      cx="171.026"
      cy="157.80901"
      label="circle4"
      r="1.25"
      seat="4"
      row="1"
      floor="leftLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1580"
      cx="171.78419"
      cy="144.25114"
      label="circle5"
      r="1.25"
      seat="5"
      row="1"
      floor="leftLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1581"
      cx="171.026"
      cy="140.647"
      label="circle6"
      r="1.25"
      seat="6"
      row="1"
      floor="leftLoggia"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1582"
      cx="171.784"
      cy="125.301"
      label="circle7"
      r="1.25"
      seat="7"
      row="1"
      floor="leftLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1583"
      cx="171.026"
      cy="121.726"
      label="circle8"
      r="1.25"
      seat="8"
      row="1"
      floor="leftLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1584"
      cx="171.855"
      cy="107.539"
      label="circle9"
      r="1.25"
      seat="9"
      row="1"
      floor="leftLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1585"
      cx="171.026"
      cy="103.935"
      label="circle10"
      r="1.25"
      seat="10"
      row="1"
      floor="leftLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1594"
      cx="29.239"
      cy="176.42999"
      label="circle1"
      r="1.25"
      seat="1"
      row="1"
      floor="rightLoggia"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1595"
      cx="30.068001"
      cy="172.855"
      label="circle2"
      r="1.25"
      seat="2"
      row="1"
      floor="rightLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1596"
      cx="29.297001"
      cy="161.313"
      label="circle3"
      r="1.25"
      seat="3"
      row="1"
      floor="rightLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1597"
      cx="30.139"
      cy="157.709"
      label="circle4"
      r="1.25"
      seat="4"
      row="1"
      floor="rightLoggia"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1598"
      cx="29.297001"
      cy="144.05099"
      label="circle5"
      r="1.25"
      seat="5"
      row="1"
      floor="rightLoggia"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1599"
      cx="30.139"
      cy="140.44701"
      label="circle6"
      r="1.25"
      seat="6"
      row="1"
      floor="rightLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1600"
      cx="29.297001"
      cy="125.201"
      label="circle7"
      r="1.25"
      seat="7"
      row="1"
      floor="rightLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1601"
      cx="30.039"
      cy="121.526"
      label="circle8"
      r="1.25"
      seat="8"
      row="1"
      floor="rightLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1602"
      cx="29.268"
      cy="107.439"
      label="circle9"
      r="1.25"
      seat="9"
      row="1"
      floor="rightLoggia"
      onClick={e => choosePlace(e.target)} /><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1603"
      cx="30.139"
      cy="103.835"
      label="circle10"
      r="1.25"
      seat="10"
      row="1"
      floor="rightLoggia" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1"
      cx="145.39101"
      cy="79.560509"
      label="circle1"
      r="1.25"
      seat="1"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle2"
      cx="142.11621"
      cy="79.560509"
      label="circle2"
      r="1.25"
      seat="2"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle225"
      cx="138.94125"
      cy="79.560509"
      label="circle3"
      r="1.25"
      seat="3"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle4"
      cx="135.86621"
      cy="79.560509"
      label="circle4"
      r="1.25"
      seat="4"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle5"
      cx="132.69118"
      cy="79.560509"
      label="circle5"
      r="1.25"
      seat="5"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle6"
      cx="129.6161"
      cy="79.560509"
      label="circle6"
      r="1.25"
      seat="6"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle7"
      cx="126.54108"
      cy="79.560509"
      label="circle7"
      r="1.25"
      seat="7"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle8"
      cx="123.36609"
      cy="79.560509"
      label="circle8"
      r="1.25"
      seat="8"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle9"
      cx="120.1911"
      cy="79.560509"
      label="circle9"
      r="1.25"
      seat="9"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle10"
      cx="117.11609"
      cy="79.560509"
      label="circle10"
      r="1.25"
      seat="10"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle11"
      cx="114.04111"
      cy="79.560509"
      label="circle11"
      r="1.25"
      seat="11"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle12"
      cx="110.96614"
      cy="79.560509"
      label="circle12"
      r="1.25"
      seat="12"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle13"
      cx="107.99109"
      cy="79.560509"
      label="circle13"
      r="1.25"
      seat="13"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle14"
      cx="104.8161"
      cy="79.560509"
      label="circle14"
      r="1.25"
      seat="14"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle15"
      cx="101.84109"
      cy="79.560509"
      label="circle15"
      r="1.25"
      seat="15"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle16"
      cx="98.76606"
      cy="79.560509"
      label="circle16"
      r="1.25"
      seat="16"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle17"
      cx="95.691063"
      cy="79.560509"
      label="circle17"
      r="1.25"
      seat="17"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle18"
      cx="92.51606"
      cy="79.560509"
      label="circle18"
      r="1.25"
      seat="18"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle19"
      cx="89.441063"
      cy="79.560509"
      label="circle19"
      r="1.25"
      seat="19"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle20"
      cx="86.466064"
      cy="79.560509"
      label="circle20"
      r="1.25"
      seat="20"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle21"
      cx="83.491058"
      cy="79.560509"
      label="circle21"
      r="1.25"
      seat="21"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle22"
      cx="80.416061"
      cy="79.560509"
      label="circle22"
      r="1.25"
      seat="22"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle23"
      cx="77.241058"
      cy="79.560509"
      label="circle23"
      r="1.25"
      seat="23"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle24"
      cx="73.966064"
      cy="79.560509"
      label="circle24"
      r="1.25"
      seat="24"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle25"
      cx="70.89106"
      cy="79.560509"
      label="circle25"
      r="1.25"
      seat="25"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle26"
      cx="67.716087"
      cy="79.560509"
      label="circle26"
      r="1.25"
      seat="26"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle27"
      cx="64.641106"
      cy="79.560509"
      label="circle27"
      r="1.25"
      seat="27"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle28"
      cx="61.466114"
      cy="79.560509"
      label="circle28"
      r="1.25"
      seat="28"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle29"
      cx="58.291111"
      cy="79.560509"
      label="circle29"
      r="1.25"
      seat="29"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill:'#008080', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle222"
      cx="55.016197"
      cy="79.560509"
      label="circle30"
      r="1.25"
      seat="30"
      row="1"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle614"
      cx="145.39101"
      cy="75.456833"
      label="circle1"
      r="1.25"
      seat="1"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle615"
      cx="142.11621"
      cy="75.456833"
      label="circle2"
      r="1.25"
      seat="2"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle616"
      cx="138.94125"
      cy="75.456833"
      label="circle3"
      r="1.25"
      seat="3"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle617"
      cx="135.86621"
      cy="75.456833"
      label="circle4"
      r="1.25"
      seat="4"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle618"
      cx="132.69118"
      cy="75.456833"
      label="circle5"
      r="1.25"
      seat="5"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle619"
      cx="129.6161"
      cy="75.456833"
      label="circle6"
      r="1.25"
      seat="6"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle620"
      cx="126.54108"
      cy="75.456833"
      label="circle7"
      r="1.25"
      seat="7"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle621"
      cx="123.36609"
      cy="75.456833"
      label="circle8"
      r="1.25"
      seat="8"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle622"
      cx="120.1911"
      cy="75.456833"
      label="circle9"
      r="1.25"
      seat="9"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle623"
      cx="117.11609"
      cy="75.456833"
      label="circle10"
      r="1.25"
      seat="10"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle624"
      cx="114.04111"
      cy="75.456833"
      label="circle11"
      r="1.25"
      seat="11"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle625"
      cx="110.96614"
      cy="75.456833"
      label="circle12"
      r="1.25"
      seat="12"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle626"
      cx="107.99109"
      cy="75.456833"
      label="circle13"
      r="1.25"
      seat="13"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle627"
      cx="104.8161"
      cy="75.456833"
      label="circle14"
      r="1.25"
      seat="14"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle628"
      cx="101.84109"
      cy="75.456833"
      label="circle15"
      r="1.25"
      seat="15"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle629"
      cx="98.76606"
      cy="75.456833"
      label="circle16"
      r="1.25"
      seat="16"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle630"
      cx="95.691063"
      cy="75.456833"
      label="circle17"
      r="1.25"
      seat="17"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle631"
      cx="92.51606"
      cy="75.456833"
      label="circle18"
      r="1.25"
      seat="18"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle632"
      cx="89.441063"
      cy="75.456833"
      label="circle19"
      r="1.25"
      seat="19"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle633"
      cx="86.466064"
      cy="75.456833"
      label="circle20"
      r="1.25"
      seat="20"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle634"
      cx="83.491058"
      cy="75.456833"
      label="circle21"
      r="1.25"
      seat="21"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle635"
      cx="80.416061"
      cy="75.456833"
      label="circle22"
      r="1.25"
      seat="22"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle636"
      cx="77.241058"
      cy="75.456833"
      label="circle23"
      r="1.25"
      seat="23"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle637"
      cx="73.966064"
      cy="75.456833"
      label="circle24"
      r="1.25"
      seat="24"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle638"
      cx="70.89106"
      cy="75.456833"
      label="circle25"
      r="1.25"
      seat="25"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle639"
      cx="67.716087"
      cy="75.456833"
      label="circle26"
      r="1.25"
      seat="26"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle640"
      cx="64.641106"
      cy="75.456833"
      label="circle27"
      r="1.25"
      seat="27"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle641"
      cx="61.466114"
      cy="75.456833"
      label="circle28"
      r="1.25"
      seat="28"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle642"
      cx="58.291111"
      cy="75.456833"
      label="circle29"
      r="1.25"
      seat="29"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle643"
      cx="55.016197"
      cy="75.456833"
      label="circle30"
      r="1.25"
      seat="30"
      row="2"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle915"
      cx="145.39101"
      cy="71.352829"
      label="circle1"
      r="1.25"
      seat="1"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle916"
      cx="142.11621"
      cy="71.352829"
      label="circle2"
      r="1.25"
      seat="2"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle917"
      cx="138.94125"
      cy="71.352829"
      label="circle3"
      r="1.25"
      seat="3"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle918"
      cx="135.86621"
      cy="71.352829"
      label="circle4"
      r="1.25"
      seat="4"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle919"
      cx="132.69118"
      cy="71.352829"
      label="circle5"
      r="1.25"
      seat="5"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle920"
      cx="129.6161"
      cy="71.352829"
      label="circle6"
      r="1.25"
      seat="6"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle921"
      cx="126.54108"
      cy="71.352829"
      label="circle7"
      r="1.25"
      seat="7"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle922"
      cx="123.36609"
      cy="71.352829"
      label="circle8"
      r="1.25"
      seat="8"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle923"
      cx="120.1911"
      cy="71.352829"
      label="circle9"
      r="1.25"
      seat="9"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle924"
      cx="117.11609"
      cy="71.352829"
      label="circle10"
      r="1.25"
      seat="10"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle925"
      cx="114.04111"
      cy="71.352829"
      label="circle11"
      r="1.25"
      seat="11"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle926"
      cx="110.96614"
      cy="71.352829"
      label="circle12"
      r="1.25"
      seat="12"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle932"
      cx="107.99109"
      cy="71.352829"
      label="circle13"
      r="1.25"
      seat="13"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle933"
      cx="104.8161"
      cy="71.352829"
      label="circle14"
      r="1.25"
      seat="14"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle934"
      cx="101.84109"
      cy="71.352829"
      label="circle15"
      r="1.25"
      seat="15"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle940"
      cx="98.76606"
      cy="71.352829"
      label="circle16"
      r="1.25"
      seat="16"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle941"
      cx="95.691063"
      cy="71.352829"
      label="circle17"
      r="1.25"
      seat="17"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle942"
      cx="92.51606"
      cy="71.352829"
      label="circle18"
      r="1.25"
      seat="18"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle960"
      cx="89.441063"
      cy="71.352829"
      label="circle19"
      r="1.25"
      seat="19"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle961"
      cx="86.466064"
      cy="71.352829"
      label="circle20"
      r="1.25"
      seat="20"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle962"
      cx="83.491058"
      cy="71.352829"
      label="circle21"
      r="1.25"
      seat="21"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle963"
      cx="80.416061"
      cy="71.352829"
      label="circle22"
      r="1.25"
      seat="22"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle964"
      cx="77.241058"
      cy="71.352829"
      label="circle23"
      r="1.25"
      seat="23"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle965"
      cx="73.966064"
      cy="71.352829"
      label="circle24"
      r="1.25"
      seat="24"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle966"
      cx="70.89106"
      cy="71.352829"
      label="circle25"
      r="1.25"
      seat="25"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle967"
      cx="67.716087"
      cy="71.352829"
      label="circle26"
      r="1.25"
      seat="26"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle968"
      cx="64.641106"
      cy="71.352829"
      label="circle27"
      r="1.25"
      seat="27"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle969"
      cx="61.466114"
      cy="71.352829"
      label="circle28"
      r="1.25"
      seat="28"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle970"
      cx="58.291111"
      cy="71.352829"
      label="circle29"
      r="1.25"
      seat="29"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#fa2a7f', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle971"
      cx="55.016197"
      cy="71.352829"
      label="circle30"
      r="1.25"
      seat="30"
      row="3"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1116"
      cx="145.39101"
      cy="67.248833"
      label="circle1"
      r="1.25"
      seat="1"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1117"
      cx="142.11621"
      cy="67.248833"
      label="circle2"
      r="1.25"
      seat="2"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1118"
      cx="138.94125"
      cy="67.248833"
      label="circle3"
      r="1.25"
      seat="3"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1124"
      cx="135.86621"
      cy="67.248833"
      label="circle4"
      r="1.25"
      seat="4"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1125"
      cx="132.69118"
      cy="67.248833"
      label="circle5"
      r="1.25"
      seat="5"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1126"
      cx="129.6161"
      cy="67.248833"
      label="circle6"
      r="1.25"
      seat="6"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1142"
      cx="126.54108"
      cy="67.248833"
      label="circle7"
      r="1.25"
      seat="7"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1143"
      cx="123.36609"
      cy="67.248833"
      label="circle8"
      r="1.25"
      seat="8"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1144"
      cx="120.1911"
      cy="67.248833"
      label="circle9"
      r="1.25"
      seat="9"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1145"
      cx="117.11609"
      cy="67.248833"
      label="circle10"
      r="1.25"
      seat="10"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1146"
      cx="114.04111"
      cy="67.248833"
      label="circle11"
      r="1.25"
      seat="11"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1147"
      cx="110.96614"
      cy="67.248833"
      label="circle12"
      r="1.25"
      seat="12"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1148"
      cx="107.99109"
      cy="67.248833"
      label="circle13"
      r="1.25"
      seat="13"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1149"
      cx="104.8161"
      cy="67.248833"
      label="circle14"
      r="1.25"
      seat="14"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1150"
      cx="101.84109"
      cy="67.248833"
      label="circle15"
      r="1.25"
      seat="15"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1151"
      cx="98.76606"
      cy="67.248833"
      label="circle16"
      r="1.25"
      seat="16"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1152"
      cx="95.691063"
      cy="67.248833"
      label="circle17"
      r="1.25"
      seat="17"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1153"
      cx="92.51606"
      cy="67.248833"
      label="circle18"
      r="1.25"
      seat="18"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1154"
      cx="89.441063"
      cy="67.248833"
      label="circle19"
      r="1.25"
      seat="19"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1160"
      cx="86.466064"
      cy="67.248833"
      label="circle20"
      r="1.25"
      seat="20"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1161"
      cx="83.491058"
      cy="67.248833"
      label="circle21"
      r="1.25"
      seat="21"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1162"
      cx="80.416061"
      cy="67.248833"
      label="circle22"
      r="1.25"
      seat="22"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1168"
      cx="77.241058"
      cy="67.248833"
      label="circle23"
      r="1.25"
      seat="23"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1169"
      cx="73.966064"
      cy="67.248833"
      label="circle24"
      r="1.25"
      seat="24"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1170"
      cx="70.89106"
      cy="67.248833"
      label="circle25"
      r="1.25"
      seat="25"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1185"
      cx="67.716087"
      cy="67.248833"
      label="circle26"
      r="1.25"
      seat="26"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1186"
      cx="64.641106"
      cy="67.248833"
      label="circle27"
      r="1.25"
      seat="27"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1187"
      cx="61.466114"
      cy="67.248833"
      label="circle28"
      r="1.25"
      seat="28"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1188"
      cx="58.291111"
      cy="67.248833"
      label="circle29"
      r="1.25"
      seat="29"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1189"
      cx="55.016197"
      cy="67.248833"
      label="circle30"
      r="1.25"
      seat="30"
      row="4"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1363"
      cx="145.39101"
      cy="63.144829"
      label="circle1"
      r="1.25"
      seat="1"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1364"
      cx="142.11621"
      cy="63.144829"
      label="circle2"
      r="1.25"
      seat="2"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1365"
      cx="138.94125"
      cy="63.144829"
      label="circle3"
      r="1.25"
      seat="3"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1366"
      cx="135.86621"
      cy="63.144829"
      label="circle4"
      r="1.25"
      seat="4"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1367"
      cx="132.69118"
      cy="63.144829"
      label="circle5"
      r="1.25"
      seat="5"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1368"
      cx="129.6161"
      cy="63.144829"
      label="circle6"
      r="1.25"
      seat="6"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1369"
      cx="126.54108"
      cy="63.144829"
      label="circle7"
      r="1.25"
      seat="7"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1370"
      cx="123.36609"
      cy="63.144829"
      label="circle8"
      r="1.25"
      seat="8"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1371"
      cx="120.1911"
      cy="63.144829"
      label="circle9"
      r="1.25"
      seat="9"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1372"
      cx="117.11609"
      cy="63.144829"
      label="circle10"
      r="1.25"
      seat="10"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1373"
      cx="112.45361"
      cy="63.144829"
      label="circle11"
      r="1.25"
      seat="11"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1374"
      cx="109.37864"
      cy="63.144829"
      label="circle12"
      r="1.25"
      seat="12"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1375"
      cx="106.40358"
      cy="63.144829"
      label="circle13"
      r="1.25"
      seat="13"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1376"
      cx="103.22859"
      cy="63.144829"
      label="circle14"
      r="1.25"
      seat="14"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1377"
      cx="100.25359"
      cy="63.144829"
      label="circle15"
      r="1.25"
      seat="15"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1378"
      cx="97.178558"
      cy="63.144829"
      label="circle16"
      r="1.25"
      seat="16"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1379"
      cx="94.103561"
      cy="63.144829"
      label="circle17"
      r="1.25"
      seat="17"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1380"
      cx="90.928558"
      cy="63.144829"
      label="circle18"
      r="1.25"
      seat="18"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1381"
      cx="87.853561"
      cy="63.144829"
      label="circle19"
      r="1.25"
      seat="19"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1382"
      cx="83.290955"
      cy="63.144829"
      label="circle20"
      r="1.25"
      seat="20"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1383"
      cx="80.315948"
      cy="63.144829"
      label="circle21"
      r="1.25"
      seat="21"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1384"
      cx="77.240952"
      cy="63.144829"
      label="circle22"
      r="1.25"
      seat="22"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1385"
      cx="74.065948"
      cy="63.144829"
      label="circle23"
      r="1.25"
      seat="23"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1386"
      cx="70.790955"
      cy="63.144829"
      label="circle24"
      r="1.25"
      seat="24"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1387"
      cx="67.71595"
      cy="63.144829"
      label="circle25"
      r="1.25"
      seat="25"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1388"
      cx="64.540977"
      cy="63.144829"
      label="circle26"
      r="1.25"
      seat="26"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1389"
      cx="61.465996"
      cy="63.144829"
      label="circle27"
      r="1.25"
      seat="27"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1390"
      cx="58.291004"
      cy="63.144829"
      label="circle28"
      r="1.25"
      seat="28"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/><circle
      onMouseOver={e => enterCircle(e)}
      onMouseOut={e => leaveCircle(e)}
      style={{fill: '#2815bd', fillOpacity: '1', strokeWidth: '0.248452'}}
      id="circle1391"
      cx="55.116001"
      cy="63.144829"
      label="circle29"
      r="1.25"
      seat="29"
      row="5"
      floor="balcony" 
      onClick={e => choosePlace(e.target)}/></g>
      <g
    groupmode="layer"
    id="layer3"
    label="Lable"
    style={{display: 'inline',pointerEvents: 'none'}}><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="138.97034"
      y="204.73045"
      id="text90"
      label="text1"><tspan
        role="line"
        id="tspan90"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="138.97034"
        y="204.73045">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.62526"
      y="204.73045"
      id="text91"
      label="text2"><tspan
        role="line"
        id="tspan91"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.62526"
        y="204.73045">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.45026"
      y="204.73045"
      id="text92"
      label="text3"><tspan
        role="line"
        id="tspan92"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.45026"
        y="204.73045">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.47525"
      y="204.73045"
      id="text93"
      label="text4"><tspan
        role="line"
        id="tspan93"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.47525"
        y="204.73045">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.30025"
      y="204.73045"
      id="text94"
      label="text5"><tspan
        role="line"
        id="tspan94"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.30025"
        y="204.73045">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.22525"
      y="204.73045"
      id="text95"
      label="text6"><tspan
        role="line"
        id="tspan95"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.22525"
        y="204.73045">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="120.15025"
      y="204.73045"
      id="text96"
      label="text7"><tspan
        role="line"
        id="tspan96"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="120.15025"
        y="204.73045">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="116.97533"
      y="204.73045"
      id="text97"
      label="text8"><tspan
        role="line"
        id="tspan97"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="116.97533"
        y="204.73045">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.80035"
      y="204.73045"
      id="text98"
      label="text9"><tspan
        role="line"
        id="tspan98"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.80035"
        y="204.73045">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.32533"
      y="204.73045"
      id="text99"
      label="text10"><tspan
        role="line"
        id="tspan99"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.32533"
        y="204.73045">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.27934"
      y="204.73045"
      id="text100"
      label="text11"><tspan
        role="line"
        id="tspan100"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.27934"
        y="204.73045">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.20433"
      y="204.73045"
      id="text101"
      label="text12"><tspan
        role="line"
        id="tspan101"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.20433"
        y="204.73045">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.22933"
      y="204.73045"
      id="text102"
      label="text13"><tspan
        role="line"
        id="tspan102"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.22933"
        y="204.73045">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.054329"
      y="204.73045"
      id="text103"
      label="text14"><tspan
        role="line"
        id="tspan103"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.054329"
        y="204.73045">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.008331"
      y="204.73045"
      id="text104"
      label="text15"><tspan
        role="line"
        id="tspan104"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.008331"
        y="204.73045">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="91.933334"
      y="204.73045"
      id="text105"
      label="text16"><tspan
        role="line"
        id="tspan105"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="91.933334"
        y="204.73045">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="88.887329"
      y="204.73045"
      id="text106"
      label="text17"><tspan
        role="line"
        id="tspan106"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="88.887329"
        y="204.73045">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="85.812332"
      y="204.73045"
      id="text107"
      label="text18"><tspan
        role="line"
        id="tspan107"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="85.812332"
        y="204.73045">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="82.637329"
      y="204.73045"
      id="text108"
      label="text19"><tspan
        role="line"
        id="tspan108"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="82.637329"
        y="204.73045">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="79.791252"
      y="204.73045"
      id="text109"
      label="text20"><tspan
        role="line"
        id="tspan109"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="79.791252"
        y="204.73045">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="76.816246"
      y="204.73045"
      id="text111"
      label="text21"><tspan
        role="line"
        id="tspan111"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="76.816246"
        y="204.73045">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.641243"
      y="204.73045"
      id="text112"
      label="text22"><tspan
        role="line"
        id="tspan112"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.641243"
        y="204.73045">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.46624"
      y="204.73045"
      id="text113"
      label="text23"><tspan
        role="line"
        id="tspan113"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.46624"
        y="204.73045">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.191254"
      y="204.73045"
      id="text114"
      label="text24"><tspan
        role="line"
        id="tspan114"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.191254"
        y="204.73045">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="64.116234"
      y="204.73045"
      id="text115"
      label="text25"><tspan
        role="line"
        id="tspan115"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="64.116234"
        y="204.73045">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="60.941231"
      y="204.73045"
      id="text116"
      label="text26"><tspan
        role="line"
        id="tspan116"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="60.941231"
        y="204.73045">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.4704"
      y="201.25545"
      id="text117"
      label="text1"><tspan
        role="line"
        id="tspan117"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.4704"
        y="201.25545">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="137.12532"
      y="201.25545"
      id="text118"
      label="text2"><tspan
        role="line"
        id="tspan118"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="137.12532"
        y="201.25545">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="133.95032"
      y="201.25545"
      id="text119"
      label="text3"><tspan
        role="line"
        id="tspan119"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="133.95032"
        y="201.25545">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="130.97531"
      y="201.25545"
      id="text120"
      label="text4"><tspan
        role="line"
        id="tspan120"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="130.97531"
        y="201.25545">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="127.80027"
      y="201.25545"
      id="text121"
      label="text5"><tspan
        role="line"
        id="tspan121"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="127.80027"
        y="201.25545">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="124.72527"
      y="201.25545"
      id="text122"
      label="text6"><tspan
        role="line"
        id="tspan122"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="124.72527"
        y="201.25545">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.65027"
      y="201.25545"
      id="text123"
      label="text7"><tspan
        role="line"
        id="tspan123"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.65027"
        y="201.25545">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.47534"
      y="201.25545"
      id="text124"
      label="text8"><tspan
        role="line"
        id="tspan124"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.47534"
        y="201.25545">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="115.30036"
      y="201.25545"
      id="text125"
      label="text9"><tspan
        role="line"
        id="tspan125"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="115.30036"
        y="201.25545">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="111.82534"
      y="201.25545"
      id="text126"
      label="text10"><tspan
        role="line"
        id="tspan126"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="111.82534"
        y="201.25545">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="108.77935"
      y="201.25545"
      id="text127"
      label="text11"><tspan
        role="line"
        id="tspan127"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="108.77935"
        y="201.25545">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="105.70435"
      y="201.25545"
      id="text128"
      label="text12"><tspan
        role="line"
        id="tspan128"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="105.70435"
        y="201.25545">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="102.72935"
      y="201.25545"
      id="text129"
      label="text13"><tspan
        role="line"
        id="tspan129"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="102.72935"
        y="201.25545">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.554329"
      y="201.25545"
      id="text130"
      label="text14"><tspan
        role="line"
        id="tspan130"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.554329"
        y="201.25545">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.508331"
      y="201.25545"
      id="text131"
      label="text15"><tspan
        role="line"
        id="tspan131"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.508331"
        y="201.25545">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="93.433334"
      y="201.25545"
      id="text132"
      label="text16"><tspan
        role="line"
        id="tspan132"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="93.433334"
        y="201.25545">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="90.387329"
      y="201.25545"
      id="text133"
      label="text17"><tspan
        role="line"
        id="tspan133"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="90.387329"
        y="201.25545">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.312332"
      y="201.25545"
      id="text134"
      label="text18"><tspan
        role="line"
        id="tspan134"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.312332"
        y="201.25545">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="84.137329"
      y="201.25545"
      id="text135"
      label="text19"><tspan
        role="line"
        id="tspan135"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="84.137329"
        y="201.25545">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.291252"
      y="201.25545"
      id="text136"
      label="text20"><tspan
        role="line"
        id="tspan136"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.291252"
        y="201.25545">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.316246"
      y="201.25545"
      id="text137"
      label="text21"><tspan
        role="line"
        id="tspan137"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.316246"
        y="201.25545">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="75.141243"
      y="201.25545"
      id="text138"
      label="text22"><tspan
        role="line"
        id="tspan138"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="75.141243"
        y="201.25545">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="71.96624"
      y="201.25545"
      id="text139"
      label="text23"><tspan
        role="line"
        id="tspan139"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="71.96624"
        y="201.25545">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="68.691254"
      y="201.25545"
      id="text140"
      label="text24"><tspan
        role="line"
        id="tspan140"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="68.691254"
        y="201.25545">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="65.616234"
      y="201.25545"
      id="text141"
      label="text25"><tspan
        role="line"
        id="tspan141"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="65.616234"
        y="201.25545">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="62.441254"
      y="201.25545"
      id="text142"
      label="text26"><tspan
        role="line"
        id="tspan142"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="62.441254"
        y="201.25545">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="59.366253"
      y="201.25545"
      id="text143"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="59.366253"
        y="201.25545"
        id="tspan144">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="142.27046"
      y="197.55133"
      id="text145"
      label="text1"><tspan
        role="line"
        id="tspan145"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="142.27046"
        y="197.55133">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="138.92538"
      y="197.55133"
      id="text146"
      label="text2"><tspan
        role="line"
        id="tspan146"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="138.92538"
        y="197.55133">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.75038"
      y="197.55133"
      id="text147"
      label="text3"><tspan
        role="line"
        id="tspan147"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.75038"
        y="197.55133">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.77538"
      y="197.55133"
      id="text148"
      label="text4"><tspan
        role="line"
        id="tspan148"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.77538"
        y="197.55133">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.60033"
      y="197.55133"
      id="text149"
      label="text5"><tspan
        role="line"
        id="tspan149"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.60033"
        y="197.55133">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.52527"
      y="197.55133"
      id="text150"
      label="text6"><tspan
        role="line"
        id="tspan150"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.52527"
        y="197.55133">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.45027"
      y="197.55133"
      id="text151"
      label="text7"><tspan
        role="line"
        id="tspan151"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.45027"
        y="197.55133">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="120.27534"
      y="197.55133"
      id="text152"
      label="text8"><tspan
        role="line"
        id="tspan152"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="120.27534"
        y="197.55133">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.10036"
      y="197.55133"
      id="text153"
      label="text9"><tspan
        role="line"
        id="tspan153"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.10036"
        y="197.55133">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.62534"
      y="197.55133"
      id="text154"
      label="text10"><tspan
        role="line"
        id="tspan154"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.62534"
        y="197.55133">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.57935"
      y="197.55133"
      id="text155"
      label="text11"><tspan
        role="line"
        id="tspan155"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.57935"
        y="197.55133">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.50435"
      y="197.55133"
      id="text156"
      label="text12"><tspan
        role="line"
        id="tspan156"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.50435"
        y="197.55133">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.52935"
      y="197.55133"
      id="text157"
      label="text13"><tspan
        role="line"
        id="tspan157"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.52935"
        y="197.55133">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.35432"
      y="197.55133"
      id="text158"
      label="text14"><tspan
        role="line"
        id="tspan158"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.35432"
        y="197.55133">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.308304"
      y="197.55133"
      id="text159"
      label="text15"><tspan
        role="line"
        id="tspan159"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.308304"
        y="197.55133">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.233307"
      y="197.55133"
      id="text160"
      label="text16"><tspan
        role="line"
        id="tspan160"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.233307"
        y="197.55133">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.187302"
      y="197.55133"
      id="text161"
      label="text17"><tspan
        role="line"
        id="tspan161"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.187302"
        y="197.55133">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.112305"
      y="197.55133"
      id="text162"
      label="text18"><tspan
        role="line"
        id="tspan162"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.112305"
        y="197.55133">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="85.937302"
      y="197.55133"
      id="text163"
      label="text19"><tspan
        role="line"
        id="tspan163"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="85.937302"
        y="197.55133">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.091225"
      y="197.55133"
      id="text164"
      label="text20"><tspan
        role="line"
        id="tspan164"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.091225"
        y="197.55133">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.116219"
      y="197.55133"
      id="text165"
      label="text21"><tspan
        role="line"
        id="tspan165"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.116219"
        y="197.55133">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="76.941216"
      y="197.55133"
      id="text166"
      label="text22"><tspan
        role="line"
        id="tspan166"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="76.941216"
        y="197.55133">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.766212"
      y="197.55133"
      id="text167"
      label="text23"><tspan
        role="line"
        id="tspan167"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.766212"
        y="197.55133">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.491226"
      y="197.55133"
      id="text168"
      label="text24"><tspan
        role="line"
        id="tspan168"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.491226"
        y="197.55133">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.416206"
      y="197.55133"
      id="text169"
      label="text25"><tspan
        role="line"
        id="tspan169"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.416206"
        y="197.55133">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="64.241249"
      y="197.55133"
      id="text170"
      label="text26"><tspan
        role="line"
        id="tspan170"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="64.241249"
        y="197.55133">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.166252"
      y="197.55133"
      id="text171"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.166252"
        y="197.55133"
        id="tspan171">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.991249"
      y="197.55133"
      id="text172"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.991249"
        y="197.55133"
        id="tspan173">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.93326"
      y="182.20584"
      id="text305"
      label="text1"><tspan
        role="line"
        id="tspan305"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.93326"
        y="182.20584">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.58818"
      y="182.20584"
      id="text306"
      label="text2"><tspan
        role="line"
        id="tspan306"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.58818"
        y="182.20584">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="137.41318"
      y="182.20584"
      id="text307"
      label="text3"><tspan
        role="line"
        id="tspan307"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="137.41318"
        y="182.20584">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="134.43817"
      y="182.20584"
      id="text308"
      label="text4"><tspan
        role="line"
        id="tspan308"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="134.43817"
        y="182.20584">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="131.26318"
      y="182.20584"
      id="text309"
      label="text5"><tspan
        role="line"
        id="tspan309"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="131.26318"
        y="182.20584">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="128.18823"
      y="182.20584"
      id="text310"
      label="text6"><tspan
        role="line"
        id="tspan310"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="128.18823"
        y="182.20584">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="125.1132"
      y="182.20584"
      id="text311"
      label="text7"><tspan
        role="line"
        id="tspan311"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="125.1132"
        y="182.20584">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.93832"
      y="182.20584"
      id="text312"
      label="text8"><tspan
        role="line"
        id="tspan312"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.93832"
        y="182.20584">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.76335"
      y="182.20584"
      id="text313"
      label="text9"><tspan
        role="line"
        id="tspan313"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.76335"
        y="182.20584">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="115.28831"
      y="182.20584"
      id="text314"
      label="text10"><tspan
        role="line"
        id="tspan314"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="115.28831"
        y="182.20584">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="112.24232"
      y="182.20584"
      id="text315"
      label="text11"><tspan
        role="line"
        id="tspan315"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="112.24232"
        y="182.20584">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.16728"
      y="182.20584"
      id="text316"
      label="text12"><tspan
        role="line"
        id="tspan316"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.16728"
        y="182.20584">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.19233"
      y="182.20584"
      id="text317"
      label="text13"><tspan
        role="line"
        id="tspan317"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.19233"
        y="182.20584">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.0173"
      y="182.20584"
      id="text318"
      label="text14"><tspan
        role="line"
        id="tspan318"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.0173"
        y="182.20584">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.971329"
      y="182.20584"
      id="text319"
      label="text15"><tspan
        role="line"
        id="tspan319"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.971329"
        y="182.20584">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.896332"
      y="182.20584"
      id="text320"
      label="text16"><tspan
        role="line"
        id="tspan320"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.896332"
        y="182.20584">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="93.850327"
      y="182.20584"
      id="text321"
      label="text17"><tspan
        role="line"
        id="tspan321"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="93.850327"
        y="182.20584">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="90.77533"
      y="182.20584"
      id="text322"
      label="text18"><tspan
        role="line"
        id="tspan322"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="90.77533"
        y="182.20584">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.600327"
      y="182.20584"
      id="text323"
      label="text19"><tspan
        role="line"
        id="tspan323"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.600327"
        y="182.20584">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="84.75425"
      y="182.20584"
      id="text324"
      label="text20"><tspan
        role="line"
        id="tspan324"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="84.75425"
        y="182.20584">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.779243"
      y="182.20584"
      id="text325"
      label="text21"><tspan
        role="line"
        id="tspan325"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.779243"
        y="182.20584">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.60424"
      y="182.20584"
      id="text326"
      label="text22"><tspan
        role="line"
        id="tspan326"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.60424"
        y="182.20584">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="75.429237"
      y="182.20584"
      id="text327"
      label="text23"><tspan
        role="line"
        id="tspan327"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="75.429237"
        y="182.20584">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="72.154251"
      y="182.20584"
      id="text328"
      label="text24"><tspan
        role="line"
        id="tspan328"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="72.154251"
        y="182.20584">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="69.079231"
      y="182.20584"
      id="text329"
      label="text25"><tspan
        role="line"
        id="tspan329"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="69.079231"
        y="182.20584">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="65.904228"
      y="182.20584"
      id="text330"
      label="text26"><tspan
        role="line"
        id="tspan330"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="65.904228"
        y="182.20584">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="62.675591"
      y="182.20546"
      id="text388"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="62.675591"
        y="182.20546"
        id="tspan388">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="59.500565"
      y="182.20546"
      id="text389"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="59.500565"
        y="182.20546"
        id="tspan389">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="56.325508"
      y="182.20546"
      id="text390"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="56.325508"
        y="182.20546"
        id="tspan390">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="142.35838"
      y="178.63081"
      id="text331"
      label="text1"><tspan
        role="line"
        id="tspan331"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="142.35838"
        y="178.63081">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="139.01331"
      y="178.63081"
      id="text332"
      label="text2"><tspan
        role="line"
        id="tspan332"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="139.01331"
        y="178.63081">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.8383"
      y="178.63081"
      id="text333"
      label="text3"><tspan
        role="line"
        id="tspan333"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.8383"
        y="178.63081">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.8633"
      y="178.63081"
      id="text334"
      label="text4"><tspan
        role="line"
        id="tspan334"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.8633"
        y="178.63081">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.68826"
      y="178.63081"
      id="text335"
      label="text5"><tspan
        role="line"
        id="tspan335"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.68826"
        y="178.63081">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.61327"
      y="178.63081"
      id="text336"
      label="text6"><tspan
        role="line"
        id="tspan336"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.61327"
        y="178.63081">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.53828"
      y="178.63081"
      id="text337"
      label="text7"><tspan
        role="line"
        id="tspan337"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.53828"
        y="178.63081">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="120.36335"
      y="178.63081"
      id="text338"
      label="text8"><tspan
        role="line"
        id="tspan338"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="120.36335"
        y="178.63081">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.18837"
      y="178.63081"
      id="text339"
      label="text9"><tspan
        role="line"
        id="tspan339"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.18837"
        y="178.63081">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.71333"
      y="178.63081"
      id="text340"
      label="text10"><tspan
        role="line"
        id="tspan340"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.71333"
        y="178.63081">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.66734"
      y="178.63081"
      id="text341"
      label="text11"><tspan
        role="line"
        id="tspan341"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.66734"
        y="178.63081">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.59235"
      y="178.63081"
      id="text342"
      label="text12"><tspan
        role="line"
        id="tspan342"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.59235"
        y="178.63081">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.61736"
      y="178.63081"
      id="text343"
      label="text13"><tspan
        role="line"
        id="tspan343"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.61736"
        y="178.63081">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.44234"
      y="178.63081"
      id="text344"
      label="text14"><tspan
        role="line"
        id="tspan344"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.44234"
        y="178.63081">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.396339"
      y="178.63081"
      id="text345"
      label="text15"><tspan
        role="line"
        id="tspan345"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.396339"
        y="178.63081">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.321335"
      y="178.63081"
      id="text346"
      label="text16"><tspan
        role="line"
        id="tspan346"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.321335"
        y="178.63081">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.27533"
      y="178.63081"
      id="text347"
      label="text17"><tspan
        role="line"
        id="tspan347"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.27533"
        y="178.63081">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.200333"
      y="178.63081"
      id="text348"
      label="text18"><tspan
        role="line"
        id="tspan348"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.200333"
        y="178.63081">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.02533"
      y="178.63081"
      id="text349"
      label="text19"><tspan
        role="line"
        id="tspan349"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.02533"
        y="178.63081">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.179253"
      y="178.63081"
      id="text350"
      label="text20"><tspan
        role="line"
        id="tspan350"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.179253"
        y="178.63081">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.204247"
      y="178.63081"
      id="text351"
      label="text21"><tspan
        role="line"
        id="tspan351"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.204247"
        y="178.63081">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="77.029243"
      y="178.63081"
      id="text352"
      label="text22"><tspan
        role="line"
        id="tspan352"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="77.029243"
        y="178.63081">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.85424"
      y="178.63081"
      id="text353"
      label="text23"><tspan
        role="line"
        id="tspan353"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.85424"
        y="178.63081">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.579254"
      y="178.63081"
      id="text354"
      label="text24"><tspan
        role="line"
        id="tspan354"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.579254"
        y="178.63081">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.504234"
      y="178.63081"
      id="text355"
      label="text25"><tspan
        role="line"
        id="tspan355"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.504234"
        y="178.63081">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="64.329254"
      y="178.63081"
      id="text356"
      label="text26"><tspan
        role="line"
        id="tspan356"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="64.329254"
        y="178.63081">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.25425"
      y="178.63081"
      id="text357"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.25425"
        y="178.63081"
        id="tspan357">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.977253"
      y="178.63045"
      id="text391"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.977253"
        y="178.63045"
        id="tspan391">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.95844"
      y="174.92671"
      id="text358"
      label="text1"><tspan
        role="line"
        id="tspan358"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.95844"
        y="174.92671">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.61336"
      y="174.92671"
      id="text359"
      label="text2"><tspan
        role="line"
        id="tspan359"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.61336"
        y="174.92671">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="137.43835"
      y="174.92671"
      id="text360"
      label="text3"><tspan
        role="line"
        id="tspan360"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="137.43835"
        y="174.92671">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="134.46335"
      y="174.92671"
      id="text361"
      label="text4"><tspan
        role="line"
        id="tspan361"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="134.46335"
        y="174.92671">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="131.2883"
      y="174.92671"
      id="text362"
      label="text5"><tspan
        role="line"
        id="tspan362"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="131.2883"
        y="174.92671">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="128.21327"
      y="174.92671"
      id="text363"
      label="text6"><tspan
        role="line"
        id="tspan363"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="128.21327"
        y="174.92671">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="125.13828"
      y="174.92671"
      id="text364"
      label="text7"><tspan
        role="line"
        id="tspan364"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="125.13828"
        y="174.92671">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.96334"
      y="174.92671"
      id="text365"
      label="text8"><tspan
        role="line"
        id="tspan365"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.96334"
        y="174.92671">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.78835"
      y="174.92671"
      id="text366"
      label="text9"><tspan
        role="line"
        id="tspan366"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.78835"
        y="174.92671">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="115.31333"
      y="174.92671"
      id="text367"
      label="text10"><tspan
        role="line"
        id="tspan367"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="115.31333"
        y="174.92671">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="112.26734"
      y="174.92671"
      id="text368"
      label="text11"><tspan
        role="line"
        id="tspan368"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="112.26734"
        y="174.92671">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.19238"
      y="174.92671"
      id="text369"
      label="text12"><tspan
        role="line"
        id="tspan369"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.19238"
        y="174.92671">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.21733"
      y="174.92671"
      id="text370"
      label="text13"><tspan
        role="line"
        id="tspan370"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.21733"
        y="174.92671">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.04228"
      y="174.92671"
      id="text371"
      label="text14"><tspan
        role="line"
        id="tspan371"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.04228"
        y="174.92671">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.996284"
      y="174.92671"
      id="text372"
      label="text15"><tspan
        role="line"
        id="tspan372"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.996284"
        y="174.92671">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.92131"
      y="174.92671"
      id="text373"
      label="text16"><tspan
        role="line"
        id="tspan373"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.92131"
        y="174.92671">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="93.875298"
      y="174.92671"
      id="text374"
      label="text17"><tspan
        role="line"
        id="tspan374"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="93.875298"
        y="174.92671">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="90.800301"
      y="174.92671"
      id="text375"
      label="text18"><tspan
        role="line"
        id="tspan375"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="90.800301"
        y="174.92671">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.625298"
      y="174.92671"
      id="text376"
      label="text19"><tspan
        role="line"
        id="tspan376"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.625298"
        y="174.92671">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="84.779221"
      y="174.92671"
      id="text377"
      label="text20"><tspan
        role="line"
        id="tspan377"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="84.779221"
        y="174.92671">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.804214"
      y="174.92671"
      id="text378"
      label="text21"><tspan
        role="line"
        id="tspan378"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.804214"
        y="174.92671">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.629211"
      y="174.92671"
      id="text379"
      label="text22"><tspan
        role="line"
        id="tspan379"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.629211"
        y="174.92671">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="75.454208"
      y="174.92671"
      id="text380"
      label="text23"><tspan
        role="line"
        id="tspan380"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="75.454208"
        y="174.92671">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="72.179222"
      y="174.92671"
      id="text381"
      label="text24"><tspan
        role="line"
        id="tspan381"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="72.179222"
        y="174.92671">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="69.104202"
      y="174.92671"
      id="text382"
      label="text25"><tspan
        role="line"
        id="tspan382"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="69.104202"
        y="174.92671">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="65.929245"
      y="174.92671"
      id="text383"
      label="text26"><tspan
        role="line"
        id="tspan383"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="65.929245"
        y="174.92671">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="62.854248"
      y="174.92671"
      id="text384"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="62.854248"
        y="174.92671"
        id="tspan384">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="59.679249"
      y="174.92671"
      id="text385"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="59.679249"
        y="174.92671"
        id="tspan385">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="56.504246"
      y="174.92671"
      id="text386"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="56.504246"
        y="174.92671"
        id="tspan386">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="142.35838"
      y="171.12282"
      id="text446"
      label="text1"><tspan
        role="line"
        id="tspan446"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="142.35838"
        y="171.12282">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="139.01331"
      y="171.12282"
      id="text447"
      label="text2"><tspan
        role="line"
        id="tspan447"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="139.01331"
        y="171.12282">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.8383"
      y="171.12282"
      id="text448"
      label="text3"><tspan
        role="line"
        id="tspan448"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.8383"
        y="171.12282">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.8633"
      y="171.12282"
      id="text449"
      label="text4"><tspan
        role="line"
        id="tspan449"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.8633"
        y="171.12282">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.68826"
      y="171.12282"
      id="text450"
      label="text5"><tspan
        role="line"
        id="tspan450"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.68826"
        y="171.12282">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.61327"
      y="171.12282"
      id="text451"
      label="text6"><tspan
        role="line"
        id="tspan451"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.61327"
        y="171.12282">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.53828"
      y="171.12282"
      id="text452"
      label="text7"><tspan
        role="line"
        id="tspan452"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.53828"
        y="171.12282">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="120.36335"
      y="171.12282"
      id="text453"
      label="text8"><tspan
        role="line"
        id="tspan453"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="120.36335"
        y="171.12282">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.18837"
      y="171.12282"
      id="text454"
      label="text9"><tspan
        role="line"
        id="tspan454"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.18837"
        y="171.12282">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.71333"
      y="171.12282"
      id="text455"
      label="text10"><tspan
        role="line"
        id="tspan455"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.71333"
        y="171.12282">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.66734"
      y="171.12282"
      id="text456"
      label="text11"><tspan
        role="line"
        id="tspan456"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.66734"
        y="171.12282">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.59235"
      y="171.12282"
      id="text457"
      label="text12"><tspan
        role="line"
        id="tspan457"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.59235"
        y="171.12282">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.61736"
      y="171.12282"
      id="text458"
      label="text13"><tspan
        role="line"
        id="tspan458"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.61736"
        y="171.12282">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.44234"
      y="171.12282"
      id="text459"
      label="text14"><tspan
        role="line"
        id="tspan459"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.44234"
        y="171.12282">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.396339"
      y="171.12282"
      id="text460"
      label="text15"><tspan
        role="line"
        id="tspan460"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.396339"
        y="171.12282">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.321335"
      y="171.12282"
      id="text461"
      label="text16"><tspan
        role="line"
        id="tspan461"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.321335"
        y="171.12282">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.27533"
      y="171.12282"
      id="text462"
      label="text17"><tspan
        role="line"
        id="tspan462"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.27533"
        y="171.12282">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.200333"
      y="171.12282"
      id="text463"
      label="text18"><tspan
        role="line"
        id="tspan463"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.200333"
        y="171.12282">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.02533"
      y="171.12282"
      id="text464"
      label="text19"><tspan
        role="line"
        id="tspan464"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.02533"
        y="171.12282">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.179253"
      y="171.12282"
      id="text465"
      label="text20"><tspan
        role="line"
        id="tspan465"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.179253"
        y="171.12282">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.204247"
      y="171.12282"
      id="text466"
      label="text21"><tspan
        role="line"
        id="tspan466"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.204247"
        y="171.12282">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="77.029243"
      y="171.12282"
      id="text467"
      label="text22"><tspan
        role="line"
        id="tspan467"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="77.029243"
        y="171.12282">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.85424"
      y="171.12282"
      id="text468"
      label="text23"><tspan
        role="line"
        id="tspan468"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.85424"
        y="171.12282">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.579254"
      y="171.12282"
      id="text469"
      label="text24"><tspan
        role="line"
        id="tspan469"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.579254"
        y="171.12282">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.504234"
      y="171.12282"
      id="text470"
      label="text25"><tspan
        role="line"
        id="tspan470"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.504234"
        y="171.12282">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="64.329254"
      y="171.12282"
      id="text471"
      label="text26"><tspan
        role="line"
        id="tspan471"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="64.329254"
        y="171.12282">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.25425"
      y="171.12282"
      id="text472"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.25425"
        y="171.12282"
        id="tspan472">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.977253"
      y="171.12245"
      id="text473"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.977253"
        y="171.12245"
        id="tspan473">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.95844"
      y="167.41872"
      id="text474"
      label="text1"><tspan
        role="line"
        id="tspan474"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.95844"
        y="167.41872">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.61336"
      y="167.41872"
      id="text475"
      label="text2"><tspan
        role="line"
        id="tspan475"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.61336"
        y="167.41872">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="137.43835"
      y="167.41872"
      id="text476"
      label="text3"><tspan
        role="line"
        id="tspan476"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="137.43835"
        y="167.41872">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="134.46335"
      y="167.41872"
      id="text477"
      label="text4"><tspan
        role="line"
        id="tspan477"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="134.46335"
        y="167.41872">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="131.2883"
      y="167.41872"
      id="text478"
      label="text5"><tspan
        role="line"
        id="tspan478"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="131.2883"
        y="167.41872">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="128.21327"
      y="167.41872"
      id="text479"
      label="text6"><tspan
        role="line"
        id="tspan479"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="128.21327"
        y="167.41872">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="125.13828"
      y="167.41872"
      id="text480"
      label="text7"><tspan
        role="line"
        id="tspan480"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="125.13828"
        y="167.41872">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.96334"
      y="167.41872"
      id="text481"
      label="text8"><tspan
        role="line"
        id="tspan481"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.96334"
        y="167.41872">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.78835"
      y="167.41872"
      id="text482"
      label="text9"><tspan
        role="line"
        id="tspan482"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.78835"
        y="167.41872">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="115.31333"
      y="167.41872"
      id="text483"
      label="text10"><tspan
        role="line"
        id="tspan483"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="115.31333"
        y="167.41872">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="112.26734"
      y="167.41872"
      id="text484"
      label="text11"><tspan
        role="line"
        id="tspan484"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="112.26734"
        y="167.41872">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.19238"
      y="167.41872"
      id="text485"
      label="text12"><tspan
        role="line"
        id="tspan485"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.19238"
        y="167.41872">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.21733"
      y="167.41872"
      id="text486"
      label="text13"><tspan
        role="line"
        id="tspan486"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.21733"
        y="167.41872">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.04228"
      y="167.41872"
      id="text487"
      label="text14"><tspan
        role="line"
        id="tspan487"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.04228"
        y="167.41872">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.996284"
      y="167.41872"
      id="text488"
      label="text15"><tspan
        role="line"
        id="tspan488"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.996284"
        y="167.41872">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.92131"
      y="167.41872"
      id="text489"
      label="text16"><tspan
        role="line"
        id="tspan489"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.92131"
        y="167.41872">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="93.875298"
      y="167.41872"
      id="text490"
      label="text17"><tspan
        role="line"
        id="tspan490"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="93.875298"
        y="167.41872">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="90.800301"
      y="167.41872"
      id="text491"
      label="text18"><tspan
        role="line"
        id="tspan491"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="90.800301"
        y="167.41872">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.625298"
      y="167.41872"
      id="text492"
      label="text19"><tspan
        role="line"
        id="tspan492"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.625298"
        y="167.41872">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="84.779221"
      y="167.41872"
      id="text493"
      label="text20"><tspan
        role="line"
        id="tspan493"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="84.779221"
        y="167.41872">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.804214"
      y="167.41872"
      id="text494"
      label="text21"><tspan
        role="line"
        id="tspan494"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.804214"
        y="167.41872">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.629211"
      y="167.41872"
      id="text495"
      label="text22"><tspan
        role="line"
        id="tspan495"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.629211"
        y="167.41872">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="75.454208"
      y="167.41872"
      id="text496"
      label="text23"><tspan
        role="line"
        id="tspan496"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="75.454208"
        y="167.41872">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="72.179222"
      y="167.41872"
      id="text497"
      label="text24"><tspan
        role="line"
        id="tspan497"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="72.179222"
        y="167.41872">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="69.104202"
      y="167.41872"
      id="text498"
      label="text25"><tspan
        role="line"
        id="tspan498"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="69.104202"
        y="167.41872">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="65.929245"
      y="167.41872"
      id="text499"
      label="text26"><tspan
        role="line"
        id="tspan499"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="65.929245"
        y="167.41872">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="62.854248"
      y="167.41872"
      id="text500"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="62.854248"
        y="167.41872"
        id="tspan500">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="59.679249"
      y="167.41872"
      id="text501"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="59.679249"
        y="167.41872"
        id="tspan501">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="56.504246"
      y="167.41872"
      id="text502"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="56.504246"
        y="167.41872"
        id="tspan502">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="142.35838"
      y="163.81435"
      id="text613"
      label="text1"><tspan
        role="line"
        id="tspan613"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="142.35838"
        y="163.81435">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="139.01331"
      y="163.81435"
      id="text614"
      label="text2"><tspan
        role="line"
        id="tspan614"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="139.01331"
        y="163.81435">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.8383"
      y="163.81435"
      id="text615"
      label="text3"><tspan
        role="line"
        id="tspan615"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.8383"
        y="163.81435">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.8633"
      y="163.81435"
      id="text616"
      label="text4"><tspan
        role="line"
        id="tspan616"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.8633"
        y="163.81435">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.68826"
      y="163.81435"
      id="text617"
      label="text5"><tspan
        role="line"
        id="tspan617"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.68826"
        y="163.81435">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.61327"
      y="163.81435"
      id="text618"
      label="text6"><tspan
        role="line"
        id="tspan618"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.61327"
        y="163.81435">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.53828"
      y="163.81435"
      id="text619"
      label="text7"><tspan
        role="line"
        id="tspan619"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.53828"
        y="163.81435">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="120.36335"
      y="163.81435"
      id="text620"
      label="text8"><tspan
        role="line"
        id="tspan620"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="120.36335"
        y="163.81435">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.18837"
      y="163.81435"
      id="text621"
      label="text9"><tspan
        role="line"
        id="tspan621"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.18837"
        y="163.81435">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.71333"
      y="163.81435"
      id="text622"
      label="text10"><tspan
        role="line"
        id="tspan622"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.71333"
        y="163.81435">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.66734"
      y="163.81435"
      id="text623"
      label="text11"><tspan
        role="line"
        id="tspan623"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.66734"
        y="163.81435">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.59235"
      y="163.81435"
      id="text624"
      label="text12"><tspan
        role="line"
        id="tspan624"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.59235"
        y="163.81435">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.61736"
      y="163.81435"
      id="text625"
      label="text13"><tspan
        role="line"
        id="tspan625"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.61736"
        y="163.81435">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.44234"
      y="163.81435"
      id="text626"
      label="text14"><tspan
        role="line"
        id="tspan626"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.44234"
        y="163.81435">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.396339"
      y="163.81435"
      id="text627"
      label="text15"><tspan
        role="line"
        id="tspan627"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.396339"
        y="163.81435">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.321335"
      y="163.81435"
      id="text628"
      label="text16"><tspan
        role="line"
        id="tspan628"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.321335"
        y="163.81435">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.27533"
      y="163.81435"
      id="text629"
      label="text17"><tspan
        role="line"
        id="tspan629"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.27533"
        y="163.81435">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.200333"
      y="163.81435"
      id="text630"
      label="text18"><tspan
        role="line"
        id="tspan630"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.200333"
        y="163.81435">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.02533"
      y="163.81435"
      id="text631"
      label="text19"><tspan
        role="line"
        id="tspan631"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.02533"
        y="163.81435">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.179253"
      y="163.81435"
      id="text632"
      label="text20"><tspan
        role="line"
        id="tspan632"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.179253"
        y="163.81435">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.204247"
      y="163.81435"
      id="text633"
      label="text21"><tspan
        role="line"
        id="tspan633"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.204247"
        y="163.81435">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="77.029243"
      y="163.81435"
      id="text634"
      label="text22"><tspan
        role="line"
        id="tspan634"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="77.029243"
        y="163.81435">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.85424"
      y="163.81435"
      id="text635"
      label="text23"><tspan
        role="line"
        id="tspan635"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.85424"
        y="163.81435">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.579254"
      y="163.81435"
      id="text636"
      label="text24"><tspan
        role="line"
        id="tspan636"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.579254"
        y="163.81435">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.504234"
      y="163.81435"
      id="text637"
      label="text25"><tspan
        role="line"
        id="tspan637"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.504234"
        y="163.81435">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="64.329254"
      y="163.81435"
      id="text638"
      label="text26"><tspan
        role="line"
        id="tspan638"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="64.329254"
        y="163.81435">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.25425"
      y="163.81435"
      id="text639"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.25425"
        y="163.81435"
        id="tspan639">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.977253"
      y="163.81398"
      id="text640"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.977253"
        y="163.81398"
        id="tspan640">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.95844"
      y="160.11024"
      id="text641"
      label="text1"><tspan
        role="line"
        id="tspan641"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.95844"
        y="160.11024">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.61336"
      y="160.11024"
      id="text642"
      label="text2"><tspan
        role="line"
        id="tspan642"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.61336"
        y="160.11024">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="137.43835"
      y="160.11024"
      id="text643"
      label="text3"><tspan
        role="line"
        id="tspan643"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="137.43835"
        y="160.11024">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="134.46335"
      y="160.11024"
      id="text644"
      label="text4"><tspan
        role="line"
        id="tspan644"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="134.46335"
        y="160.11024">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="131.2883"
      y="160.11024"
      id="text645"
      label="text5"><tspan
        role="line"
        id="tspan645"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="131.2883"
        y="160.11024">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="128.21327"
      y="160.11024"
      id="text646"
      label="text6"><tspan
        role="line"
        id="tspan646"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="128.21327"
        y="160.11024">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="125.13828"
      y="160.11024"
      id="text647"
      label="text7"><tspan
        role="line"
        id="tspan647"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="125.13828"
        y="160.11024">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.96334"
      y="160.11024"
      id="text648"
      label="text8"><tspan
        role="line"
        id="tspan648"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.96334"
        y="160.11024">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.78835"
      y="160.11024"
      id="text649"
      label="text9"><tspan
        role="line"
        id="tspan649"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.78835"
        y="160.11024">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="115.31333"
      y="160.11024"
      id="text650"
      label="text10"><tspan
        role="line"
        id="tspan650"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="115.31333"
        y="160.11024">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="112.26734"
      y="160.11024"
      id="text651"
      label="text11"><tspan
        role="line"
        id="tspan651"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="112.26734"
        y="160.11024">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.19238"
      y="160.11024"
      id="text652"
      label="text12"><tspan
        role="line"
        id="tspan652"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.19238"
        y="160.11024">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.21733"
      y="160.11024"
      id="text653"
      label="text13"><tspan
        role="line"
        id="tspan653"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.21733"
        y="160.11024">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.04228"
      y="160.11024"
      id="text654"
      label="text14"><tspan
        role="line"
        id="tspan654"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.04228"
        y="160.11024">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.996284"
      y="160.11024"
      id="text655"
      label="text15"><tspan
        role="line"
        id="tspan655"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.996284"
        y="160.11024">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.92131"
      y="160.11024"
      id="text656"
      label="text16"><tspan
        role="line"
        id="tspan656"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.92131"
        y="160.11024">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="93.875298"
      y="160.11024"
      id="text657"
      label="text17"><tspan
        role="line"
        id="tspan657"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="93.875298"
        y="160.11024">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="90.800301"
      y="160.11024"
      id="text658"
      label="text18"><tspan
        role="line"
        id="tspan658"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="90.800301"
        y="160.11024">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.625298"
      y="160.11024"
      id="text659"
      label="text19"><tspan
        role="line"
        id="tspan659"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.625298"
        y="160.11024">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="84.779221"
      y="160.11024"
      id="text660"
      label="text20"><tspan
        role="line"
        id="tspan660"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="84.779221"
        y="160.11024">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.804214"
      y="160.11024"
      id="text661"
      label="text21"><tspan
        role="line"
        id="tspan661"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.804214"
        y="160.11024">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.629211"
      y="160.11024"
      id="text662"
      label="text22"><tspan
        role="line"
        id="tspan662"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.629211"
        y="160.11024">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="75.454208"
      y="160.11024"
      id="text663"
      label="text23"><tspan
        role="line"
        id="tspan663"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="75.454208"
        y="160.11024">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="72.179222"
      y="160.11024"
      id="text664"
      label="text24"><tspan
        role="line"
        id="tspan664"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="72.179222"
        y="160.11024">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="69.104202"
      y="160.11024"
      id="text665"
      label="text25"><tspan
        role="line"
        id="tspan665"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="69.104202"
        y="160.11024">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="65.929245"
      y="160.11024"
      id="text666"
      label="text26"><tspan
        role="line"
        id="tspan666"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="65.929245"
        y="160.11024">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="62.854248"
      y="160.11024"
      id="text667"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="62.854248"
        y="160.11024"
        id="tspan667">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="59.679249"
      y="160.11024"
      id="text668"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="59.679249"
        y="160.11024"
        id="tspan668">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="56.504246"
      y="160.11024"
      id="text669"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="56.504246"
        y="160.11024"
        id="tspan669">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="142.35838"
      y="156.30635"
      id="text670"
      label="text1"><tspan
        role="line"
        id="tspan670"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="142.35838"
        y="156.30635">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="139.01331"
      y="156.30635"
      id="text671"
      label="text2"><tspan
        role="line"
        id="tspan671"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="139.01331"
        y="156.30635">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.8383"
      y="156.30635"
      id="text672"
      label="text3"><tspan
        role="line"
        id="tspan672"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.8383"
        y="156.30635">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.8633"
      y="156.30635"
      id="text673"
      label="text4"><tspan
        role="line"
        id="tspan673"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.8633"
        y="156.30635">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.68826"
      y="156.30635"
      id="text674"
      label="text5"><tspan
        role="line"
        id="tspan674"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.68826"
        y="156.30635">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.61327"
      y="156.30635"
      id="text675"
      label="text6"><tspan
        role="line"
        id="tspan675"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.61327"
        y="156.30635">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.53828"
      y="156.30635"
      id="text676"
      label="text7"><tspan
        role="line"
        id="tspan676"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.53828"
        y="156.30635">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="120.36335"
      y="156.30635"
      id="text677"
      label="text8"><tspan
        role="line"
        id="tspan677"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="120.36335"
        y="156.30635">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.18837"
      y="156.30635"
      id="text678"
      label="text9"><tspan
        role="line"
        id="tspan678"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.18837"
        y="156.30635">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.71333"
      y="156.30635"
      id="text679"
      label="text10"><tspan
        role="line"
        id="tspan679"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.71333"
        y="156.30635">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.66734"
      y="156.30635"
      id="text680"
      label="text11"><tspan
        role="line"
        id="tspan680"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.66734"
        y="156.30635">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.59235"
      y="156.30635"
      id="text681"
      label="text12"><tspan
        role="line"
        id="tspan681"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.59235"
        y="156.30635">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.61736"
      y="156.30635"
      id="text682"
      label="text13"><tspan
        role="line"
        id="tspan682"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.61736"
        y="156.30635">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.44234"
      y="156.30635"
      id="text683"
      label="text14"><tspan
        role="line"
        id="tspan683"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.44234"
        y="156.30635">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.396339"
      y="156.30635"
      id="text684"
      label="text15"><tspan
        role="line"
        id="tspan684"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.396339"
        y="156.30635">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.321335"
      y="156.30635"
      id="text685"
      label="text16"><tspan
        role="line"
        id="tspan685"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.321335"
        y="156.30635">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.27533"
      y="156.30635"
      id="text686"
      label="text17"><tspan
        role="line"
        id="tspan686"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.27533"
        y="156.30635">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.200333"
      y="156.30635"
      id="text687"
      label="text18"><tspan
        role="line"
        id="tspan687"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.200333"
        y="156.30635">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.02533"
      y="156.30635"
      id="text688"
      label="text19"><tspan
        role="line"
        id="tspan688"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.02533"
        y="156.30635">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.179253"
      y="156.30635"
      id="text689"
      label="text20"><tspan
        role="line"
        id="tspan689"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.179253"
        y="156.30635">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.204247"
      y="156.30635"
      id="text690"
      label="text21"><tspan
        role="line"
        id="tspan690"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.204247"
        y="156.30635">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="77.029243"
      y="156.30635"
      id="text691"
      label="text22"><tspan
        role="line"
        id="tspan691"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="77.029243"
        y="156.30635">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.85424"
      y="156.30635"
      id="text692"
      label="text23"><tspan
        role="line"
        id="tspan692"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.85424"
        y="156.30635">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.579254"
      y="156.30635"
      id="text693"
      label="text24"><tspan
        role="line"
        id="tspan693"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.579254"
        y="156.30635">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.504234"
      y="156.30635"
      id="text694"
      label="text25"><tspan
        role="line"
        id="tspan694"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.504234"
        y="156.30635">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="64.329254"
      y="156.30635"
      id="text695"
      label="text26"><tspan
        role="line"
        id="tspan695"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="64.329254"
        y="156.30635">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.25425"
      y="156.30635"
      id="text696"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.25425"
        y="156.30635"
        id="tspan696">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.977253"
      y="156.30598"
      id="text697"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.977253"
        y="156.30598"
        id="tspan697">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.95844"
      y="152.60225"
      id="text698"
      label="text1"><tspan
        role="line"
        id="tspan698"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.95844"
        y="152.60225">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.61336"
      y="152.60225"
      id="text699"
      label="text2"><tspan
        role="line"
        id="tspan699"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.61336"
        y="152.60225">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="137.43835"
      y="152.60225"
      id="text700"
      label="text3"><tspan
        role="line"
        id="tspan700"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="137.43835"
        y="152.60225">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="134.46335"
      y="152.60225"
      id="text701"
      label="text4"><tspan
        role="line"
        id="tspan701"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="134.46335"
        y="152.60225">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="131.2883"
      y="152.60225"
      id="text702"
      label="text5"><tspan
        role="line"
        id="tspan702"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="131.2883"
        y="152.60225">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="128.21327"
      y="152.60225"
      id="text703"
      label="text6"><tspan
        role="line"
        id="tspan703"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="128.21327"
        y="152.60225">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="125.13828"
      y="152.60225"
      id="text704"
      label="text7"><tspan
        role="line"
        id="tspan704"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="125.13828"
        y="152.60225">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.96334"
      y="152.60225"
      id="text705"
      label="text8"><tspan
        role="line"
        id="tspan705"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.96334"
        y="152.60225">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.78835"
      y="152.60225"
      id="text706"
      label="text9"><tspan
        role="line"
        id="tspan706"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.78835"
        y="152.60225">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="115.31333"
      y="152.60225"
      id="text707"
      label="text10"><tspan
        role="line"
        id="tspan707"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="115.31333"
        y="152.60225">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="112.26734"
      y="152.60225"
      id="text708"
      label="text11"><tspan
        role="line"
        id="tspan708"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="112.26734"
        y="152.60225">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.19238"
      y="152.60225"
      id="text709"
      label="text12"><tspan
        role="line"
        id="tspan709"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.19238"
        y="152.60225">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.21733"
      y="152.60225"
      id="text710"
      label="text13"><tspan
        role="line"
        id="tspan710"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.21733"
        y="152.60225">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.04228"
      y="152.60225"
      id="text711"
      label="text14"><tspan
        role="line"
        id="tspan711"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.04228"
        y="152.60225">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.996284"
      y="152.60225"
      id="text712"
      label="text15"><tspan
        role="line"
        id="tspan712"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.996284"
        y="152.60225">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.92131"
      y="152.60225"
      id="text713"
      label="text16"><tspan
        role="line"
        id="tspan713"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.92131"
        y="152.60225">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="93.875298"
      y="152.60225"
      id="text714"
      label="text17"><tspan
        role="line"
        id="tspan714"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="93.875298"
        y="152.60225">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="90.800301"
      y="152.60225"
      id="text715"
      label="text18"><tspan
        role="line"
        id="tspan715"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="90.800301"
        y="152.60225">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.625298"
      y="152.60225"
      id="text716"
      label="text19"><tspan
        role="line"
        id="tspan716"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.625298"
        y="152.60225">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="84.779221"
      y="152.60225"
      id="text717"
      label="text20"><tspan
        role="line"
        id="tspan717"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="84.779221"
        y="152.60225">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.804214"
      y="152.60225"
      id="text718"
      label="text21"><tspan
        role="line"
        id="tspan718"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.804214"
        y="152.60225">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.629211"
      y="152.60225"
      id="text719"
      label="text22"><tspan
        role="line"
        id="tspan719"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.629211"
        y="152.60225">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="75.454208"
      y="152.60225"
      id="text720"
      label="text23"><tspan
        role="line"
        id="tspan720"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="75.454208"
        y="152.60225">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="72.179222"
      y="152.60225"
      id="text721"
      label="text24"><tspan
        role="line"
        id="tspan721"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="72.179222"
        y="152.60225">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="69.104202"
      y="152.60225"
      id="text722"
      label="text25"><tspan
        role="line"
        id="tspan722"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="69.104202"
        y="152.60225">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="65.929245"
      y="152.60225"
      id="text723"
      label="text26"><tspan
        role="line"
        id="tspan723"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="65.929245"
        y="152.60225">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="62.854248"
      y="152.60225"
      id="text724"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="62.854248"
        y="152.60225"
        id="tspan724">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="59.679249"
      y="152.60225"
      id="text725"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="59.679249"
        y="152.60225"
        id="tspan725">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="56.504246"
      y="152.60225"
      id="text726"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="56.504246"
        y="152.60225"
        id="tspan726">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="142.35838"
      y="148.89812"
      id="text781"
      label="text1"><tspan
        role="line"
        id="tspan781"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="142.35838"
        y="148.89812">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="139.01331"
      y="148.89812"
      id="text782"
      label="text2"><tspan
        role="line"
        id="tspan782"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="139.01331"
        y="148.89812">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.8383"
      y="148.89812"
      id="text783"
      label="text3"><tspan
        role="line"
        id="tspan783"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.8383"
        y="148.89812">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.8633"
      y="148.89812"
      id="text784"
      label="text4"><tspan
        role="line"
        id="tspan784"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.8633"
        y="148.89812">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.68826"
      y="148.89812"
      id="text785"
      label="text5"><tspan
        role="line"
        id="tspan785"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.68826"
        y="148.89812">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.61327"
      y="148.89812"
      id="text786"
      label="text6"><tspan
        role="line"
        id="tspan786"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.61327"
        y="148.89812">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.53828"
      y="148.89812"
      id="text787"
      label="text7"><tspan
        role="line"
        id="tspan787"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.53828"
        y="148.89812">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="120.36335"
      y="148.89812"
      id="text788"
      label="text8"><tspan
        role="line"
        id="tspan788"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="120.36335"
        y="148.89812">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.18837"
      y="148.89812"
      id="text789"
      label="text9"><tspan
        role="line"
        id="tspan789"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.18837"
        y="148.89812">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.71333"
      y="148.89812"
      id="text790"
      label="text10"><tspan
        role="line"
        id="tspan790"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.71333"
        y="148.89812">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.66734"
      y="148.89812"
      id="text791"
      label="text11"><tspan
        role="line"
        id="tspan791"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.66734"
        y="148.89812">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.59235"
      y="148.89812"
      id="text792"
      label="text12"><tspan
        role="line"
        id="tspan792"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.59235"
        y="148.89812">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.61736"
      y="148.89812"
      id="text793"
      label="text13"><tspan
        role="line"
        id="tspan793"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.61736"
        y="148.89812">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.44234"
      y="148.89812"
      id="text794"
      label="text14"><tspan
        role="line"
        id="tspan794"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.44234"
        y="148.89812">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.396339"
      y="148.89812"
      id="text795"
      label="text15"><tspan
        role="line"
        id="tspan795"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.396339"
        y="148.89812">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.321335"
      y="148.89812"
      id="text796"
      label="text16"><tspan
        role="line"
        id="tspan796"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.321335"
        y="148.89812">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.27533"
      y="148.89812"
      id="text797"
      label="text17"><tspan
        role="line"
        id="tspan797"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.27533"
        y="148.89812">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.200333"
      y="148.89812"
      id="text798"
      label="text18"><tspan
        role="line"
        id="tspan798"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.200333"
        y="148.89812">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.02533"
      y="148.89812"
      id="text799"
      label="text19"><tspan
        role="line"
        id="tspan799"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.02533"
        y="148.89812">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.179253"
      y="148.89812"
      id="text800"
      label="text20"><tspan
        role="line"
        id="tspan800"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.179253"
        y="148.89812">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.204247"
      y="148.89812"
      id="text801"
      label="text21"><tspan
        role="line"
        id="tspan801"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.204247"
        y="148.89812">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="77.029243"
      y="148.89812"
      id="text802"
      label="text22"><tspan
        role="line"
        id="tspan802"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="77.029243"
        y="148.89812">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.85424"
      y="148.89812"
      id="text803"
      label="text23"><tspan
        role="line"
        id="tspan803"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.85424"
        y="148.89812">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.579254"
      y="148.89812"
      id="text804"
      label="text24"><tspan
        role="line"
        id="tspan804"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.579254"
        y="148.89812">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.504234"
      y="148.89812"
      id="text805"
      label="text25"><tspan
        role="line"
        id="tspan805"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.504234"
        y="148.89812">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="64.329254"
      y="148.89812"
      id="text806"
      label="text26"><tspan
        role="line"
        id="tspan806"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="64.329254"
        y="148.89812">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.25425"
      y="148.89812"
      id="text807"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.25425"
        y="148.89812"
        id="tspan807">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.977253"
      y="148.89775"
      id="text808"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.977253"
        y="148.89775"
        id="tspan808">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.95844"
      y="145.19402"
      id="text809"
      label="text1"><tspan
        role="line"
        id="tspan809"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.95844"
        y="145.19402">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.61336"
      y="145.19402"
      id="text810"
      label="text2"><tspan
        role="line"
        id="tspan810"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.61336"
        y="145.19402">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="137.43835"
      y="145.19402"
      id="text811"
      label="text3"><tspan
        role="line"
        id="tspan811"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="137.43835"
        y="145.19402">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="134.46335"
      y="145.19402"
      id="text812"
      label="text4"><tspan
        role="line"
        id="tspan812"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="134.46335"
        y="145.19402">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="131.2883"
      y="145.19402"
      id="text813"
      label="text5"><tspan
        role="line"
        id="tspan813"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="131.2883"
        y="145.19402">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="128.21327"
      y="145.19402"
      id="text814"
      label="text6"><tspan
        role="line"
        id="tspan814"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="128.21327"
        y="145.19402">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="125.13828"
      y="145.19402"
      id="text815"
      label="text7"><tspan
        role="line"
        id="tspan815"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="125.13828"
        y="145.19402">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.96334"
      y="145.19402"
      id="text816"
      label="text8"><tspan
        role="line"
        id="tspan816"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.96334"
        y="145.19402">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.78835"
      y="145.19402"
      id="text817"
      label="text9"><tspan
        role="line"
        id="tspan817"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.78835"
        y="145.19402">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="115.31333"
      y="145.19402"
      id="text818"
      label="text10"><tspan
        role="line"
        id="tspan818"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="115.31333"
        y="145.19402">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="112.26734"
      y="145.19402"
      id="text819"
      label="text11"><tspan
        role="line"
        id="tspan819"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="112.26734"
        y="145.19402">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.19238"
      y="145.19402"
      id="text820"
      label="text12"><tspan
        role="line"
        id="tspan820"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.19238"
        y="145.19402">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.21733"
      y="145.19402"
      id="text821"
      label="text13"><tspan
        role="line"
        id="tspan821"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.21733"
        y="145.19402">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.04228"
      y="145.19402"
      id="text822"
      label="text14"><tspan
        role="line"
        id="tspan822"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.04228"
        y="145.19402">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.996284"
      y="145.19402"
      id="text823"
      label="text15"><tspan
        role="line"
        id="tspan823"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.996284"
        y="145.19402">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.92131"
      y="145.19402"
      id="text824"
      label="text16"><tspan
        role="line"
        id="tspan824"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.92131"
        y="145.19402">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="93.875298"
      y="145.19402"
      id="text825"
      label="text17"><tspan
        role="line"
        id="tspan825"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="93.875298"
        y="145.19402">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="90.800301"
      y="145.19402"
      id="text826"
      label="text18"><tspan
        role="line"
        id="tspan826"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="90.800301"
        y="145.19402">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.625298"
      y="145.19402"
      id="text827"
      label="text19"><tspan
        role="line"
        id="tspan827"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.625298"
        y="145.19402">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="84.779221"
      y="145.19402"
      id="text828"
      label="text20"><tspan
        role="line"
        id="tspan828"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="84.779221"
        y="145.19402">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.804214"
      y="145.19402"
      id="text829"
      label="text21"><tspan
        role="line"
        id="tspan829"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.804214"
        y="145.19402">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.629211"
      y="145.19402"
      id="text830"
      label="text22"><tspan
        role="line"
        id="tspan830"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.629211"
        y="145.19402">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="75.454208"
      y="145.19402"
      id="text831"
      label="text23"><tspan
        role="line"
        id="tspan831"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="75.454208"
        y="145.19402">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="72.179222"
      y="145.19402"
      id="text832"
      label="text24"><tspan
        role="line"
        id="tspan832"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="72.179222"
        y="145.19402">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="69.104202"
      y="145.19402"
      id="text833"
      label="text25"><tspan
        role="line"
        id="tspan833"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="69.104202"
        y="145.19402">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="65.929245"
      y="145.19402"
      id="text834"
      label="text26"><tspan
        role="line"
        id="tspan834"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="65.929245"
        y="145.19402">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="62.854248"
      y="145.19402"
      id="text835"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="62.854248"
        y="145.19402"
        id="tspan835">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="59.679249"
      y="145.19402"
      id="text836"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="59.679249"
        y="145.19402"
        id="tspan836">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="56.504246"
      y="145.19402"
      id="text837"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="56.504246"
        y="145.19402"
        id="tspan837">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.5295"
      y="141.36072"
      id="text861"
      label="text1"><tspan
        role="line"
        id="tspan861"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.5295"
        y="141.36072">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="139.95541"
      y="141.36072"
      id="text862"
      label="text2"><tspan
        role="line"
        id="tspan862"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="139.95541"
        y="141.36072">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="136.25125"
      y="141.36072"
      id="text863"
      label="text3"><tspan
        role="line"
        id="tspan863"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="136.25125"
        y="141.36072">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.74709"
      y="141.36072"
      id="text864"
      label="text4"><tspan
        role="line"
        id="tspan864"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.74709"
        y="141.36072">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.17224"
      y="141.36072"
      id="text865"
      label="text5"><tspan
        role="line"
        id="tspan865"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.17224"
        y="141.36072">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="125.53825"
      y="141.36072"
      id="text866"
      label="text6"><tspan
        role="line"
        id="tspan866"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="125.53825"
        y="141.36072">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.96334"
      y="141.36072"
      id="text867"
      label="text7"><tspan
        role="line"
        id="tspan867"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.96334"
        y="141.36072">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.33036"
      y="141.36072"
      id="text868"
      label="text8"><tspan
        role="line"
        id="tspan868"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.33036"
        y="141.36072">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="114.65536"
      y="141.36072"
      id="text869"
      label="text9"><tspan
        role="line"
        id="tspan869"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="114.65536"
        y="141.36072">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.62187"
      y="141.36072"
      id="text870"
      label="text10"><tspan
        role="line"
        id="tspan870"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.62187"
        y="141.36072">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.04673"
      y="141.36072"
      id="text871"
      label="text11"><tspan
        role="line"
        id="tspan871"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.04673"
        y="141.36072">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.44265"
      y="141.36072"
      id="text872"
      label="text12"><tspan
        role="line"
        id="tspan872"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.44265"
        y="141.36072">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.809349"
      y="141.36072"
      id="text873"
      label="text13"><tspan
        role="line"
        id="tspan873"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.809349"
        y="141.36072">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.234146"
      y="141.36072"
      id="text874"
      label="text14"><tspan
        role="line"
        id="tspan874"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.234146"
        y="141.36072">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.559319"
      y="141.36072"
      id="text875"
      label="text15"><tspan
        role="line"
        id="tspan875"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.559319"
        y="141.36072">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="88.95536"
      y="141.36072"
      id="text876"
      label="text16"><tspan
        role="line"
        id="tspan876"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="88.95536"
        y="141.36072">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="85.379341"
      y="141.36072"
      id="text877"
      label="text17"><tspan
        role="line"
        id="tspan877"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="85.379341"
        y="141.36072">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.875519"
      y="141.36072"
      id="text878"
      label="text18"><tspan
        role="line"
        id="tspan878"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.875519"
        y="141.36072">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.171349"
      y="141.36072"
      id="text879"
      label="text19"><tspan
        role="line"
        id="tspan879"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.171349"
        y="141.36072">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="74.667267"
      y="141.36072"
      id="text880"
      label="text20"><tspan
        role="line"
        id="tspan880"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="74.667267"
        y="141.36072">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.975266"
      y="141.36072"
      id="text881"
      label="text21"><tspan
        role="line"
        id="tspan881"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.975266"
        y="141.36072">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.300255"
      y="141.36072"
      id="text882"
      label="text22"><tspan
        role="line"
        id="tspan882"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.300255"
        y="141.36072">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="63.625259"
      y="141.36072"
      id="text883"
      label="text23"><tspan
        role="line"
        id="tspan883"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="63.625259"
        y="141.36072">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="60.050266"
      y="141.36072"
      id="text884"
      label="text24"><tspan
        role="line"
        id="tspan884"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="60.050266"
        y="141.36072">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="56.47525"
      y="141.36072"
      id="text885"
      label="text25"><tspan
        role="line"
        id="tspan885"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="56.47525"
        y="141.36072">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="152.75838"
      y="128.68971"
      id="text889"
      label="text1"><tspan
        role="line"
        id="tspan889"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="152.75838"
        y="128.68971">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="149.4133"
      y="128.68971"
      id="text890"
      label="text2"><tspan
        role="line"
        id="tspan890"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="149.4133"
        y="128.68971">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="146.2383"
      y="128.68971"
      id="text891"
      label="text3"><tspan
        role="line"
        id="tspan891"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="146.2383"
        y="128.68971">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.26329"
      y="128.68971"
      id="text892"
      label="text4"><tspan
        role="line"
        id="tspan892"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.26329"
        y="128.68971">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.08824"
      y="128.68971"
      id="text893"
      label="text5"><tspan
        role="line"
        id="tspan893"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.08824"
        y="128.68971">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.62531"
      y="128.68971"
      id="text910"
      label="text6"><tspan
        role="line"
        id="tspan910"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.62531"
        y="128.68971">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.55034"
      y="128.68971"
      id="text911"
      label="text7"><tspan
        role="line"
        id="tspan911"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.55034"
        y="128.68971">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="120.37539"
      y="128.68971"
      id="text912"
      label="text8"><tspan
        role="line"
        id="tspan912"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="120.37539"
        y="128.68971">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.20041"
      y="128.68971"
      id="text913"
      label="text9"><tspan
        role="line"
        id="tspan913"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.20041"
        y="128.68971">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.72537"
      y="128.68971"
      id="text914"
      label="text10"><tspan
        role="line"
        id="tspan914"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.72537"
        y="128.68971">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.67938"
      y="128.68971"
      id="text915"
      label="text11"><tspan
        role="line"
        id="tspan915"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.67938"
        y="128.68971">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.60444"
      y="128.68971"
      id="text916"
      label="text12"><tspan
        role="line"
        id="tspan916"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.60444"
        y="128.68971">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.62938"
      y="128.68971"
      id="text917"
      label="text13"><tspan
        role="line"
        id="tspan917"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.62938"
        y="128.68971">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.45432"
      y="128.68971"
      id="text918"
      label="text14"><tspan
        role="line"
        id="tspan918"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.45432"
        y="128.68971">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.408333"
      y="128.68971"
      id="text919"
      label="text15"><tspan
        role="line"
        id="tspan919"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.408333"
        y="128.68971">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.333359"
      y="128.68971"
      id="text920"
      label="text16"><tspan
        role="line"
        id="tspan920"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.333359"
        y="128.68971">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.287346"
      y="128.68971"
      id="text921"
      label="text17"><tspan
        role="line"
        id="tspan921"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.287346"
        y="128.68971">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.212349"
      y="128.68971"
      id="text922"
      label="text18"><tspan
        role="line"
        id="tspan922"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.212349"
        y="128.68971">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.037346"
      y="128.68971"
      id="text923"
      label="text19"><tspan
        role="line"
        id="tspan923"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.037346"
        y="128.68971">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.191269"
      y="128.68971"
      id="text924"
      label="text20"><tspan
        role="line"
        id="tspan924"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.191269"
        y="128.68971">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.216263"
      y="128.68971"
      id="text925"
      label="text21"><tspan
        role="line"
        id="tspan925"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.216263"
        y="128.68971">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="77.04126"
      y="128.68971"
      id="text926"
      label="text22"><tspan
        role="line"
        id="tspan926"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="77.04126"
        y="128.68971">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.866257"
      y="128.68971"
      id="text927"
      label="text23"><tspan
        role="line"
        id="tspan927"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.866257"
        y="128.68971">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.025253"
      y="128.6898"
      id="text931"
      label="text24"><tspan
        role="line"
        id="tspan931"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.025253"
        y="128.6898">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.950233"
      y="128.6898"
      id="text932"
      label="text25"><tspan
        role="line"
        id="tspan932"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.950233"
        y="128.6898">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.775253"
      y="128.6898"
      id="text933"
      label="text26"><tspan
        role="line"
        id="tspan933"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.775253"
        y="128.6898">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="51.700249"
      y="128.6898"
      id="text934"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="51.700249"
        y="128.6898"
        id="tspan934">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="48.423252"
      y="128.68944"
      id="text935"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="48.423252"
        y="128.68944"
        id="tspan935">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="152.75838"
      y="124.98555"
      id="text939"
      label="text1"><tspan
        role="line"
        id="tspan939"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="152.75838"
        y="124.98555">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="149.4133"
      y="124.98555"
      id="text940"
      label="text2"><tspan
        role="line"
        id="tspan940"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="149.4133"
        y="124.98555">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="146.2383"
      y="124.98555"
      id="text941"
      label="text3"><tspan
        role="line"
        id="tspan941"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="146.2383"
        y="124.98555">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.26329"
      y="124.98555"
      id="text942"
      label="text4"><tspan
        role="line"
        id="tspan942"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.26329"
        y="124.98555">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.08824"
      y="124.98555"
      id="text943"
      label="text5"><tspan
        role="line"
        id="tspan943"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.08824"
        y="124.98555">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="125.23833"
      y="124.98569"
      id="text959"
      label="text6"><tspan
        role="line"
        id="tspan959"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="125.23833"
        y="124.98569">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="122.16333"
      y="124.98569"
      id="text960"
      label="text7"><tspan
        role="line"
        id="tspan960"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="122.16333"
        y="124.98569">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.98838"
      y="124.98569"
      id="text961"
      label="text8"><tspan
        role="line"
        id="tspan961"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.98838"
        y="124.98569">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="115.8134"
      y="124.98569"
      id="text962"
      label="text9"><tspan
        role="line"
        id="tspan962"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="115.8134"
        y="124.98569">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="112.3384"
      y="124.98569"
      id="text963"
      label="text10"><tspan
        role="line"
        id="tspan963"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="112.3384"
        y="124.98569">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.29241"
      y="124.98569"
      id="text964"
      label="text11"><tspan
        role="line"
        id="tspan964"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.29241"
        y="124.98569">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.21743"
      y="124.98569"
      id="text965"
      label="text12"><tspan
        role="line"
        id="tspan965"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.21743"
        y="124.98569">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.24237"
      y="124.98569"
      id="text966"
      label="text13"><tspan
        role="line"
        id="tspan966"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.24237"
        y="124.98569">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="100.06734"
      y="124.98569"
      id="text967"
      label="text14"><tspan
        role="line"
        id="tspan967"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="100.06734"
        y="124.98569">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="97.021332"
      y="124.98569"
      id="text968"
      label="text15"><tspan
        role="line"
        id="tspan968"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="97.021332"
        y="124.98569">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="93.946358"
      y="124.98569"
      id="text969"
      label="text16"><tspan
        role="line"
        id="tspan969"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="93.946358"
        y="124.98569">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="90.900345"
      y="124.98569"
      id="text970"
      label="text17"><tspan
        role="line"
        id="tspan970"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="90.900345"
        y="124.98569">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.825348"
      y="124.98569"
      id="text971"
      label="text18"><tspan
        role="line"
        id="tspan971"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.825348"
        y="124.98569">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="84.650345"
      y="124.98569"
      id="text972"
      label="text19"><tspan
        role="line"
        id="tspan972"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="84.650345"
        y="124.98569">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.804268"
      y="124.98569"
      id="text973"
      label="text20"><tspan
        role="line"
        id="tspan973"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.804268"
        y="124.98569">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.829262"
      y="124.98569"
      id="text974"
      label="text21"><tspan
        role="line"
        id="tspan974"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.829262"
        y="124.98569">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="75.654259"
      y="124.98569"
      id="text975"
      label="text22"><tspan
        role="line"
        id="tspan975"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="75.654259"
        y="124.98569">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.125244"
      y="124.98585"
      id="text979"
      label="text23"><tspan
        role="line"
        id="tspan979"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.125244"
        y="124.98585">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.850258"
      y="124.98585"
      id="text980"
      label="text24"><tspan
        role="line"
        id="tspan980"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.850258"
        y="124.98585">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.775238"
      y="124.98585"
      id="text981"
      label="text25"><tspan
        role="line"
        id="tspan981"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.775238"
        y="124.98585">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="51.600258"
      y="124.98585"
      id="text982"
      label="text26"><tspan
        role="line"
        id="tspan982"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="51.600258"
        y="124.98585">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="48.525249"
      y="124.98585"
      id="text983"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="48.525249"
        y="124.98585"
        id="tspan983">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="152.75838"
      y="121.2817"
      id="text987"
      label="text1"><tspan
        role="line"
        id="tspan987"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="152.75838"
        y="121.2817">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="149.4133"
      y="121.2817"
      id="text988"
      label="text2"><tspan
        role="line"
        id="tspan988"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="149.4133"
        y="121.2817">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="146.2383"
      y="121.2817"
      id="text989"
      label="text3"><tspan
        role="line"
        id="tspan989"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="146.2383"
        y="121.2817">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.26329"
      y="121.2817"
      id="text990"
      label="text4"><tspan
        role="line"
        id="tspan990"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.26329"
        y="121.2817">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.08824"
      y="121.2817"
      id="text991"
      label="text5"><tspan
        role="line"
        id="tspan991"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.08824"
        y="121.2817">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.62531"
      y="121.3817"
      id="text1008"
      label="text6"><tspan
        role="line"
        id="tspan1008"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.62531"
        y="121.3817">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.55034"
      y="121.3817"
      id="text1009"
      label="text7"><tspan
        role="line"
        id="tspan1009"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.55034"
        y="121.3817">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="120.37539"
      y="121.3817"
      id="text1010"
      label="text8"><tspan
        role="line"
        id="tspan1010"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="120.37539"
        y="121.3817">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.20041"
      y="121.3817"
      id="text1011"
      label="text9"><tspan
        role="line"
        id="tspan1011"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.20041"
        y="121.3817">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.72536"
      y="121.3817"
      id="text1012"
      label="text10"><tspan
        role="line"
        id="tspan1012"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.72536"
        y="121.3817">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.67937"
      y="121.3817"
      id="text1013"
      label="text11"><tspan
        role="line"
        id="tspan1013"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.67937"
        y="121.3817">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.60444"
      y="121.3817"
      id="text1014"
      label="text12"><tspan
        role="line"
        id="tspan1014"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.60444"
        y="121.3817">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.62938"
      y="121.3817"
      id="text1015"
      label="text13"><tspan
        role="line"
        id="tspan1015"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.62938"
        y="121.3817">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.45432"
      y="121.3817"
      id="text1016"
      label="text14"><tspan
        role="line"
        id="tspan1016"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.45432"
        y="121.3817">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.408333"
      y="121.3817"
      id="text1017"
      label="text15"><tspan
        role="line"
        id="tspan1017"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.408333"
        y="121.3817">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.333359"
      y="121.3817"
      id="text1018"
      label="text16"><tspan
        role="line"
        id="tspan1018"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.333359"
        y="121.3817">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.287346"
      y="121.3817"
      id="text1019"
      label="text17"><tspan
        role="line"
        id="tspan1019"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.287346"
        y="121.3817">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.212349"
      y="121.3817"
      id="text1020"
      label="text18"><tspan
        role="line"
        id="tspan1020"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.212349"
        y="121.3817">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.037346"
      y="121.3817"
      id="text1021"
      label="text19"><tspan
        role="line"
        id="tspan1021"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.037346"
        y="121.3817">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.191269"
      y="121.3817"
      id="text1022"
      label="text20"><tspan
        role="line"
        id="tspan1022"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.191269"
        y="121.3817">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.216263"
      y="121.3817"
      id="text1023"
      label="text21"><tspan
        role="line"
        id="tspan1023"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.216263"
        y="121.3817">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="77.04126"
      y="121.3817"
      id="text1024"
      label="text22"><tspan
        role="line"
        id="tspan1024"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="77.04126"
        y="121.3817">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.866257"
      y="121.3817"
      id="text1025"
      label="text23"><tspan
        role="line"
        id="tspan1025"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.866257"
        y="121.3817">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.154255"
      y="121.28185"
      id="text1029"
      label="text24"><tspan
        role="line"
        id="tspan1029"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.154255"
        y="121.28185">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="58.079235"
      y="121.28185"
      id="text1030"
      label="text25"><tspan
        role="line"
        id="tspan1030"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="58.079235"
        y="121.28185">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.904255"
      y="121.28185"
      id="text1031"
      label="text26"><tspan
        role="line"
        id="tspan1031"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.904255"
        y="121.28185">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="51.82925"
      y="121.28185"
      id="text1032"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="51.82925"
        y="121.28185"
        id="tspan1032">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', display: 'inline', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="48.552254"
      y="121.28148"
      id="text1033"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="48.552254"
        y="121.28148"
        id="tspan1033">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="152.75838"
      y="117.70672"
      id="text1037"
      label="text1"><tspan
        role="line"
        id="tspan1037"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="152.75838"
        y="117.70672">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="149.4133"
      y="117.70672"
      id="text1038"
      label="text2"><tspan
        role="line"
        id="tspan1038"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="149.4133"
        y="117.70672">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="146.2383"
      y="117.70672"
      id="text1039"
      label="text3"><tspan
        role="line"
        id="tspan1039"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="146.2383"
        y="117.70672">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.26329"
      y="117.70672"
      id="text1040"
      label="text4"><tspan
        role="line"
        id="tspan1040"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.26329"
        y="117.70672">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.08824"
      y="117.70672"
      id="text1041"
      label="text5"><tspan
        role="line"
        id="tspan1041"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.08824"
        y="117.70672">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="122.29234"
      y="117.50672"
      id="text1055"
      label="text6"><tspan
        role="line"
        id="tspan1055"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="122.29234"
        y="117.50672">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="119.21735"
      y="117.50672"
      id="text1056"
      label="text7"><tspan
        role="line"
        id="tspan1056"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="119.21735"
        y="117.50672">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="116.0424"
      y="117.50672"
      id="text1057"
      label="text8"><tspan
        role="line"
        id="tspan1057"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="116.0424"
        y="117.50672">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="112.8674"
      y="117.50672"
      id="text1058"
      label="text9"><tspan
        role="line"
        id="tspan1058"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="112.8674"
        y="117.50672">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.39236"
      y="117.50672"
      id="text1059"
      label="text10"><tspan
        role="line"
        id="tspan1059"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.39236"
        y="117.50672">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.34637"
      y="117.50672"
      id="text1060"
      label="text11"><tspan
        role="line"
        id="tspan1060"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.34637"
        y="117.50672">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.27145"
      y="117.50672"
      id="text1061"
      label="text12"><tspan
        role="line"
        id="tspan1061"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.27145"
        y="117.50672">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="100.29639"
      y="117.50672"
      id="text1062"
      label="text13"><tspan
        role="line"
        id="tspan1062"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="100.29639"
        y="117.50672">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="97.12133"
      y="117.50672"
      id="text1063"
      label="text14"><tspan
        role="line"
        id="tspan1063"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="97.12133"
        y="117.50672">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="94.075325"
      y="117.50672"
      id="text1064"
      label="text15"><tspan
        role="line"
        id="tspan1064"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="94.075325"
        y="117.50672">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="91.000351"
      y="117.50672"
      id="text1065"
      label="text16"><tspan
        role="line"
        id="tspan1065"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="91.000351"
        y="117.50672">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.954338"
      y="117.50672"
      id="text1066"
      label="text17"><tspan
        role="line"
        id="tspan1066"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.954338"
        y="117.50672">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="84.879341"
      y="117.50672"
      id="text1067"
      label="text18"><tspan
        role="line"
        id="tspan1067"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="84.879341"
        y="117.50672">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.704338"
      y="117.50672"
      id="text1068"
      label="text19"><tspan
        role="line"
        id="tspan1068"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.704338"
        y="117.50672">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="78.858261"
      y="117.50672"
      id="text1069"
      label="text20"><tspan
        role="line"
        id="tspan1069"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="78.858261"
        y="117.50672">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.154228"
      y="117.70686"
      id="text1073"
      label="text21"><tspan
        role="line"
        id="tspan1073"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.154228"
        y="117.70686">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.979225"
      y="117.70686"
      id="text1074"
      label="text22"><tspan
        role="line"
        id="tspan1074"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.979225"
        y="117.70686">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.804222"
      y="117.70686"
      id="text1075"
      label="text23"><tspan
        role="line"
        id="tspan1075"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.804222"
        y="117.70686">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="51.529236"
      y="117.70686"
      id="text1076"
      label="text24"><tspan
        role="line"
        id="tspan1076"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="51.529236"
        y="117.70686">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="48.454216"
      y="117.70686"
      id="text1077"
      label="text25"><tspan
        role="line"
        id="tspan1077"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="48.454216"
        y="117.70686">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="152.75838"
      y="113.8027"
      id="text1081"
      label="text1"><tspan
        role="line"
        id="tspan1081"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="152.75838"
        y="113.8027">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="149.4133"
      y="113.8027"
      id="text1082"
      label="text2"><tspan
        role="line"
        id="tspan1082"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="149.4133"
        y="113.8027">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="146.2383"
      y="113.8027"
      id="text1083"
      label="text3"><tspan
        role="line"
        id="tspan1083"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="146.2383"
        y="113.8027">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.26329"
      y="113.8027"
      id="text1084"
      label="text4"><tspan
        role="line"
        id="tspan1084"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.26329"
        y="113.8027">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.08824"
      y="113.8027"
      id="text1085"
      label="text5"><tspan
        role="line"
        id="tspan1085"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.08824"
        y="113.8027">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.00484"
      y="113.8027"
      id="text1098"
      label="text6"><tspan
        role="line"
        id="tspan1098"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.00484"
        y="113.8027">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.92984"
      y="113.8027"
      id="text1099"
      label="text7"><tspan
        role="line"
        id="tspan1099"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.92984"
        y="113.8027">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="114.75488"
      y="113.8027"
      id="text1100"
      label="text8"><tspan
        role="line"
        id="tspan1100"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="114.75488"
        y="113.8027">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="111.5799"
      y="113.8027"
      id="text1101"
      label="text9"><tspan
        role="line"
        id="tspan1101"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="111.5799"
        y="113.8027">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="108.10487"
      y="113.8027"
      id="text1102"
      label="text10"><tspan
        role="line"
        id="tspan1102"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="108.10487"
        y="113.8027">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="105.05888"
      y="113.8027"
      id="text1103"
      label="text11"><tspan
        role="line"
        id="tspan1103"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="105.05888"
        y="113.8027">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.98394"
      y="113.8027"
      id="text1104"
      label="text12"><tspan
        role="line"
        id="tspan1104"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.98394"
        y="113.8027">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.008873"
      y="113.8027"
      id="text1105"
      label="text13"><tspan
        role="line"
        id="tspan1105"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.008873"
        y="113.8027">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.833832"
      y="113.8027"
      id="text1106"
      label="text14"><tspan
        role="line"
        id="tspan1106"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.833832"
        y="113.8027">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.787827"
      y="113.8027"
      id="text1107"
      label="text15"><tspan
        role="line"
        id="tspan1107"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.787827"
        y="113.8027">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.712852"
      y="113.8027"
      id="text1108"
      label="text16"><tspan
        role="line"
        id="tspan1108"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.712852"
        y="113.8027">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.66684"
      y="113.8027"
      id="text1109"
      label="text17"><tspan
        role="line"
        id="tspan1109"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.66684"
        y="113.8027">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.591843"
      y="113.8027"
      id="text1110"
      label="text18"><tspan
        role="line"
        id="tspan1110"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.591843"
        y="113.8027">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.41684"
      y="113.8027"
      id="text1111"
      label="text19"><tspan
        role="line"
        id="tspan1111"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.41684"
        y="113.8027">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.154263"
      y="113.80284"
      id="text1115"
      label="text20"><tspan
        role="line"
        id="tspan1115"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.154263"
        y="113.80284">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="58.179256"
      y="113.80284"
      id="text1116"
      label="text21"><tspan
        role="line"
        id="tspan1116"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="58.179256"
        y="113.80284">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="55.004253"
      y="113.80284"
      id="text1117"
      label="text22"><tspan
        role="line"
        id="tspan1117"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="55.004253"
        y="113.80284">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="51.82925"
      y="113.80284"
      id="text1118"
      label="text23"><tspan
        role="line"
        id="tspan1118"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="51.82925"
        y="113.80284">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="48.554264"
      y="113.80284"
      id="text1119"
      label="text24"><tspan
        role="line"
        id="tspan1119"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="48.554264"
        y="113.80284">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="152.75838"
      y="110.02769"
      id="text1123"
      label="text1"><tspan
        role="line"
        id="tspan1123"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="152.75838"
        y="110.02769">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="149.4133"
      y="110.02769"
      id="text1124"
      label="text2"><tspan
        role="line"
        id="tspan1124"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="149.4133"
        y="110.02769">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="146.2383"
      y="110.02769"
      id="text1125"
      label="text3"><tspan
        role="line"
        id="tspan1125"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="146.2383"
        y="110.02769">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.26329"
      y="110.02769"
      id="text1126"
      label="text4"><tspan
        role="line"
        id="tspan1126"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.26329"
        y="110.02769">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.08824"
      y="110.02769"
      id="text1127"
      label="text5"><tspan
        role="line"
        id="tspan1127"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.08824"
        y="110.02769">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="122.56335"
      y="110.02772"
      id="text1141"
      label="text6"><tspan
        role="line"
        id="tspan1141"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="122.56335"
        y="110.02772">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="119.48837"
      y="110.02772"
      id="text1142"
      label="text7"><tspan
        role="line"
        id="tspan1142"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="119.48837"
        y="110.02772">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="116.31339"
      y="110.02772"
      id="text1143"
      label="text8"><tspan
        role="line"
        id="tspan1143"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="116.31339"
        y="110.02772">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.1384"
      y="110.02772"
      id="text1144"
      label="text9"><tspan
        role="line"
        id="tspan1144"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.1384"
        y="110.02772">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.66337"
      y="110.02772"
      id="text1145"
      label="text10"><tspan
        role="line"
        id="tspan1145"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.66337"
        y="110.02772">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.61738"
      y="110.02772"
      id="text1146"
      label="text11"><tspan
        role="line"
        id="tspan1146"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.61738"
        y="110.02772">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.54247"
      y="110.02772"
      id="text1147"
      label="text12"><tspan
        role="line"
        id="tspan1147"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.54247"
        y="110.02772">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="100.56738"
      y="110.02772"
      id="text1148"
      label="text13"><tspan
        role="line"
        id="tspan1148"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="100.56738"
        y="110.02772">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="97.392334"
      y="110.02772"
      id="text1149"
      label="text14"><tspan
        role="line"
        id="tspan1149"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="97.392334"
        y="110.02772">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="94.346329"
      y="110.02772"
      id="text1150"
      label="text15"><tspan
        role="line"
        id="tspan1150"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="94.346329"
        y="110.02772">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="91.271355"
      y="110.02772"
      id="text1151"
      label="text16"><tspan
        role="line"
        id="tspan1151"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="91.271355"
        y="110.02772">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="88.225342"
      y="110.02772"
      id="text1152"
      label="text17"><tspan
        role="line"
        id="tspan1152"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="88.225342"
        y="110.02772">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="85.150345"
      y="110.02772"
      id="text1153"
      label="text18"><tspan
        role="line"
        id="tspan1153"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="85.150345"
        y="110.02772">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="81.975342"
      y="110.02772"
      id="text1154"
      label="text19"><tspan
        role="line"
        id="tspan1154"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="81.975342"
        y="110.02772">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="79.129265"
      y="110.02772"
      id="text1155"
      label="text20"><tspan
        role="line"
        id="tspan1155"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="79.129265"
        y="110.02772">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.154263"
      y="110.02785"
      id="text1159"
      label="text21"><tspan
        role="line"
        id="tspan1159"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.154263"
        y="110.02785">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.979259"
      y="110.02785"
      id="text1160"
      label="text22"><tspan
        role="line"
        id="tspan1160"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.979259"
        y="110.02785">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.804256"
      y="110.02785"
      id="text1161"
      label="text23"><tspan
        role="line"
        id="tspan1161"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.804256"
        y="110.02785">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="51.52927"
      y="110.02785"
      id="text1162"
      label="text24"><tspan
        role="line"
        id="tspan1162"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="51.52927"
        y="110.02785">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="48.45425"
      y="110.02785"
      id="text1163"
      label="text25"><tspan
        role="line"
        id="tspan1163"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="48.45425"
        y="110.02785">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="152.75838"
      y="106.26568"
      id="text1167"
      label="text1"><tspan
        role="line"
        id="tspan1167"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="152.75838"
        y="106.26568">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="149.4133"
      y="106.26568"
      id="text1168"
      label="text2"><tspan
        role="line"
        id="tspan1168"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="149.4133"
        y="106.26568">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="146.2383"
      y="106.26568"
      id="text1169"
      label="text3"><tspan
        role="line"
        id="tspan1169"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="146.2383"
        y="106.26568">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.26329"
      y="106.26568"
      id="text1170"
      label="text4"><tspan
        role="line"
        id="tspan1170"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.26329"
        y="106.26568">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.08824"
      y="106.26568"
      id="text1171"
      label="text5"><tspan
        role="line"
        id="tspan1171"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.08824"
        y="106.26568">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.00434"
      y="106.26566"
      id="text1184"
      label="text6"><tspan
        role="line"
        id="tspan1184"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.00434"
        y="106.26566">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="117.92935"
      y="106.26566"
      id="text1185"
      label="text7"><tspan
        role="line"
        id="tspan1185"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="117.92935"
        y="106.26566">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="114.75439"
      y="106.26566"
      id="text1186"
      label="text8"><tspan
        role="line"
        id="tspan1186"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="114.75439"
        y="106.26566">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="111.57941"
      y="106.26566"
      id="text1187"
      label="text9"><tspan
        role="line"
        id="tspan1187"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="111.57941"
        y="106.26566">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="108.10438"
      y="106.26566"
      id="text1188"
      label="text10"><tspan
        role="line"
        id="tspan1188"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="108.10438"
        y="106.26566">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="105.05839"
      y="106.26566"
      id="text1189"
      label="text11"><tspan
        role="line"
        id="tspan1189"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="105.05839"
        y="106.26566">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.98345"
      y="106.26566"
      id="text1190"
      label="text12"><tspan
        role="line"
        id="tspan1190"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.98345"
        y="106.26566">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.008377"
      y="106.26566"
      id="text1191"
      label="text13"><tspan
        role="line"
        id="tspan1191"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.008377"
        y="106.26566">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="95.833336"
      y="106.26566"
      id="text1192"
      label="text14"><tspan
        role="line"
        id="tspan1192"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="95.833336"
        y="106.26566">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.787331"
      y="106.26566"
      id="text1193"
      label="text15"><tspan
        role="line"
        id="tspan1193"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.787331"
        y="106.26566">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.712357"
      y="106.26566"
      id="text1194"
      label="text16"><tspan
        role="line"
        id="tspan1194"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.712357"
        y="106.26566">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.666344"
      y="106.26566"
      id="text1195"
      label="text17"><tspan
        role="line"
        id="tspan1195"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.666344"
        y="106.26566">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.591347"
      y="106.26566"
      id="text1196"
      label="text18"><tspan
        role="line"
        id="tspan1196"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.591347"
        y="106.26566">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.416344"
      y="106.26566"
      id="text1197"
      label="text19"><tspan
        role="line"
        id="tspan1197"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.416344"
        y="106.26566">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.154263"
      y="106.26582"
      id="text1201"
      label="text20"><tspan
        role="line"
        id="tspan1201"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.154263"
        y="106.26582">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="58.179256"
      y="106.26582"
      id="text1202"
      label="text21"><tspan
        role="line"
        id="tspan1202"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="58.179256"
        y="106.26582">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="55.004253"
      y="106.26582"
      id="text1203"
      label="text22"><tspan
        role="line"
        id="tspan1203"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="55.004253"
        y="106.26582">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="51.82925"
      y="106.26582"
      id="text1204"
      label="text23"><tspan
        role="line"
        id="tspan1204"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="51.82925"
        y="106.26582">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="48.554264"
      y="106.26582"
      id="text1205"
      label="text24"><tspan
        role="line"
        id="tspan1205"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="48.554264"
        y="106.26582">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="152.75838"
      y="102.36168"
      id="text1209"
      label="text1"><tspan
        role="line"
        id="tspan1209"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="152.75838"
        y="102.36168">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="149.4133"
      y="102.36168"
      id="text1210"
      label="text2"><tspan
        role="line"
        id="tspan1210"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="149.4133"
        y="102.36168">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="146.2383"
      y="102.36168"
      id="text1211"
      label="text3"><tspan
        role="line"
        id="tspan1211"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="146.2383"
        y="102.36168">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.26329"
      y="102.36168"
      id="text1212"
      label="text4"><tspan
        role="line"
        id="tspan1212"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.26329"
        y="102.36168">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.08824"
      y="102.36168"
      id="text1213"
      label="text5"><tspan
        role="line"
        id="tspan1213"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.08824"
        y="102.36168">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="122.59235"
      y="102.36165"
      id="text1227"
      label="text6"><tspan
        role="line"
        id="tspan1227"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="122.59235"
        y="102.36165">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="119.51735"
      y="102.36165"
      id="text1228"
      label="text7"><tspan
        role="line"
        id="tspan1228"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="119.51735"
        y="102.36165">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="116.34239"
      y="102.36165"
      id="text1229"
      label="text8"><tspan
        role="line"
        id="tspan1229"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="116.34239"
        y="102.36165">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.16741"
      y="102.36165"
      id="text1230"
      label="text9"><tspan
        role="line"
        id="tspan1230"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.16741"
        y="102.36165">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="109.69236"
      y="102.36165"
      id="text1231"
      label="text10"><tspan
        role="line"
        id="tspan1231"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="109.69236"
        y="102.36165">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="106.64637"
      y="102.36165"
      id="text1232"
      label="text11"><tspan
        role="line"
        id="tspan1232"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="106.64637"
        y="102.36165">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="103.57145"
      y="102.36165"
      id="text1233"
      label="text12"><tspan
        role="line"
        id="tspan1233"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="103.57145"
        y="102.36165">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="100.59638"
      y="102.36165"
      id="text1234"
      label="text13"><tspan
        role="line"
        id="tspan1234"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="100.59638"
        y="102.36165">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="97.421333"
      y="102.36165"
      id="text1235"
      label="text14"><tspan
        role="line"
        id="tspan1235"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="97.421333"
        y="102.36165">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="94.375328"
      y="102.36165"
      id="text1236"
      label="text15"><tspan
        role="line"
        id="tspan1236"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="94.375328"
        y="102.36165">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="91.300354"
      y="102.36165"
      id="text1237"
      label="text16"><tspan
        role="line"
        id="tspan1237"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="91.300354"
        y="102.36165">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="88.254341"
      y="102.36165"
      id="text1238"
      label="text17"><tspan
        role="line"
        id="tspan1238"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="88.254341"
        y="102.36165">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="85.179344"
      y="102.36165"
      id="text1239"
      label="text18"><tspan
        role="line"
        id="tspan1239"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="85.179344"
        y="102.36165">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="82.004341"
      y="102.36165"
      id="text1240"
      label="text19"><tspan
        role="line"
        id="tspan1240"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="82.004341"
        y="102.36165">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="79.158264"
      y="102.36165"
      id="text1241"
      label="text20"><tspan
        role="line"
        id="tspan1241"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="79.158264"
        y="102.36165">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.154263"
      y="102.36185"
      id="text1245"
      label="text21"><tspan
        role="line"
        id="tspan1245"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.154263"
        y="102.36185">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.979259"
      y="102.36185"
      id="text1246"
      label="text22"><tspan
        role="line"
        id="tspan1246"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.979259"
        y="102.36185">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.804256"
      y="102.36185"
      id="text1247"
      label="text23"><tspan
        role="line"
        id="tspan1247"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.804256"
        y="102.36185">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="51.52927"
      y="102.36185"
      id="text1248"
      label="text24"><tspan
        role="line"
        id="tspan1248"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="51.52927"
        y="102.36185">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="48.45425"
      y="102.36185"
      id="text1249"
      label="text25"><tspan
        role="line"
        id="tspan1249"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="48.45425"
        y="102.36185">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="150.41235"
      y="98.78669"
      id="text1252"
      label="text1"><tspan
        role="line"
        id="tspan1252"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="150.41235"
        y="98.78669">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="147.06728"
      y="98.78669"
      id="text1253"
      label="text2"><tspan
        role="line"
        id="tspan1253"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="147.06728"
        y="98.78669">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="143.89227"
      y="98.78669"
      id="text1254"
      label="text3"><tspan
        role="line"
        id="tspan1254"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="143.89227"
        y="98.78669">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="140.91727"
      y="98.78669"
      id="text1255"
      label="text4"><tspan
        role="line"
        id="tspan1255"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="140.91727"
        y="98.78669">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="121.1634"
      y="98.786781"
      id="text1268"
      label="text5"><tspan
        role="line"
        id="tspan1268"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="121.1634"
        y="98.786781">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="118.08832"
      y="98.786781"
      id="text1269"
      label="text6"><tspan
        role="line"
        id="tspan1269"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="118.08832"
        y="98.786781">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="115.01334"
      y="98.786781"
      id="text1270"
      label="text7"><tspan
        role="line"
        id="tspan1270"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="115.01334"
        y="98.786781">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="111.83839"
      y="98.786781"
      id="text1271"
      label="text8"><tspan
        role="line"
        id="tspan1271"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="111.83839"
        y="98.786781">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="108.6634"
      y="98.786781"
      id="text1272"
      label="text9"><tspan
        role="line"
        id="tspan1272"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="108.6634"
        y="98.786781">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="105.18841"
      y="98.786781"
      id="text1273"
      label="text10"><tspan
        role="line"
        id="tspan1273"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="105.18841"
        y="98.786781">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="102.1424"
      y="98.786781"
      id="text1274"
      label="text11"><tspan
        role="line"
        id="tspan1274"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="102.1424"
        y="98.786781">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.067474"
      y="98.786781"
      id="text1275"
      label="text12"><tspan
        role="line"
        id="tspan1275"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.067474"
        y="98.786781">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.092392"
      y="98.786781"
      id="text1276"
      label="text13"><tspan
        role="line"
        id="tspan1276"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.092392"
        y="98.786781">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="92.917328"
      y="98.786781"
      id="text1277"
      label="text14"><tspan
        role="line"
        id="tspan1277"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="92.917328"
        y="98.786781">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="89.87133"
      y="98.786781"
      id="text1278"
      label="text15"><tspan
        role="line"
        id="tspan1278"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="89.87133"
        y="98.786781">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="86.796356"
      y="98.786781"
      id="text1279"
      label="text16"><tspan
        role="line"
        id="tspan1279"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="86.796356"
        y="98.786781">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="83.750343"
      y="98.786781"
      id="text1280"
      label="text17"><tspan
        role="line"
        id="tspan1280"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="83.750343"
        y="98.786781">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="80.675346"
      y="98.786781"
      id="text1281"
      label="text18"><tspan
        role="line"
        id="tspan1281"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="80.675346"
        y="98.786781">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="61.054512"
      y="98.786713"
      id="text1284"
      label="text19"><tspan
        role="line"
        id="tspan1284"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="61.054512"
        y="98.786713">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="58.079266"
      y="98.786713"
      id="text1285"
      label="text20"><tspan
        role="line"
        id="tspan1285"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="58.079266"
        y="98.786713">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.904263"
      y="98.786713"
      id="text1286"
      label="text21"><tspan
        role="line"
        id="tspan1286"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.904263"
        y="98.786713">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="51.429256"
      y="98.786713"
      id="text1287"
      label="text22"><tspan
        role="line"
        id="tspan1287"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="51.429256"
        y="98.786713">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="171.47455"
      y="177.04372"
      id="text1585"
      label="text1"><tspan
        role="line"
        id="tspan1585"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="171.47455"
        y="177.04372">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="170.67526"
      y="173.4687"
      id="text1586"
      label="text2"><tspan
        role="line"
        id="tspan1586"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="170.67526"
        y="173.4687">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="171.40422"
      y="161.82671"
      id="text1587"
      label="text3"><tspan
        role="line"
        id="tspan1587"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="171.40422"
        y="161.82671">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="170.74626"
      y="158.22272"
      id="text1588"
      label="text4"><tspan
        role="line"
        id="tspan1588"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="170.74626"
        y="158.22272">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="171.50444"
      y="144.66486"
      id="text1589"
      label="text5"><tspan
        role="line"
        id="tspan1589"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="171.50444"
        y="144.66486">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="170.74629"
      y="141.06071"
      id="text1590"
      label="text6"><tspan
        role="line"
        id="tspan1590"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="170.74629"
        y="141.06071">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="171.50429"
      y="125.71471"
      id="text1591"
      label="text7"><tspan
        role="line"
        id="tspan1591"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="171.50429"
        y="125.71471">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="170.74638"
      y="122.13976"
      id="text1592"
      label="text8"><tspan
        role="line"
        id="tspan1592"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="170.74638"
        y="122.13976">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="171.57538"
      y="107.95275"
      id="text1593"
      label="text9"><tspan
        role="line"
        id="tspan1593"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="171.57538"
        y="107.95275">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="170.34637"
      y="104.34875"
      id="text1594"
      label="text10"><tspan
        role="line"
        id="tspan1594"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="170.34637"
        y="104.34875">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="28.929537"
      y="176.8437"
      id="text1603"
      label="text1"><tspan
        role="line"
        id="tspan1603"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="28.929537"
        y="176.8437">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="29.688179"
      y="173.26871"
      id="text1604"
      label="text2"><tspan
        role="line"
        id="tspan1604"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="29.688179"
        y="173.26871">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="28.917194"
      y="161.72672"
      id="text1605"
      label="text3"><tspan
        role="line"
        id="tspan1605"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="28.917194"
        y="161.72672">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="29.859283"
      y="158.12271"
      id="text1606"
      label="text4"><tspan
        role="line"
        id="tspan1606"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="29.859283"
        y="158.12271">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="29.017269"
      y="144.46471"
      id="text1607"
      label="text5"><tspan
        role="line"
        id="tspan1607"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="29.017269"
        y="144.46471">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="29.859283"
      y="140.86072"
      id="text1608"
      label="text6"><tspan
        role="line"
        id="tspan1608"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="29.859283"
        y="140.86072">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="29.017262"
      y="125.6147"
      id="text1609"
      label="text7"><tspan
        role="line"
        id="tspan1609"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="29.017262"
        y="125.6147">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="29.759352"
      y="121.93976"
      id="text1610"
      label="text8"><tspan
        role="line"
        id="tspan1610"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="29.759352"
        y="121.93976">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="28.988337"
      y="107.85275"
      id="text1611"
      label="text9"><tspan
        role="line"
        id="tspan1611"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="28.988337"
        y="107.85275">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="29.459343"
      y="104.24875"
      id="text1612"
      label="text10"><tspan
        role="line"
        id="tspan1612"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="29.459343"
        y="104.24875">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="145.08156"
      y="79.97422"
      id="text194"
      label="text1"><tspan
        role="line"
        id="tspan194"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="145.08156"
        y="79.97422">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="141.73648"
      y="79.97422"
      id="text195"
      label="text2"><tspan
        role="line"
        id="tspan195"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="141.73648"
        y="79.97422">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="138.56148"
      y="79.97422"
      id="text196"
      label="text3"><tspan
        role="line"
        id="tspan196"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="138.56148"
        y="79.97422">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.58647"
      y="79.97422"
      id="text197"
      label="text4"><tspan
        role="line"
        id="tspan197"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.58647"
        y="79.97422">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.41142"
      y="79.97422"
      id="text198"
      label="text5"><tspan
        role="line"
        id="tspan198"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.41142"
        y="79.97422">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.3364"
      y="79.97422"
      id="text199"
      label="text6"><tspan
        role="line"
        id="tspan199"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.3364"
        y="79.97422">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.26139"
      y="79.97422"
      id="text200"
      label="text7"><tspan
        role="line"
        id="tspan200"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.26139"
        y="79.97422">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.08644"
      y="79.97422"
      id="text201"
      label="text8"><tspan
        role="line"
        id="tspan201"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.08644"
        y="79.97422">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="119.91146"
      y="79.97422"
      id="text202"
      label="text9"><tspan
        role="line"
        id="tspan202"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="119.91146"
        y="79.97422">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="116.43645"
      y="79.97422"
      id="text203"
      label="text10"><tspan
        role="line"
        id="tspan203"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="116.43645"
        y="79.97422">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.39046"
      y="79.97422"
      id="text204"
      label="text11"><tspan
        role="line"
        id="tspan204"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.39046"
        y="79.97422">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.31549"
      y="79.97422"
      id="text205"
      label="text12"><tspan
        role="line"
        id="tspan205"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.31549"
        y="79.97422">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.34044"
      y="79.97422"
      id="text206"
      label="text13"><tspan
        role="line"
        id="tspan206"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.34044"
        y="79.97422">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.16539"
      y="79.97422"
      id="text207"
      label="text14"><tspan
        role="line"
        id="tspan207"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.16539"
        y="79.97422">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.11939"
      y="79.97422"
      id="text208"
      label="text15"><tspan
        role="line"
        id="tspan208"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.11939"
        y="79.97422">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.044418"
      y="79.97422"
      id="text209"
      label="text16"><tspan
        role="line"
        id="tspan209"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.044418"
        y="79.97422">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="94.998405"
      y="79.97422"
      id="text210"
      label="text17"><tspan
        role="line"
        id="tspan210"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="94.998405"
        y="79.97422">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="91.923409"
      y="79.97422"
      id="text211"
      label="text18"><tspan
        role="line"
        id="tspan211"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="91.923409"
        y="79.97422">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="88.748405"
      y="79.97422"
      id="text212"
      label="text19"><tspan
        role="line"
        id="tspan212"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="88.748405"
        y="79.97422">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="85.902328"
      y="79.97422"
      id="text213"
      label="text20"><tspan
        role="line"
        id="tspan213"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="85.902328"
        y="79.97422">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="82.927322"
      y="79.97422"
      id="text214"
      label="text21"><tspan
        role="line"
        id="tspan214"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="82.927322"
        y="79.97422">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="79.752319"
      y="79.97422"
      id="text215"
      label="text22"><tspan
        role="line"
        id="tspan215"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="79.752319"
        y="79.97422">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="76.577316"
      y="79.97422"
      id="text216"
      label="text23"><tspan
        role="line"
        id="tspan216"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="76.577316"
        y="79.97422">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.30233"
      y="79.97422"
      id="text217"
      label="text24"><tspan
        role="line"
        id="tspan217"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.30233"
        y="79.97422">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.22731"
      y="79.97422"
      id="text218"
      label="text25"><tspan
        role="line"
        id="tspan218"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.22731"
        y="79.97422">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.052353"
      y="79.97422"
      id="text219"
      label="text26"><tspan
        role="line"
        id="tspan219"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.052353"
        y="79.97422">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="63.977356"
      y="79.97422"
      id="text220"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="63.977356"
        y="79.97422"
        id="tspan220">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="60.802364"
      y="79.97422"
      id="text221"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="60.802364"
        y="79.97422"
        id="tspan221">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.627361"
      y="79.97422"
      id="text222"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.627361"
        y="79.97422"
        id="tspan222">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.352448"
      y="79.97422"
      id="text223"
      label="text30"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.352448"
        y="79.97422"
        id="tspan223">30</tspan><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.352448"
        y="81.517624"
        id="tspan504" /></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.352448"
      y="75.870544"
      id="text757"
      label="text30"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.352448"
        y="75.870544"
        id="tspan756">30</tspan><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.352448"
        y="77.413948"
        id="tspan757" /></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="145.08156"
      y="75.870544"
      id="text758"
      label="text1"><tspan
        role="line"
        id="tspan758"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="145.08156"
        y="75.870544">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="141.73648"
      y="75.870544"
      id="text759"
      label="text2"><tspan
        role="line"
        id="tspan759"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="141.73648"
        y="75.870544">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="138.56148"
      y="75.870544"
      id="text760"
      label="text3"><tspan
        role="line"
        id="tspan760"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="138.56148"
        y="75.870544">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.58647"
      y="75.870544"
      id="text761"
      label="text4"><tspan
        role="line"
        id="tspan761"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.58647"
        y="75.870544">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.41142"
      y="75.870544"
      id="text762"
      label="text5"><tspan
        role="line"
        id="tspan762"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.41142"
        y="75.870544">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.3364"
      y="75.870544"
      id="text763"
      label="text6"><tspan
        role="line"
        id="tspan763"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.3364"
        y="75.870544">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.26139"
      y="75.870544"
      id="text764"
      label="text7"><tspan
        role="line"
        id="tspan764"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.26139"
        y="75.870544">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.08644"
      y="75.870544"
      id="text765"
      label="text8"><tspan
        role="line"
        id="tspan765"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.08644"
        y="75.870544">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="119.91146"
      y="75.870544"
      id="text766"
      label="text9"><tspan
        role="line"
        id="tspan766"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="119.91146"
        y="75.870544">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="116.43645"
      y="75.870544"
      id="text767"
      label="text10"><tspan
        role="line"
        id="tspan767"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="116.43645"
        y="75.870544">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.39046"
      y="75.870544"
      id="text768"
      label="text11"><tspan
        role="line"
        id="tspan768"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.39046"
        y="75.870544">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.31549"
      y="75.870544"
      id="text769"
      label="text12"><tspan
        role="line"
        id="tspan769"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.31549"
        y="75.870544">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.34044"
      y="75.870544"
      id="text770"
      label="text13"><tspan
        role="line"
        id="tspan770"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.34044"
        y="75.870544">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.16539"
      y="75.870544"
      id="text771"
      label="text14"><tspan
        role="line"
        id="tspan771"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.16539"
        y="75.870544">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.11939"
      y="75.870544"
      id="text772"
      label="text15"><tspan
        role="line"
        id="tspan772"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.11939"
        y="75.870544">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.044418"
      y="75.870544"
      id="text773"
      label="text16"><tspan
        role="line"
        id="tspan773"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.044418"
        y="75.870544">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="94.998405"
      y="75.870544"
      id="text774"
      label="text17"><tspan
        role="line"
        id="tspan774"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="94.998405"
        y="75.870544">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="91.923409"
      y="75.870544"
      id="text775"
      label="text18"><tspan
        role="line"
        id="tspan775"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="91.923409"
        y="75.870544">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="88.748405"
      y="75.870544"
      id="text776"
      label="text19"><tspan
        role="line"
        id="tspan776"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="88.748405"
        y="75.870544">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="85.902328"
      y="75.870544"
      id="text777"
      label="text20"><tspan
        role="line"
        id="tspan777"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="85.902328"
        y="75.870544">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="82.927322"
      y="75.870544"
      id="text778"
      label="text21"><tspan
        role="line"
        id="tspan778"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="82.927322"
        y="75.870544">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="79.752319"
      y="75.870544"
      id="text779"
      label="text22"><tspan
        role="line"
        id="tspan779"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="79.752319"
        y="75.870544">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="76.577316"
      y="75.870544"
      id="text780"
      label="text23"><tspan
        role="line"
        id="tspan780"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="76.577316"
        y="75.870544">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.30233"
      y="75.870544"
      id="text838"
      label="text24"><tspan
        role="line"
        id="tspan838"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.30233"
        y="75.870544">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.22731"
      y="75.870544"
      id="text839"
      label="text25"><tspan
        role="line"
        id="tspan839"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.22731"
        y="75.870544">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.052353"
      y="75.870544"
      id="text840"
      label="text26"><tspan
        role="line"
        id="tspan840"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.052353"
        y="75.870544">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="63.977356"
      y="75.870544"
      id="text841"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="63.977356"
        y="75.870544"
        id="tspan841">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="60.802364"
      y="75.870544"
      id="text842"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="60.802364"
        y="75.870544"
        id="tspan842">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.627361"
      y="75.870544"
      id="text843"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.627361"
        y="75.870544"
        id="tspan843">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="145.08156"
      y="71.766541"
      id="text976"
      label="text1"><tspan
        role="line"
        id="tspan976"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="145.08156"
        y="71.766541">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="141.73648"
      y="71.766541"
      id="text977"
      label="text2"><tspan
        role="line"
        id="tspan977"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="141.73648"
        y="71.766541">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="138.56148"
      y="71.766541"
      id="text978"
      label="text3"><tspan
        role="line"
        id="tspan978"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="138.56148"
        y="71.766541">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.58647"
      y="71.766541"
      id="text984"
      label="text4"><tspan
        role="line"
        id="tspan984"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.58647"
        y="71.766541">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.41142"
      y="71.766541"
      id="text985"
      label="text5"><tspan
        role="line"
        id="tspan985"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.41142"
        y="71.766541">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.3364"
      y="71.766541"
      id="text986"
      label="text6"><tspan
        role="line"
        id="tspan986"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.3364"
        y="71.766541">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.26139"
      y="71.766541"
      id="text992"
      label="text7"><tspan
        role="line"
        id="tspan992"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.26139"
        y="71.766541">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.08644"
      y="71.766541"
      id="text993"
      label="text8"><tspan
        role="line"
        id="tspan993"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.08644"
        y="71.766541">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="119.91146"
      y="71.766541"
      id="text994"
      label="text9"><tspan
        role="line"
        id="tspan994"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="119.91146"
        y="71.766541">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="116.43645"
      y="71.766541"
      id="text995"
      label="text10"><tspan
        role="line"
        id="tspan995"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="116.43645"
        y="71.766541">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.39046"
      y="71.766541"
      id="text996"
      label="text11"><tspan
        role="line"
        id="tspan996"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.39046"
        y="71.766541">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.31549"
      y="71.766541"
      id="text997"
      label="text12"><tspan
        role="line"
        id="tspan997"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.31549"
        y="71.766541">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.34044"
      y="71.766541"
      id="text998"
      label="text13"><tspan
        role="line"
        id="tspan998"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.34044"
        y="71.766541">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.16539"
      y="71.766541"
      id="text999"
      label="text14"><tspan
        role="line"
        id="tspan999"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.16539"
        y="71.766541">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.11939"
      y="71.766541"
      id="text1000"
      label="text15"><tspan
        role="line"
        id="tspan1000"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.11939"
        y="71.766541">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.044418"
      y="71.766541"
      id="text1001"
      label="text16"><tspan
        role="line"
        id="tspan1001"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.044418"
        y="71.766541">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="94.998405"
      y="71.766541"
      id="text1002"
      label="text17"><tspan
        role="line"
        id="tspan1002"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="94.998405"
        y="71.766541">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="91.923409"
      y="71.766541"
      id="text1003"
      label="text18"><tspan
        role="line"
        id="tspan1003"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="91.923409"
        y="71.766541">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="88.748405"
      y="71.766541"
      id="text1004"
      label="text19"><tspan
        role="line"
        id="tspan1004"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="88.748405"
        y="71.766541">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="85.902328"
      y="71.766541"
      id="text1005"
      label="text20"><tspan
        role="line"
        id="tspan1005"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="85.902328"
        y="71.766541">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="82.927322"
      y="71.766541"
      id="text1006"
      label="text21"><tspan
        role="line"
        id="tspan1006"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="82.927322"
        y="71.766541">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="79.752319"
      y="71.766541"
      id="text1007"
      label="text22"><tspan
        role="line"
        id="tspan1007"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="79.752319"
        y="71.766541">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="76.577316"
      y="71.766541"
      id="text1026"
      label="text23"><tspan
        role="line"
        id="tspan1026"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="76.577316"
        y="71.766541">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.30233"
      y="71.766541"
      id="text1027"
      label="text24"><tspan
        role="line"
        id="tspan1027"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.30233"
        y="71.766541">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.22731"
      y="71.766541"
      id="text1028"
      label="text25"><tspan
        role="line"
        id="tspan1028"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.22731"
        y="71.766541">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.052353"
      y="71.766541"
      id="text1034"
      label="text26"><tspan
        role="line"
        id="tspan1034"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.052353"
        y="71.766541">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="63.977356"
      y="71.766541"
      id="text1035"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="63.977356"
        y="71.766541"
        id="tspan1035">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="60.802364"
      y="71.766541"
      id="text1036"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="60.802364"
        y="71.766541"
        id="tspan1036">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.627361"
      y="71.766541"
      id="text1042"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.627361"
        y="71.766541"
        id="tspan1042">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.352448"
      y="71.766541"
      id="text1044"
      label="text30"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.352448"
        y="71.766541"
        id="tspan1043">30</tspan><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.352448"
        y="73.309944"
        id="tspan1044" /></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="145.08156"
      y="67.662544"
      id="text1256"
      label="text1"><tspan
        role="line"
        id="tspan1256"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="145.08156"
        y="67.662544">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="141.73648"
      y="67.662544"
      id="text1257"
      label="text2"><tspan
        role="line"
        id="tspan1257"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="141.73648"
        y="67.662544">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="138.56148"
      y="67.662544"
      id="text1258"
      label="text3"><tspan
        role="line"
        id="tspan1258"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="138.56148"
        y="67.662544">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.58647"
      y="67.662544"
      id="text1259"
      label="text4"><tspan
        role="line"
        id="tspan1259"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.58647"
        y="67.662544">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.41142"
      y="67.662544"
      id="text1260"
      label="text5"><tspan
        role="line"
        id="tspan1260"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.41142"
        y="67.662544">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.3364"
      y="67.662544"
      id="text1261"
      label="text6"><tspan
        role="line"
        id="tspan1261"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.3364"
        y="67.662544">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.26139"
      y="67.662544"
      id="text1262"
      label="text7"><tspan
        role="line"
        id="tspan1262"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.26139"
        y="67.662544">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.08644"
      y="67.662544"
      id="text1263"
      label="text8"><tspan
        role="line"
        id="tspan1263"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.08644"
        y="67.662544">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="119.91146"
      y="67.662544"
      id="text1264"
      label="text9"><tspan
        role="line"
        id="tspan1264"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="119.91146"
        y="67.662544">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="116.43645"
      y="67.662544"
      id="text1265"
      label="text10"><tspan
        role="line"
        id="tspan1265"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="116.43645"
        y="67.662544">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="113.39046"
      y="67.662544"
      id="text1266"
      label="text11"><tspan
        role="line"
        id="tspan1266"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="113.39046"
        y="67.662544">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="110.31549"
      y="67.662544"
      id="text1267"
      label="text12"><tspan
        role="line"
        id="tspan1267"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="110.31549"
        y="67.662544">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="107.34044"
      y="67.662544"
      id="text1282"
      label="text13"><tspan
        role="line"
        id="tspan1282"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="107.34044"
        y="67.662544">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="104.16539"
      y="67.662544"
      id="text1283"
      label="text14"><tspan
        role="line"
        id="tspan1283"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="104.16539"
        y="67.662544">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="101.11939"
      y="67.662544"
      id="text1288"
      label="text15"><tspan
        role="line"
        id="tspan1288"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="101.11939"
        y="67.662544">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="98.044418"
      y="67.662544"
      id="text1289"
      label="text16"><tspan
        role="line"
        id="tspan1289"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="98.044418"
        y="67.662544">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="94.998405"
      y="67.662544"
      id="text1290"
      label="text17"><tspan
        role="line"
        id="tspan1290"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="94.998405"
        y="67.662544">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="91.923409"
      y="67.662544"
      id="text1291"
      label="text18"><tspan
        role="line"
        id="tspan1291"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="91.923409"
        y="67.662544">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="88.748405"
      y="67.662544"
      id="text1292"
      label="text19"><tspan
        role="line"
        id="tspan1292"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="88.748405"
        y="67.662544">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="85.902328"
      y="67.662544"
      id="text1293"
      label="text20"><tspan
        role="line"
        id="tspan1293"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="85.902328"
        y="67.662544">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="82.927322"
      y="67.662544"
      id="text1294"
      label="text21"><tspan
        role="line"
        id="tspan1294"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="82.927322"
        y="67.662544">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="79.752319"
      y="67.662544"
      id="text1295"
      label="text22"><tspan
        role="line"
        id="tspan1295"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="79.752319"
        y="67.662544">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="76.577316"
      y="67.662544"
      id="text1296"
      label="text23"><tspan
        role="line"
        id="tspan1296"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="76.577316"
        y="67.662544">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.30233"
      y="67.662544"
      id="text1297"
      label="text24"><tspan
        role="line"
        id="tspan1297"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.30233"
        y="67.662544">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.22731"
      y="67.662544"
      id="text1298"
      label="text25"><tspan
        role="line"
        id="tspan1298"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.22731"
        y="67.662544">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.052353"
      y="67.662544"
      id="text1299"
      label="text26"><tspan
        role="line"
        id="tspan1299"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.052353"
        y="67.662544">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="63.977356"
      y="67.662544"
      id="text1300"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="63.977356"
        y="67.662544"
        id="tspan1300">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="60.802364"
      y="67.662544"
      id="text1301"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="60.802364"
        y="67.662544"
        id="tspan1301">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.627361"
      y="67.662544"
      id="text1302"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.627361"
        y="67.662544"
        id="tspan1302">29</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.352448"
      y="67.662544"
      id="text1304"
      label="text30"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.352448"
        y="67.662544"
        id="tspan1303">30</tspan><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.352448"
        y="69.205948"
        id="tspan1304" /></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill: '#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="145.08156"
      y="63.55854"
      id="text1422"
      label="text1"><tspan
        role="line"
        id="tspan1422"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="145.08156"
        y="63.55854">1</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="141.73648"
      y="63.55854"
      id="text1423"
      label="text2"><tspan
        role="line"
        id="tspan1423"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="141.73648"
        y="63.55854">2</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="138.56148"
      y="63.55854"
      id="text1424"
      label="text3"><tspan
        role="line"
        id="tspan1424"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="138.56148"
        y="63.55854">3</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="135.58647"
      y="63.55854"
      id="text1425"
      label="text4"><tspan
        role="line"
        id="tspan1425"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="135.58647"
        y="63.55854">4</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="132.41142"
      y="63.55854"
      id="text1426"
      label="text5"><tspan
        role="line"
        id="tspan1426"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="132.41142"
        y="63.55854">5</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="129.3364"
      y="63.55854"
      id="text1427"
      label="text6"><tspan
        role="line"
        id="tspan1427"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="129.3364"
        y="63.55854">6</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="126.26139"
      y="63.55854"
      id="text1428"
      label="text7"><tspan
        role="line"
        id="tspan1428"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="126.26139"
        y="63.55854">7</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="123.08644"
      y="63.55854"
      id="text1429"
      label="text8"><tspan
        role="line"
        id="tspan1429"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="123.08644"
        y="63.55854">8</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="119.91146"
      y="63.55854"
      id="text1430"
      label="text9"><tspan
        role="line"
        id="tspan1430"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="119.91146"
        y="63.55854">9</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="116.43645"
      y="63.55854"
      id="text1461"
      label="text10"><tspan
        role="line"
        id="tspan1461"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="116.43645"
        y="63.55854">10</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="111.80296"
      y="63.55854"
      id="text1462"
      label="text11"><tspan
        role="line"
        id="tspan1462"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="111.80296"
        y="63.55854">11</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="108.72799"
      y="63.55854"
      id="text1463"
      label="text12"><tspan
        role="line"
        id="tspan1463"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="108.72799"
        y="63.55854">12</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="105.75293"
      y="63.55854"
      id="text1464"
      label="text13"><tspan
        role="line"
        id="tspan1464"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="105.75293"
        y="63.55854">13</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="102.5779"
      y="63.55854"
      id="text1465"
      label="text14"><tspan
        role="line"
        id="tspan1465"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="102.5779"
        y="63.55854">14</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="99.531906"
      y="63.55854"
      id="text1466"
      label="text15"><tspan
        role="line"
        id="tspan1466"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="99.531906"
        y="63.55854">15</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="96.456917"
      y="63.55854"
      id="text1467"
      label="text16"><tspan
        role="line"
        id="tspan1467"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="96.456917"
        y="63.55854">16</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="93.410904"
      y="63.55854"
      id="text1468"
      label="text17"><tspan
        role="line"
        id="tspan1468"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="93.410904"
        y="63.55854">17</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="90.335907"
      y="63.55854"
      id="text1469"
      label="text18"><tspan
        role="line"
        id="tspan1469"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="90.335907"
        y="63.55854">18</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="87.160904"
      y="63.55854"
      id="text1470"
      label="text19"><tspan
        role="line"
        id="tspan1470"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="87.160904"
        y="63.55854">19</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="82.727219"
      y="63.55854"
      id="text1471"
      label="text20"><tspan
        role="line"
        id="tspan1471"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="82.727219"
        y="63.55854">20</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="79.752213"
      y="63.55854"
      id="text1472"
      label="text21"><tspan
        role="line"
        id="tspan1472"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="79.752213"
        y="63.55854">21</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="76.577209"
      y="63.55854"
      id="text1473"
      label="text22"><tspan
        role="line"
        id="tspan1473"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="76.577209"
        y="63.55854">22</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="73.402206"
      y="63.55854"
      id="text1474"
      label="text23"><tspan
        role="line"
        id="tspan1474"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="73.402206"
        y="63.55854">23</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="70.12722"
      y="63.55854"
      id="text1475"
      label="text24"><tspan
        role="line"
        id="tspan1475"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="70.12722"
        y="63.55854">24</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="67.0522"
      y="63.55854"
      id="text1476"
      label="text25"><tspan
        role="line"
        id="tspan1476"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="67.0522"
        y="63.55854">25</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="63.877243"
      y="63.55854"
      id="text1477"
      label="text26"><tspan
        role="line"
        id="tspan1477"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="63.877243"
        y="63.55854">26</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="60.802246"
      y="63.55854"
      id="text1478"
      label="text27"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="60.802246"
        y="63.55854"
        id="tspan1478">27</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="57.627254"
      y="63.55854"
      id="text1479"
      label="text28"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="57.627254"
        y="63.55854"
        id="tspan1479">28</tspan></text><text
      space="preserve"
      style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fill:'#ffffff', fillOpacity: '1', strokeWidth: '0.264583'}}
      x="54.452251"
      y="63.55854"
      id="text1480"
      label="text29"><tspan
        role="line"
        style={{fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'bold', fontStretch: 'normal', fontSize: '1.23472px', fontFamily: 'Arial', fontVariantCaps: 'normal', fill: '#ffffff', strokeWidth: '0.264583'}}
        x="54.452251"
        y="63.55854"
        id="tspan1480">29</tspan></text></g></svg>
      </div>
  );
});

export default HallFilarmoniya;