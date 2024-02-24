import React, {useContext, useRef, useEffect} from 'react';
import './hallDramteatr.css';
import { observer } from 'mobx-react-lite';
import { Context } from '../..';
import { createTicket, getTickets, deleteTicket, getTicketId, getTicketPrice } from '../../http/ticketAPI';
import { addToTickets } from '../../http/userAPI';


const HallDramteatr = observer(() => {
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
        <div className='wrapper-svg-dramteatr'>
            <svg
   width="210mm"
   height="297mm"
   viewBox="0 0 210 297"
   version="1.1"
   id="svg1"
   space="preserve"
   inkscape_version="1.3.2 (091e20e, 2023-11-25, custom)"
   docname="Dramteatr.svg"
   xmlns_inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns_sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns_xlink="http://www.w3.org/1999/xlink"
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
     zoom="1.4142136"
     cx="380.06989"
     cy="321.38003"
     window-width="1920"
     window-height="991"
     window-x="-9"
     window-y="-9"
     window-maximized="1"
     current-layer="layer1" /><defs
     id="defs1"><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect1440" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect444" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect449" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect451" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect453" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect455" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect457" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect459" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect461" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect463" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect481" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect482" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect483" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect484" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect485" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect486" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect487" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect488" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect489" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect1440-6" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect444-8" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect449-1" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect451-3" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect453-3" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect457-2" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect459-8" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect461-9" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect463-8" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect481-1" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect482-6" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect483-0" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect484-1" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect485-8" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect486-9" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect487-9" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect488-0" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect489-2" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect800" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect802" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect804" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect806" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect808" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect852" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect854" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect856" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect908" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect909" /><rect
       x="200.81833"
       y="766.50372"
       width="11.861963"
       height="10.651335"
       id="rect910" /></defs><g
     groupmode="layer"
     id="layer4"
     label="Ladle_number"
     style={{ display:"inline" }}
     insensitive="true"><path
       id="rect1708"
       style={{ display:"inline", fill:"#f2f2f2", fillOpacity:"1", strokeWidth: "0.273801" }}
       d="m 57.563611,69.604538 c -5.34404,0 -9.646611,4.335684 -9.646611,9.721309 v 51.341763 5.97212 h 122.18599 v -5.97212 h 5.2e-4 V 79.325847 c 0,-5.385625 -4.30204,-9.721309 -9.64608,-9.721309 z M 47.917,128.84188 v 16.3318 l 1.110931,-0.37401 1.462169,-0.44766 1.364162,-0.43071 1.104574,-0.36448 1.039412,-0.29826 0.92604,-0.28184 0.941934,-0.24899 0.877302,-0.26489 0.893196,-0.23203 0.877301,-0.21563 1.055835,-0.16581 0.926041,-0.16582 1.071728,-0.24846 1.104574,-0.26489 0.860879,-0.14939 0.877301,-0.19867 0.747508,-0.13298 0.633077,-0.13244 0.828563,-0.16581 1.218475,-0.24847 1.120466,-0.23204 1.202052,-0.19919 0.909618,-0.1494 1.153313,-0.14886 0.795717,-0.13244 1.08868,-0.13244 2.57787,-0.31363 1.608386,-0.28131 1.470116,-0.18701 1.332375,-0.18807 1.102985,-0.14039 1.239665,-0.0938 1.378996,-0.14039 1.331846,-0.14092 1.838307,-0.14038 2.067169,-0.0938 1.492897,-0.0472 1.447336,-0.0355 1.389591,-0.0349 1.275159,-0.0466 1.585077,-0.0709 1.733943,-0.0699 1.470634,-0.0582 2.23987,-0.0594 2.94024,-0.0472 2.34317,-0.0466 3.0319,-0.0472 2.94076,0.0948 1.60786,0.0472 h 1.92942 l 2.20544,0.11708 2.31987,0.0938 2.09047,0.14038 2.31987,0.0938 2.36596,0.18753 1.65448,0.16423 1.37794,0.11708 1.47011,0.1637 1.63117,0.16476 1.26404,0.11708 3.90548,0.48368 3.0536,0.33111 2.84911,0.42752 1.49342,0.25747 1.7456,0.32793 1.79169,0.32846 2.15935,0.49268 1.88387,0.42171 1.56177,0.37508 1.5856,0.37454 1.76891,0.44554 1.44734,0.4217 1.1941,0.35176 1.53899,0.53932 1.17185,0.39839 1.03306,0.35176 1.01133,0.37508 0.98803,0.37508 0.84975,0.32792 0.88048,0.31151 c 0.004,-0.0517 0.007,-0.10316 0.007,-0.15575 v -17.08673 z" /><path
       id="path1715"
       style={{ display:"inline", fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.262565" }}
       d="m 111.20617,141.05959 -3.01833,0.0471 -2.3326,0.0472 -2.92737,0.0472 -2.22951,0.0594 -1.463937,0.0588 -1.726195,0.0704 -1.578138,0.0709 -1.269397,0.0472 -1.38358,0.035 -1.440693,0.0355 -1.486169,0.0472 -2.058205,0.0943 -1.829796,0.14143 -1.325976,0.1414 -1.372478,0.1409 -1.234521,0.0943 -1.09808,0.14142 -1.325977,0.18854 -1.463933,0.18804 -1.600886,0.28283 -2.566563,0.31474 -1.083424,0.13331 -0.792355,0.13329 -1.148106,0.14952 -0.90555,0.15002 -1.196617,0.20022 -1.115766,0.23313 -1.212789,0.24939 -0.824697,0.16674 -0.630649,0.1333 -0.743844,0.13331 -0.873207,0.19969 -0.857037,0.15004 -1.099596,0.26609 -1.067252,0.24986 -0.92172,0.16677 -1.051083,0.16625 -0.873209,0.21691 -0.889378,0.23317 -0.873208,0.26608 -0.937889,0.24989 -0.921719,0.2833 -1.034913,0.29956 -1.099595,0.36644 -1.358323,0.43286 -1.455347,0.44958 -1.568539,0.53319 0.01618,7.26058 -0.01618,0.006 0.02427,10.81003 0.175855,-0.0396 0.213755,-0.0695 0.617511,-0.20021 0.686236,-0.25899 0.764562,-0.26659 0.751928,-0.27472 0.824697,-0.30818 0.945974,-0.32487 0.80044,-0.25799 1.172363,-0.32893 0.650864,-0.22506 0.606393,-0.17891 0.651873,-0.18956 0.823182,-0.23568 0.960629,-0.28283 0.937384,-0.23518 0.846425,-0.25949 1.1663,-0.25899 1.349226,-0.25902 1.554896,-0.32945 1.692346,-0.4004 1.966739,-0.28281 2.317437,-0.42222 1.115765,-0.19157 1.067253,-0.10848 1.180447,-0.18296 1.115772,-0.15003 1.204698,-0.15816 1.283032,-0.18195 1.103637,-0.15305 1.03491,-0.12976 1.109194,-0.11152 1.143055,-0.14141 2.476115,-0.26507 1.099598,-0.0664 1.293632,-0.1333 1.423008,-0.16625 1.843442,-0.10037 1.746419,-0.0665 2.764137,-0.17992 1.863657,-0.0704 3.121893,-0.15308 2.424077,-0.0708 h 2.03496 l 2.53877,-0.0233 h 3.10979 l 3.54488,0.0472 3.77329,0.0703 4.68793,0.2357 2.14967,0.0471 1.72672,0.0355 2.01219,0.10596 2.51554,0.23516 2.34421,0.23569 1.53216,0.14141 1.25775,0.11759 1.2805,0.0943 1.28103,0.14141 1.16628,0.11761 1.16631,0.18854 1.34923,0.16472 1.4407,0.14142 1.37196,0.23567 1.50941,0.259 1.80655,0.259 2.05819,0.37659 2.50037,0.51192 0.93791,0.19969 0.88937,0.21642 0.79236,0.16676 0.90554,0.18297 1.00257,0.24988 0.99854,0.23871 1.46393,0.40042 1.37197,0.3771 1.98947,0.56512 2.03547,0.65942 1.60087,0.61226 1.48617,0.54182 1.53217,0.65941 1.06624,0.43589 0.003,-10.6083 -0.002,-5e-4 0.002,-7.26565 -0.0172,-0.005 -0.91464,-0.3264 -0.84592,-0.32998 -0.98338,-0.37657 -1.00661,-0.3771 -1.02883,-0.35326 -1.16631,-0.40043 -1.53216,-0.54181 -1.18904,-0.35328 -1.44069,-0.42373 -1.76106,-0.44753 -1.57815,-0.37658 -1.5549,-0.37711 -1.87528,-0.42371 -2.14965,-0.49468 -1.78382,-0.32998 -1.73783,-0.32944 -1.48668,-0.259 -2.8364,-0.42929 -3.04006,-0.333 -3.888,-0.48607 -1.25826,-0.11759 -1.62361,-0.16523 -1.46345,-0.16472 -1.37197,-0.11757 -1.64685,-0.16525 -2.35535,-0.18806 -2.30985,-0.0943 -2.08093,-0.14142 -2.30936,-0.0944 -2.19565,-0.11759 h -1.92075 l -1.60089,-0.0472 z" /><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-44.371326"
       y="108.0332"
       id="text1707"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-44.371326"
         y="108.0332"
         role="line"
         id="tspan1707">БАЛКОН</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"5.48263px", fontFamily:"Arial", writingMode:"tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.256998" }}
       x="-151.2545"
       y="107.25558"
       id="text1708"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"5.48263px", textAlign:"center", writingMode:"tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.256998" }}
         x="-151.2545"
         y="107.25558"
         role="line"
         id="tspan1708">СЦЕНА</tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,88.379672,-73.808958)"
       id="text1402"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial", whiteSpace:"pre", shapeInside:"url(#rect1440-6)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan15"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan14">1</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,88.379672,-77.613125)"
       id="text444"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial", whiteSpace:"pre", shapeInside:"url(#rect444-8)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan17"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan16">2</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,88.379672,-81.088125)"
       id="text449"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial", whiteSpace:"pre", shapeInside:"url(#rect449-1)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan19"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan18">3</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,88.379672,-84.563125)"
       id="text451"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect451-3)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan21"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan20">4</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,88.379672,-88.49611)"
       id="text453"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial", whiteSpace:"pre", shapeInside:"url(#rect453-3)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan23"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan22">5</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,88.379672,-92.200089)"
       id="text457"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial", whiteSpace:"pre", shapeInside:"url(#rect457-2)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan37"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan36">6</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,88.379672,-96.004068)"
       id="text459"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial", whiteSpace:"pre", shapeInside:"url(#rect459-8)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan43"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan42">7</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,88.379672,-99.708217)"
       id="text461"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial", whiteSpace:"pre", shapeInside:"url(#rect461-9)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan52"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan48">8</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,88.379672,-103.4124)"
       id="text463"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial", whiteSpace:"pre", shapeInside:"url(#rect463-8)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan54"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan53">9</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,23.292128,-73.808958)"
       id="text465"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect481-1)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan56"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan55">1</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,23.292128,-77.613125)"
       id="text467"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect482-6)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan58"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan57">2</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,23.292128,-81.088125)"
       id="text469"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect483-0)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan60"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan59">3</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,23.292128,-84.563125)"
       id="text471"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect484-1)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan62"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan61">4</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,23.292128,-88.49611)"
       id="text473"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect485-8)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan77"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan76">5</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,23.292128,-92.200089)"
       id="text475"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect486-9)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan79"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan78">6</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,23.292128,-96.004068)"
       id="text477"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect487-9)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan88"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan80">7</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,23.292128,-99.708217)"
       id="text479"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect488-0)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan90"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan89">8</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,23.292128,-103.4124)"
       id="text481"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect489-2)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan92"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan91">9</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.512984,-115.0254)"
       id="text800"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect800)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan94"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan93">10</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.513129,-118.7294)"
       id="text802"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect802)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan96"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan95">11</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.512984,-122.5334)"
       id="text804"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect804)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan103"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan102">12</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.513129,-126.2084)"
       id="text806"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect806)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan105"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan104">13</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.513129,-129.91259)"
       id="text808"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect808)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan107"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan106">14</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.99243,-146.73483)"
       id="text852"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect852)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan109"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan108">1</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.99243,-150.43902)"
       id="text854"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect854)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan111"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan110">2</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.99243,-154.2434)"
       id="text856"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect856)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan113"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan112">3</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.99243,-166.41457)"
       id="text904"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect908)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan129"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan128">1</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.99243,-170.11876)"
       id="text906"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect909)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan136"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan130">2</tspan></tspan></text><text
       space="preserve"
       transform="matrix(0.26458333,0,0,0.26458333,54.99243,-173.92314)"
       id="text908"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"8px", fontFamily:"Arial",whiteSpace:"pre", shapeInside:"url(#rect910)", display:"inline", fill:"#ff00ff", fillOpacity:"1" }}><tspan
         x="200.81836"
         y="773.70994"
         id="tspan138"><tspan
           style={{ fill:"#1a1a1a" }}
           id="tspan137">3</tspan></tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-63.421345"
       y="108.0332"
       id="text1602"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-63.421345"
         y="108.0332"
         role="line"
         id="tspan1602">БЕЛЬЕТАЖ</tspan></text><path
       id="path1622"
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.265228" }}
       d="m 92.216593,45.916577 v 16.529741 h 0.468706 V 45.916577 Z" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.265228" }}
       d="m 92.216593,26.437663 v 14.60376 h 0.468706 v -14.60376 z"
       id="rect1607" /><path
       id="path1623"
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.265228" }}
       d="m 125.02493,45.916577 v 16.529741 h 0.4687 V 45.916577 Z" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.265228" }}
       d="m 125.02493,26.437663 v 14.60376 h 0.4687 v -14.60376 z"
       id="rect1608" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.253974" }}
       d="m 140.89993,47.504077 v 16.10021 h 0.4687 v -16.10021 z"
       id="path1625" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.259797" }}
       d="m 140.89993,27.093913 v 15.53501 h 0.4687 v -15.53501 z"
       id="rect1609" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.265228" }}
       d="m 164.71191,51.223748 v 15.426448 h 0.46871 V 51.223748 Z"
       id="path1621" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.254141" }}
       d="m 164.71191,27.937663 v 16.823946 h 0.46871 V 27.937663 Z"
       id="rect1611" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.25915" }}
       d="M 76.87076,47.504077 V 64.2672 h 0.468705 V 47.504077 Z"
       id="path1624" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.259012" }}
       d="m 76.87076,27.187663 v 15.44126 h 0.468705 v -15.44126 z"
       id="rect1612" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.265228" }}
       d="m 53.587427,51.208245 v 15.441951 h 0.468705 V 51.208245 Z"
       id="path1620" /><path
       style={{ fill:"#cccccc", fillOpacity:"1", strokeWidth:"0.244007" }}
       d="m 53.587427,29.250163 v 15.495426 h 0.468705 V 29.250163 Z"
       id="rect1613" /><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-44.371326"
       y="85.279053"
       id="text1626"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-44.371326"
         y="85.279053"
         role="line"
         id="tspan1626">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-45.958828"
       y="67.287369"
       id="text1627"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-45.958828"
         y="67.287369"
         role="line"
         id="tspan1627">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-49.133831"
       y="47.708183"
       id="text1628"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-49.133831"
         y="47.708183"
         role="line"
         id="tspan1628">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-44.371326"
       y="132.90398"
       id="text1629"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-44.371326"
         y="132.90398"
         role="line"
         id="tspan1629">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-45.958828"
       y="152.48288"
       id="text1630"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-45.958828"
         y="152.48288"
         role="line"
         id="tspan1630">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-49.133831"
       y="172.59094"
       id="text1631"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-49.133831"
         y="172.59094"
         role="line"
         id="tspan1631">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-63.950508"
       y="85.279053"
       id="text1632"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-63.950508"
         y="85.279053"
         role="line"
         id="tspan1632">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-65.53801"
       y="67.287369"
       id="text1633"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-65.53801"
         y="67.287369"
         role="line"
         id="tspan1633">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-68.713013"
       y="47.708183"
       id="text1634"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-68.713013"
         y="47.708183"
         role="line"
         id="tspan1634">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-63.950508"
       y="132.90398"
       id="text1635"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-63.950508"
         y="132.90398"
         role="line"
         id="tspan1635">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-65.53801"
       y="152.48288"
       id="text1636"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-65.53801"
         y="152.48288"
         role="line"
         id="tspan1636">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-68.713013"
       y="172.59094"
       id="text1637"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-68.713013"
         y="172.59094"
         role="line"
         id="tspan1637">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-108.40053"
       y="180.52832"
       id="text1638"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-108.40053"
         y="180.52832"
         role="line"
         id="tspan1638">БЕНУАР 1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"3.52778px", fontFamily:"Arial", writingMode: "tb-rl", textOrientation:"sideways", display:"inline", fill:"#1a1a1a", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="-107.87136"
       y="37.654007"
       id="text1639"
       transform="rotate(-90)"><tspan
         style={{ fontSize:"3.52778px", textAlign:"center", writingMode: "tb-rl", direction:"rtl", textOrientation:"sideways", textAnchor:"middle", strokeWidth:"0.264583" }}
         x="-107.87136"
         y="37.654007"
         role="line"
         id="tspan1639">БЕНУАР 2</tspan></text><image
       width="3.864563"
       height="3.864563"
       preserveAspectRatio="none"
       href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAA3NCSVQICAjb4U/gAAAACXBIWXMA&#10;AA5oAAAOaAH5RyxrAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAwBQTFRF&#10;////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyO34QAAAP90Uk5TAAECAwQFBgcICQoLDA0ODxAR&#10;EhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElK&#10;S0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKD&#10;hIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8&#10;vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T1&#10;9vf4+fr7/P3+6wjZNQAAGIlJREFUGBntwQu4lWPeP/Dv2nu3szsnJRHJoeQQEhrUOOUYmTSMmESx&#10;csxhot5xzKgZoXEuldOgMg4RIY0QckqKMuVQU+pBh13t2nd777W+/3n/1/Ve1/sO1lr3cz/3eu77&#10;2b/PB0i4sk6nX/fInPlL12yu27xm6fw3J/2hz15lEPVDu/RMxZ+qnjGkLUTSdRnxQZa/JPvedZ0g&#10;EqvkyDuWMp8v/9wjBZFEp37Ownx2IkTiHPYWCze7G0Si7PUMtWSf6giRGG3uq6GubeN2gEiE0v/a&#10;zDA2Di+B8F/zmQzrxaYQvtvrS4b3eUcIvx2/gSbW/hrCZ1fW0UxNGsJb5RNp7v4yCD+1eodRmN0C&#10;wkflbzMas8ogPDSRUbkHwj/DGJ0hEL45oY7RqekJ4ZfOlYzSjx0gfNJyGaO1sAmEP8reYNSeT0F4&#10;42ZGbxiEL9pWMXrrWkB44kHa8GcIP+xdSxuq20N44Rna8QiEDw6lJZn9ITwwh7a8AuG+k2nP0RCu&#10;Sy2kPR9BuO4w2nQAhONG06YbIRy3hDZ9AuG2TrSrPYTTrqddl0E4bR7tmgXhsnZZ2lXTAsJhQ2nb&#10;ORAOe422TYVwV4NttG09hLv2pn1tIZzVh/b9GsJZ19C+NISzxtO+cRDOeo32TYdw1vu0700IZy2i&#10;fR9BOOtb2rcEwllrad8qCGdV0b61EM76kfathHDWN7RvMYSzFtK+DyGc9S7tmw3hrJm073kIZz1A&#10;++6EcNaVtG8IhLNOon1HQThrD9rXGsJZpVtp2w8QDptO2x6HcNgg2tYPwmE71NGu6sYQLptDu2ZA&#10;OG0Y7RoM4bQOtCqzI4TbFtCmdyEcdxNtGg7huK60qROE696nPW9COO8oWpPtDuG+l2jLVAgP7Juh&#10;HTV7QPhgMu24B8IL7atpw6bWEH74C234I4QnWq5n9FY3gvDFVYzeIAhvpJ5h1CZBeKTRfEZrbjmE&#10;T9qvYZRWtIHwy+GK0ak6EMI35zEy2X4Q/hnDqNwI4aGSFxmNaSkIHzV+nlGYWgHhp9RtNJa9AcJf&#10;Z22lmaozIHzWbRVNLO8K4be28xjeO60hfNfwcYY1sRwiAS5czTBW/R4iGRr9cRN1VV5fAZEYre+t&#10;oY5td7WCSJQ9prJg2Sc7QCRO9zdZmFkHQyTSnte8nWFudXOu2h0iuVoPmr6Vv2TLcwNbQSRdo76P&#10;fMefWjmxTwVEPdH8sIGjp7zy9qfLVi379O1Xnv7Ted2bQQghhBBCCCGEEEIIIYQQQgghhBBCCCGE&#10;EEII4ZPy3X915hVjHn9j8Q8rFs19ZcqdF/ZoAVFftL3oZcWfWP3i0A4Qidf5uvez/CWLxx4MkWDt&#10;Rn/JPN4/txwimZrfvpUF+OHmJhDJUz5sLQsUpMsgkiU14FtqWHIiRJIc+Sk13dsQIjGG1lLbZ10g&#10;kqHsfoax9XSIJGj5BsOp+Q2E/zovY1i1/SF8d2Ilw6s7G8JvJ9XRRN0ACJ/ts5FmMgMh/LX9MprK&#10;nAHhq7LZNPdjGwhPPcAoPAfhp0sYjQEQPupZy2is3wnCPyULGZUZEP4ZyOicD+Gb7VYwOpUtITxz&#10;LaM0AsIvLdYzSqvLIbzyZ0ZrIIRP2lczWgshfDKWUTsewiNfM2qvQvhjf0ZvXwhv3MDo3QjhjY8Z&#10;vbcgfNGeFmxrBOGJS2nDCRCemEUb/gLhh8Y1tGE+hB8604psKwgvHEM7ToLwwrm04wIILwynHddD&#10;eGEc7bgLwgvTaMeTEF6YSztmQXjhG9rxGYQXqmjHdxBeULQjgPCCoh0BhBcU7QggvKBoRwDhBUU7&#10;AggvKNoRQHhB0Y4AwguKdgQQXlC0I4DwgqIdAYQXFO0IILygaEcA4QVFOwIILyjaEUB4QdGOAMIL&#10;inYEEF5QtCOA8IKiHQGEFxTtCCC8oGhHAOEFRTsCCC8o2hFAeEHRjgDCC4p2BBBeULQjgPCCoh0B&#10;hBcU7QggvKBoRwDhBUU7AggvKNoRQHhB0Y4AwguKdgQQXlC0I4DwgqIdAYQXFO0IILygaEcA4QVF&#10;OwIILyjaEUB4QdGOAMINzXdBLop2BBAOqPjtcyqNXBTtCCDi1uCUv20mmUYuinYEELEqOXrCOv5/&#10;aeSiaEcAEaNu41bzf6SRi6IdAURcSs+cy/8ljVwU7Qgg4tH8muX8P9LIRdGOACIOe96zmf8hjVwU&#10;7Qggiu/X0zP8iTRyUbQjgCiysoGf8uekkYuiHQFEcZ35T/68NHJRtCOAKKajP+QvSSMXRTsCiOI5&#10;6FX+sjRyUbQjgCiWjk9lmUMauSjaEUAUx4731TCnNHJRtCOAKIbtbt7MPNLIRdGOAKIIev6TeaWR&#10;i6IdAYR1zR/KMr80clG0I4Cw7fRVLEQauSjaEUDYteM0FiaNXBTtCCCsOn89C5RGLop2BBAWdZzF&#10;gqWRi6IdAYQ9g7ewcGnkomhHAGFLo8epI41cFO0IICzp/Dm1pJGLoh0BhB3nbKaeNHJRtCOAsKHh&#10;g9SVRi6KdgQQFnT8hNrSyEXRjqoxkRl1Wb8jdk9BAH03UF8auSj6YfWDvRugnisdyzDSyEXRGxvu&#10;2B71WcXzDCWNXBQ9suH6CtRb289lOGnkouiVVUegntp1MUNKIxdFv2w7H/XSAd8xrDRyUfTN2BLU&#10;P0dXMrQ0clH0zjjUO2dtY3hp5KLon8GoZ4ZlaSCNXBT9U9MT9UlqLI2kkYuih75vhnrkrzSTRi6K&#10;PhqF+mM0DaWRi6KPqtqivriBptLIRdFLD6CeuIbG0shF0UuqKeqFS2gujVwU/fRb1AeDsjSXRi6K&#10;fnoa9cDZGUYgjVwU/bSxHInXt5ZRSCMXRU8diqTrvY2RSCMXRU/1RcLts5HRuBi5KHpqKJKt5VJG&#10;Ynm6IXJR9NStSLTS1xmFZRc0QG6KnhqPRLubEVg8oBT5KHrqTiTZIJpb1r8E+Sl6ajgSrMc2mtp4&#10;bTkKoeipgUiuXdbQUObhNiiMoqcOR2JVfExDcw5EoRT9tK4UifU0zQT9UThFP01BYl1JM9N2gAZF&#10;P52FpOpSTRNrz4IWRS8tKEFCNZhPEy+2hR5FL/VGUt1OA5XnQ5eij15DUh2RYXgL94Q2RQ9lDkBC&#10;Nf2G4T3ZCPoUPfQIkmoSQ6u9AmEo+idoh4Tqy9DWHIlQFL1T1Q0JteMPDOvdnRCOom9qT0JSzWBY&#10;zzZESIq+uQBJNZBhPViCsBT9snUwkqpZwJBuQniKXvmsCxJrLMOpuxgGFH1yz3ZIrE41DKX6DJhQ&#10;9Ebd872QYK8ylOrjYETRE9/dvDOSrA9DqTkFZhTtyASR+dc7T9w66KgyJFrDrxhGXT8YUrQjgNAx&#10;gmFkBsCUoh0BhIadqxhCdjCMKdoRQGh4kmFcDnOKdgQQhTuCYYxFBBTtCCAK9xZDeLkEEVC0I4Ao&#10;2JEM4fNmiIKiHQFEwWZS39qOiISiHQFEobpRX00vREPRjgCiUM9R3xBERNGOAKJA+2ap7VFERdGO&#10;AKJAT1LbsiaIiqIdAURh9qyjrpruiIyiHQFEYR6mtusQHUU7AoiCtK+hrtkliI6iHQFEQe6hrrXt&#10;ECFFOwKIQjTbQl39ECVFOwKIQlxEXS8hUop2BBCF+ICatuyGSCnaEUAUYD/qGo5oKdqx8Xwrzjv1&#10;8L2aIznupqZFDRAtRf98O/WaHikkQfla6skeiYgp+ulfY/aF//pT00RETdFb806A716jnk07IGqK&#10;Hnu7J7y2a4Z6bkHkFL02uQk8dhP1rGuGyCn6bdmh8FZqOfVch+gpeq52KHx1HPWsaYToKXpvBDz1&#10;APVcDgsU/Xc7/PQvallRDgsUE+AG+Kgr9aRhg2ICZE+Hh/6LWtY3gg2KSbCpC/zzPrX8BVYoJsKX&#10;5fBNmwx11O0GK7YwGUbCN+dTy7Ow41smw5b28Myz1NITdrzLhHgGfinfTB2fwpJpTIru8EpvarkA&#10;loxjUsyEV+6hjuqmsGQ4E6MHfPINdTwDWwYwMWbBI+2o5Tew5WgmR0/4oy91bNwOtnRicsyBP26n&#10;jkdhTZMsk+MYeOMN6ugNe95ncsyFL1KV1PB9KewZwQTpDU90po7xsKgLE2QePPF76ugHm5YxQU6B&#10;H+6jhkxL2DSWCfIx/PAhNXwAq3oySU6HD8q3UcNtsKp0LRNkQQoeOJQ6esGuR5kk/eCBy6ihqhx2&#10;9WKSLCqB+yZQw8uw7WUmydlw3+vUcB1s2y/DBFlSAuctpYbesG4yk+RcuC6lqKENrNtlKxNkaSkc&#10;144aVqMIRjNJzofjfkUNL6MImq9lgnxdBredQw1/QjEMY5IMgdtGUsOZKIbSmUyQFeVw2gRq2BNF&#10;0fxLJshQOO11Fq46heLYewOTY2VDuGwpC7cMxdK7jslxORyWUizcP1A0VzI5VlfAXTtRw2MonolM&#10;jqvhrv2p4TYUT/kbTIzvG8FZh1PDxSiiBhOYGMPhrGOo4WQU1eW1TIgfm8BVfahhfxTXseuZECPh&#10;qrOooRWKbM/FTIb1zeCoQdRQjmJr9jKT4SY46jIWLoPiKxkaMAkqW8BNw1m4zYhD4xs3MwFGwU23&#10;sHA/IB5t7quh9za1gpPuYOFWIC57TqP3RsNJ97NwSxCfQ+5dQb9VtYaLHmXh5iNWB938KX02Fi6a&#10;xsLNRdx2u/yNGvpqa1s4aCoL9x4cUNK2W5+Lb534yoLVQXFV09Q4OGgiC7cQ9dkFNFXdDu65m4X7&#10;FvVZ2Vc0dR/ccysLtxb12u9palt7OOcPLJxCvVb6JU2Nh3PS1NAA9drvaKqmA1wzgBq2R71W8gVN&#10;TYJrTqOGXVG/9aep2j3gmKOpYV/Ub6nPaOoxOOYQajgM9VxfmqrrBLfsTQ3Hob77hKaeglt2oob+&#10;qO9OpalMFzilCTWMRL33AU1Ng1NSWRbuMdR7J9BU9gA4ZRMLNw/iXZp6Dk75joXbAHEsjR0El3xI&#10;DW0g3qKpl+CSJ6jhKIheNNYdDvkjNQyBwBs0NRMO6U8NYyHwKxrrAXd0pYaXIIBXaWoW3FGRZeGW&#10;QgCH0lhPuGMFC1dbAQG8RFNz4I7XqeE4COBgGjsGzriXGkZD/NvzNDUXzricGj6E+LcDsjTVG67o&#10;TQ11LSD+bRpNzYMrdqOOvhD/tm+Gpk6GI1JbqeEeiP/2FE19DFd8Rg1fQPy3TnU0dToc8Qx17IQk&#10;2vmgbt0P63HEUb2OPvb4E048+dTTWiOPx2lqQQpuuIk6BiCJ3uZ/GI889qylqX5wQy/qmIwEapfl&#10;f6jZHXlMoqlFJXBC+VZqWFOK5LmCPzEZeXSooamz4IbXqeNEJM87/Im6vZDHeJpaUgInXE8dTyFx&#10;ds7yp55AHu230dS5cEJ36tjaFElzJX9GpjPyuI+mlpbCBaWV1DEISTOXP2cK8mhXTVPnwwkvUMeb&#10;SJids/w52f2Qxzia+roMLriCOrK7Ilmu5c97Fnm03UJTg+GC/ahlJBKl5Cv+vOyByOMOmlpeDhcE&#10;1PElEuUU/pIXkUfrKpoaChc8TS2HIkle5S/qjjxG09TKhnDAYGoZjwTZO8tfNBN5bL+Jpi6HAzpS&#10;i2qH5Pgrc+iBPG6lqdUVcMByarkTidFkI3OYhTxaVNLUVXDAg9RS1QpJcQlz6ok8bqSp7xshfkdQ&#10;zygkRGoxc5qDPJqto6nhcMBX1LKhGZLhd8zjWOQxgqZ+bIL43UQ9I5AIZcuYx7vIo8mPNDUS8etI&#10;PT80QhJcxLxORB5/oKn1zRC/d6jnSiTAdquY14fIo1FAUzcifkOoZ1U5/HcNC3Aq8riKpipbIHYt&#10;qqnnaniv2VoWYH4KuW33HU2NQvymUc+mdvDdLSzIGcjjMpra1AqxO5WapsBzO25iQRamkFvDlTQ1&#10;GrEr+56ajoPfprBAv0UeaZqqao3YjaOmL8vhs5NZqMUlyK3Bcpq6A7E7mLpGwmONl7NgA5DHhTS1&#10;tS1i9zk1be0Af93Fwi0tRW5lX9HUOMTuWuqaDm91q6OG85HHQJqqboe4Na+krlPhqdL51PF1GXIr&#10;/SdN3YfY3UZdy5vDT9dSzxDkcQ5NbWuPuO1QRV3Pwkv7baWeFeXIreQLmhqP2N1FbVfCQ40XU9cl&#10;yOO3NFXTAXFrp6hrW3f451Fqm4o8UgtpahJi9yC1fdsCvhlIfd2Qzxk0VbsH4tahltqeh2f2qaK2&#10;6cgrNZ+mHkPsHqW+YfBKxSJqyx6E/PrQVF0nxK1ThtpqDoNPJlDfcyjEhzT1FGI3jfqWt4Q/hlBf&#10;tisKcSJNZbogbl0ZwlvbwRcn11Hf31GY92hqGmL3EkN4vhR+OHgz9WX3Q2GOo6nsAYjb4QzjYXhh&#10;tzUMYSoK9TZNPYfYzWAYt8EDLRczhEwXFKoXTWUPQtw6VjOMy+G8hm8xjMko3Gyaegmxu4FhZM+G&#10;40qmMIz1rVG4I2isO+LWcCnD2HY8nFbyGEO5BDpeo6mZiF1vhrK5OxxW9hRD+aQEOg6jsR6I3TSG&#10;UtkLzmrwd4aSPRx6ZtDULMRu500MpbovHFU+neFMhKZuNHYUYnc1w6kbDCdt9wrDWb8DdL1AU3MQ&#10;u7LPGNIIOKjidYaUhrauWZo6BrE7IsuQ7k7BNTt9wJA+LoG+Z2hqLuI3mWH9rQHccvBKhlTXHSHs&#10;m6Gp3ojdDusY1sxGcEn/LQxrFEJ5mqbmIX4XMbQFe8MZqZuyDOujMoTSOUNTJyN2qTcY2uZz4IiK&#10;qQxta2eE9ARNfYz47biG4T1cARfs+jHDuxRh7VlLU6cjfsdmGN6ifRC/AZUM71WEN5mmFqQQv1to&#10;oGogYtbiaRpY1w7h7V5DU79B/ErfpIlHGyNOR/+LJs6EiQk09Q84oN0PNLH4MMSm/I4sTTwOI7tu&#10;o6HsHnDACVmayE7YHvE4YAGNfN0cZu6nqdvhgttp5scLUyi+5uNqaWTzfjC0czUNrS6DA8reoaH3&#10;DkSRpQZ9TzPZfjD2V5o6DS7YZS0N1f21GYrpkHk0dSvMtd1KQ0/CCadkaWrNOSiaHR7O0NT0FCIw&#10;loa+gBvuoLkP+qAomo5YT2OLmyEKratoprYcTih7jRFY0L8EtrW4cT3NbdgL0RhDQwfADY0/YBSW&#10;nFcGm7YfVckIZE5CRFptopkBcESrJYzE10PKYUvrMZsZiesQmVE0Mwau2HUlo7Hyiqaw4ZCHtjAa&#10;DyE6LStpZCKc0WUdI7LlyRNKEa0Wly1gVKaWIEI30cj9cEePLYzM6jv2R3R6PVHNyLxWjig1W08T&#10;d8EhJ9cyQp9etSOisN/IpYzQ+40RrZE0MRouOS/LKNW9PGg3GCk//p5vGalFLRGxJj/SwM1wytWM&#10;2tcP/64twmk98O+bGLFvdkLkhtPA9XDLGFqw+L7fbA8tJftdOH5BhpFbswei1+h7hncaHDOZVmTm&#10;T76u7z7lKMAu/f48ZzOt2HAAbLiK4bWGY0r/Rnvqls2486JeO6Xwc1oc2HfYuBcWVNKaH7vBiorV&#10;DGspnJO6m7ZlN3/35UezX3j8/jEjr7lhzL2Tp85488MvKmnbqn1gyeUM61E4aAQT6asOsKXhSoZ0&#10;MVx0YR2TZ1Fb2DOU4WQ7wkmnVzNp5m0Pi8qXM5QZcFTPSibL7CawajBD6Q1XdV3DJHmhIewq+5oh&#10;LEnBWR2XMTkmlcG28xjCUDiszXwmRN2VsC/1HrUFjeGyZv9gIqw7DsVwcIa6+sBtDR9hAny+B4rj&#10;AWqaCOf9voq+m94URdJiGbV82xTu67yQfhuVQtF02UQNmZ7wQcUEemxLfxRTnywLdw088btN9NWS&#10;riiuYSzYlfDGXp/STw80QrENybAg2YvhkYYP0EPfn4oYnLmNBcgMgl/6b6RvZrRBLI5awbyC0+Cb&#10;jh/TK1svQVyaP8E8JrWEf8r/tI3++KQzYnTmcubw1THwU+fZ9ETt6AaIVfmlq/kL1oyqgLfOWUMf&#10;vLM/Yldx6Xv8qeopJ5fCZ83vzdB1PwxMwQkdrn9nC/+3uRc1h/cO/oBOyzzQEu4o3f+C0eOfmT1r&#10;0s0XHt+5MRKhJL2e7vrwEAjb2jxGR61Pl0AUQc/P6aBt97eGKI4GQ76iY2of3g2ieEoHfE6HZB7f&#10;A6K4Umd8TEdkp3SGiMEJb9MFz+8PEZOjXmXMaqZ0g4jRIc9lGZ/glnYQMdv3iWrGY96AcggHNB/y&#10;TpbFph47BMIZu9/4FYvp65GtIdzyq4c2sDhW3XUohIManvliDW37/v6jUhCuan3FR7Ro/aTjSyHc&#10;tvO5k5fThiX3nlIO4YWOg59awyitfnzgzhBe2efSZ9cxChtfvKILhI9KDrrm5TU0UPX+Q+nDyiB8&#10;1qz7ebc9s6iamlbOuK3/3iUQCVGy+0nDHvzHauZV+fnMCTcM+nUriCRq1rXnKWcPufqmsROenvHW&#10;/GXBlkzVDyuWzJ/7+vSnJ99384UndGkKkcf/A7UZ7onu8CmKAAAAAElFTkSuQmCC&#10;"
       id="image1-8"
       x="65.470306"
       y="97.79702" /><image
       width="3.864563"
       height="3.864563"
       preserveAspectRatio="none"
       href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAA3NCSVQICAjb4U/gAAAACXBIWXMA&#10;AA5oAAAOaAH5RyxrAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAwBQTFRF&#10;////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&#10;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyO34QAAAP90Uk5TAAECAwQFBgcICQoLDA0ODxAR&#10;EhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElK&#10;S0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKD&#10;hIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8&#10;vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T1&#10;9vf4+fr7/P3+6wjZNQAAGIlJREFUGBntwQu4lWPeP/Dv2nu3szsnJRHJoeQQEhrUOOUYmTSMmESx&#10;csxhot5xzKgZoXEuldOgMg4RIY0QckqKMuVQU+pBh13t2nd777W+/3n/1/Ve1/sO1lr3cz/3eu77&#10;2b/PB0i4sk6nX/fInPlL12yu27xm6fw3J/2hz15lEPVDu/RMxZ+qnjGkLUTSdRnxQZa/JPvedZ0g&#10;EqvkyDuWMp8v/9wjBZFEp37Ownx2IkTiHPYWCze7G0Si7PUMtWSf6giRGG3uq6GubeN2gEiE0v/a&#10;zDA2Di+B8F/zmQzrxaYQvtvrS4b3eUcIvx2/gSbW/hrCZ1fW0UxNGsJb5RNp7v4yCD+1eodRmN0C&#10;wkflbzMas8ogPDSRUbkHwj/DGJ0hEL45oY7RqekJ4ZfOlYzSjx0gfNJyGaO1sAmEP8reYNSeT0F4&#10;42ZGbxiEL9pWMXrrWkB44kHa8GcIP+xdSxuq20N44Rna8QiEDw6lJZn9ITwwh7a8AuG+k2nP0RCu&#10;Sy2kPR9BuO4w2nQAhONG06YbIRy3hDZ9AuG2TrSrPYTTrqddl0E4bR7tmgXhsnZZ2lXTAsJhQ2nb&#10;ORAOe422TYVwV4NttG09hLv2pn1tIZzVh/b9GsJZ19C+NISzxtO+cRDOeo32TYdw1vu0700IZy2i&#10;fR9BOOtb2rcEwllrad8qCGdV0b61EM76kfathHDWN7RvMYSzFtK+DyGc9S7tmw3hrJm073kIZz1A&#10;++6EcNaVtG8IhLNOon1HQThrD9rXGsJZpVtp2w8QDptO2x6HcNgg2tYPwmE71NGu6sYQLptDu2ZA&#10;OG0Y7RoM4bQOtCqzI4TbFtCmdyEcdxNtGg7huK60qROE696nPW9COO8oWpPtDuG+l2jLVAgP7Juh&#10;HTV7QPhgMu24B8IL7atpw6bWEH74C234I4QnWq5n9FY3gvDFVYzeIAhvpJ5h1CZBeKTRfEZrbjmE&#10;T9qvYZRWtIHwy+GK0ak6EMI35zEy2X4Q/hnDqNwI4aGSFxmNaSkIHzV+nlGYWgHhp9RtNJa9AcJf&#10;Z22lmaozIHzWbRVNLO8K4be28xjeO60hfNfwcYY1sRwiAS5czTBW/R4iGRr9cRN1VV5fAZEYre+t&#10;oY5td7WCSJQ9prJg2Sc7QCRO9zdZmFkHQyTSnte8nWFudXOu2h0iuVoPmr6Vv2TLcwNbQSRdo76P&#10;fMefWjmxTwVEPdH8sIGjp7zy9qfLVi379O1Xnv7Ted2bQQghhBBCCCGEEEIIIYQQQgghhBBCCCGE&#10;EEII4ZPy3X915hVjHn9j8Q8rFs19ZcqdF/ZoAVFftL3oZcWfWP3i0A4Qidf5uvez/CWLxx4MkWDt&#10;Rn/JPN4/txwimZrfvpUF+OHmJhDJUz5sLQsUpMsgkiU14FtqWHIiRJIc+Sk13dsQIjGG1lLbZ10g&#10;kqHsfoax9XSIJGj5BsOp+Q2E/zovY1i1/SF8d2Ilw6s7G8JvJ9XRRN0ACJ/ts5FmMgMh/LX9MprK&#10;nAHhq7LZNPdjGwhPPcAoPAfhp0sYjQEQPupZy2is3wnCPyULGZUZEP4ZyOicD+Gb7VYwOpUtITxz&#10;LaM0AsIvLdYzSqvLIbzyZ0ZrIIRP2lczWgshfDKWUTsewiNfM2qvQvhjf0ZvXwhv3MDo3QjhjY8Z&#10;vbcgfNGeFmxrBOGJS2nDCRCemEUb/gLhh8Y1tGE+hB8604psKwgvHEM7ToLwwrm04wIILwynHddD&#10;eGEc7bgLwgvTaMeTEF6YSztmQXjhG9rxGYQXqmjHdxBeULQjgPCCoh0BhBcU7QggvKBoRwDhBUU7&#10;AggvKNoRQHhB0Y4AwguKdgQQXlC0I4DwgqIdAYQXFO0IILygaEcA4QVFOwIILyjaEUB4QdGOAMIL&#10;inYEEF5QtCOA8IKiHQGEFxTtCCC8oGhHAOEFRTsCCC8o2hFAeEHRjgDCC4p2BBBeULQjgPCCoh0B&#10;hBcU7QggvKBoRwDhBUU7AggvKNoRQHhB0Y4AwguKdgQQXlC0I4DwgqIdAYQXFO0IILygaEcA4QVF&#10;OwIILyjaEUB4QdGOAMINzXdBLop2BBAOqPjtcyqNXBTtCCDi1uCUv20mmUYuinYEELEqOXrCOv5/&#10;aeSiaEcAEaNu41bzf6SRi6IdAURcSs+cy/8ljVwU7Qgg4tH8muX8P9LIRdGOACIOe96zmf8hjVwU&#10;7Qggiu/X0zP8iTRyUbQjgCiysoGf8uekkYuiHQFEcZ35T/68NHJRtCOAKKajP+QvSSMXRTsCiOI5&#10;6FX+sjRyUbQjgCiWjk9lmUMauSjaEUAUx4731TCnNHJRtCOAKIbtbt7MPNLIRdGOAKIIev6TeaWR&#10;i6IdAYR1zR/KMr80clG0I4Cw7fRVLEQauSjaEUDYteM0FiaNXBTtCCCsOn89C5RGLop2BBAWdZzF&#10;gqWRi6IdAYQ9g7ewcGnkomhHAGFLo8epI41cFO0IICzp/Dm1pJGLoh0BhB3nbKaeNHJRtCOAsKHh&#10;g9SVRi6KdgQQFnT8hNrSyEXRjqoxkRl1Wb8jdk9BAH03UF8auSj6YfWDvRugnisdyzDSyEXRGxvu&#10;2B71WcXzDCWNXBQ9suH6CtRb289lOGnkouiVVUegntp1MUNKIxdFv2w7H/XSAd8xrDRyUfTN2BLU&#10;P0dXMrQ0clH0zjjUO2dtY3hp5KLon8GoZ4ZlaSCNXBT9U9MT9UlqLI2kkYuih75vhnrkrzSTRi6K&#10;PhqF+mM0DaWRi6KPqtqivriBptLIRdFLD6CeuIbG0shF0UuqKeqFS2gujVwU/fRb1AeDsjSXRi6K&#10;fnoa9cDZGUYgjVwU/bSxHInXt5ZRSCMXRU8diqTrvY2RSCMXRU/1RcLts5HRuBi5KHpqKJKt5VJG&#10;Ynm6IXJR9NStSLTS1xmFZRc0QG6KnhqPRLubEVg8oBT5KHrqTiTZIJpb1r8E+Sl6ajgSrMc2mtp4&#10;bTkKoeipgUiuXdbQUObhNiiMoqcOR2JVfExDcw5EoRT9tK4UifU0zQT9UThFP01BYl1JM9N2gAZF&#10;P52FpOpSTRNrz4IWRS8tKEFCNZhPEy+2hR5FL/VGUt1OA5XnQ5eij15DUh2RYXgL94Q2RQ9lDkBC&#10;Nf2G4T3ZCPoUPfQIkmoSQ6u9AmEo+idoh4Tqy9DWHIlQFL1T1Q0JteMPDOvdnRCOom9qT0JSzWBY&#10;zzZESIq+uQBJNZBhPViCsBT9snUwkqpZwJBuQniKXvmsCxJrLMOpuxgGFH1yz3ZIrE41DKX6DJhQ&#10;9Ebd872QYK8ylOrjYETRE9/dvDOSrA9DqTkFZhTtyASR+dc7T9w66KgyJFrDrxhGXT8YUrQjgNAx&#10;gmFkBsCUoh0BhIadqxhCdjCMKdoRQGh4kmFcDnOKdgQQhTuCYYxFBBTtCCAK9xZDeLkEEVC0I4Ao&#10;2JEM4fNmiIKiHQFEwWZS39qOiISiHQFEobpRX00vREPRjgCiUM9R3xBERNGOAKJA+2ap7VFERdGO&#10;AKJAT1LbsiaIiqIdAURh9qyjrpruiIyiHQFEYR6mtusQHUU7AoiCtK+hrtkliI6iHQFEQe6hrrXt&#10;ECFFOwKIQjTbQl39ECVFOwKIQlxEXS8hUop2BBCF+ICatuyGSCnaEUAUYD/qGo5oKdqx8Xwrzjv1&#10;8L2aIznupqZFDRAtRf98O/WaHikkQfla6skeiYgp+ulfY/aF//pT00RETdFb806A716jnk07IGqK&#10;Hnu7J7y2a4Z6bkHkFL02uQk8dhP1rGuGyCn6bdmh8FZqOfVch+gpeq52KHx1HPWsaYToKXpvBDz1&#10;APVcDgsU/Xc7/PQvallRDgsUE+AG+Kgr9aRhg2ICZE+Hh/6LWtY3gg2KSbCpC/zzPrX8BVYoJsKX&#10;5fBNmwx11O0GK7YwGUbCN+dTy7Ow41smw5b28Myz1NITdrzLhHgGfinfTB2fwpJpTIru8EpvarkA&#10;loxjUsyEV+6hjuqmsGQ4E6MHfPINdTwDWwYwMWbBI+2o5Tew5WgmR0/4oy91bNwOtnRicsyBP26n&#10;jkdhTZMsk+MYeOMN6ugNe95ncsyFL1KV1PB9KewZwQTpDU90po7xsKgLE2QePPF76ugHm5YxQU6B&#10;H+6jhkxL2DSWCfIx/PAhNXwAq3oySU6HD8q3UcNtsKp0LRNkQQoeOJQ6esGuR5kk/eCBy6ihqhx2&#10;9WKSLCqB+yZQw8uw7WUmydlw3+vUcB1s2y/DBFlSAuctpYbesG4yk+RcuC6lqKENrNtlKxNkaSkc&#10;144aVqMIRjNJzofjfkUNL6MImq9lgnxdBredQw1/QjEMY5IMgdtGUsOZKIbSmUyQFeVw2gRq2BNF&#10;0fxLJshQOO11Fq46heLYewOTY2VDuGwpC7cMxdK7jslxORyWUizcP1A0VzI5VlfAXTtRw2MonolM&#10;jqvhrv2p4TYUT/kbTIzvG8FZh1PDxSiiBhOYGMPhrGOo4WQU1eW1TIgfm8BVfahhfxTXseuZECPh&#10;qrOooRWKbM/FTIb1zeCoQdRQjmJr9jKT4SY46jIWLoPiKxkaMAkqW8BNw1m4zYhD4xs3MwFGwU23&#10;sHA/IB5t7quh9za1gpPuYOFWIC57TqP3RsNJ97NwSxCfQ+5dQb9VtYaLHmXh5iNWB938KX02Fi6a&#10;xsLNRdx2u/yNGvpqa1s4aCoL9x4cUNK2W5+Lb534yoLVQXFV09Q4OGgiC7cQ9dkFNFXdDu65m4X7&#10;FvVZ2Vc0dR/ccysLtxb12u9palt7OOcPLJxCvVb6JU2Nh3PS1NAA9drvaKqmA1wzgBq2R71W8gVN&#10;TYJrTqOGXVG/9aep2j3gmKOpYV/Ub6nPaOoxOOYQajgM9VxfmqrrBLfsTQ3Hob77hKaeglt2oob+&#10;qO9OpalMFzilCTWMRL33AU1Ng1NSWRbuMdR7J9BU9gA4ZRMLNw/iXZp6Dk75joXbAHEsjR0El3xI&#10;DW0g3qKpl+CSJ6jhKIheNNYdDvkjNQyBwBs0NRMO6U8NYyHwKxrrAXd0pYaXIIBXaWoW3FGRZeGW&#10;QgCH0lhPuGMFC1dbAQG8RFNz4I7XqeE4COBgGjsGzriXGkZD/NvzNDUXzricGj6E+LcDsjTVG67o&#10;TQ11LSD+bRpNzYMrdqOOvhD/tm+Gpk6GI1JbqeEeiP/2FE19DFd8Rg1fQPy3TnU0dToc8Qx17IQk&#10;2vmgbt0P63HEUb2OPvb4E048+dTTWiOPx2lqQQpuuIk6BiCJ3uZ/GI889qylqX5wQy/qmIwEapfl&#10;f6jZHXlMoqlFJXBC+VZqWFOK5LmCPzEZeXSooamz4IbXqeNEJM87/Im6vZDHeJpaUgInXE8dTyFx&#10;ds7yp55AHu230dS5cEJ36tjaFElzJX9GpjPyuI+mlpbCBaWV1DEISTOXP2cK8mhXTVPnwwkvUMeb&#10;SJids/w52f2Qxzia+roMLriCOrK7Ilmu5c97Fnm03UJTg+GC/ahlJBKl5Cv+vOyByOMOmlpeDhcE&#10;1PElEuUU/pIXkUfrKpoaChc8TS2HIkle5S/qjjxG09TKhnDAYGoZjwTZO8tfNBN5bL+Jpi6HAzpS&#10;i2qH5Pgrc+iBPG6lqdUVcMByarkTidFkI3OYhTxaVNLUVXDAg9RS1QpJcQlz6ok8bqSp7xshfkdQ&#10;zygkRGoxc5qDPJqto6nhcMBX1LKhGZLhd8zjWOQxgqZ+bIL43UQ9I5AIZcuYx7vIo8mPNDUS8etI&#10;PT80QhJcxLxORB5/oKn1zRC/d6jnSiTAdquY14fIo1FAUzcifkOoZ1U5/HcNC3Aq8riKpipbIHYt&#10;qqnnaniv2VoWYH4KuW33HU2NQvymUc+mdvDdLSzIGcjjMpra1AqxO5WapsBzO25iQRamkFvDlTQ1&#10;GrEr+56ajoPfprBAv0UeaZqqao3YjaOmL8vhs5NZqMUlyK3Bcpq6A7E7mLpGwmONl7NgA5DHhTS1&#10;tS1i9zk1be0Af93Fwi0tRW5lX9HUOMTuWuqaDm91q6OG85HHQJqqboe4Na+krlPhqdL51PF1GXIr&#10;/SdN3YfY3UZdy5vDT9dSzxDkcQ5NbWuPuO1QRV3Pwkv7baWeFeXIreQLmhqP2N1FbVfCQ40XU9cl&#10;yOO3NFXTAXFrp6hrW3f451Fqm4o8UgtpahJi9yC1fdsCvhlIfd2Qzxk0VbsH4tahltqeh2f2qaK2&#10;6cgrNZ+mHkPsHqW+YfBKxSJqyx6E/PrQVF0nxK1ThtpqDoNPJlDfcyjEhzT1FGI3jfqWt4Q/hlBf&#10;tisKcSJNZbogbl0ZwlvbwRcn11Hf31GY92hqGmL3EkN4vhR+OHgz9WX3Q2GOo6nsAYjb4QzjYXhh&#10;tzUMYSoK9TZNPYfYzWAYt8EDLRczhEwXFKoXTWUPQtw6VjOMy+G8hm8xjMko3Gyaegmxu4FhZM+G&#10;40qmMIz1rVG4I2isO+LWcCnD2HY8nFbyGEO5BDpeo6mZiF1vhrK5OxxW9hRD+aQEOg6jsR6I3TSG&#10;UtkLzmrwd4aSPRx6ZtDULMRu500MpbovHFU+neFMhKZuNHYUYnc1w6kbDCdt9wrDWb8DdL1AU3MQ&#10;u7LPGNIIOKjidYaUhrauWZo6BrE7IsuQ7k7BNTt9wJA+LoG+Z2hqLuI3mWH9rQHccvBKhlTXHSHs&#10;m6Gp3ojdDusY1sxGcEn/LQxrFEJ5mqbmIX4XMbQFe8MZqZuyDOujMoTSOUNTJyN2qTcY2uZz4IiK&#10;qQxta2eE9ARNfYz47biG4T1cARfs+jHDuxRh7VlLU6cjfsdmGN6ifRC/AZUM71WEN5mmFqQQv1to&#10;oGogYtbiaRpY1w7h7V5DU79B/ErfpIlHGyNOR/+LJs6EiQk09Q84oN0PNLH4MMSm/I4sTTwOI7tu&#10;o6HsHnDACVmayE7YHvE4YAGNfN0cZu6nqdvhgttp5scLUyi+5uNqaWTzfjC0czUNrS6DA8reoaH3&#10;DkSRpQZ9TzPZfjD2V5o6DS7YZS0N1f21GYrpkHk0dSvMtd1KQ0/CCadkaWrNOSiaHR7O0NT0FCIw&#10;loa+gBvuoLkP+qAomo5YT2OLmyEKratoprYcTih7jRFY0L8EtrW4cT3NbdgL0RhDQwfADY0/YBSW&#10;nFcGm7YfVckIZE5CRFptopkBcESrJYzE10PKYUvrMZsZiesQmVE0Mwau2HUlo7Hyiqaw4ZCHtjAa&#10;DyE6LStpZCKc0WUdI7LlyRNKEa0Wly1gVKaWIEI30cj9cEePLYzM6jv2R3R6PVHNyLxWjig1W08T&#10;d8EhJ9cyQp9etSOisN/IpYzQ+40RrZE0MRouOS/LKNW9PGg3GCk//p5vGalFLRGxJj/SwM1wytWM&#10;2tcP/64twmk98O+bGLFvdkLkhtPA9XDLGFqw+L7fbA8tJftdOH5BhpFbswei1+h7hncaHDOZVmTm&#10;T76u7z7lKMAu/f48ZzOt2HAAbLiK4bWGY0r/Rnvqls2486JeO6Xwc1oc2HfYuBcWVNKaH7vBiorV&#10;DGspnJO6m7ZlN3/35UezX3j8/jEjr7lhzL2Tp85488MvKmnbqn1gyeUM61E4aAQT6asOsKXhSoZ0&#10;MVx0YR2TZ1Fb2DOU4WQ7wkmnVzNp5m0Pi8qXM5QZcFTPSibL7CawajBD6Q1XdV3DJHmhIewq+5oh&#10;LEnBWR2XMTkmlcG28xjCUDiszXwmRN2VsC/1HrUFjeGyZv9gIqw7DsVwcIa6+sBtDR9hAny+B4rj&#10;AWqaCOf9voq+m94URdJiGbV82xTu67yQfhuVQtF02UQNmZ7wQcUEemxLfxRTnywLdw088btN9NWS&#10;riiuYSzYlfDGXp/STw80QrENybAg2YvhkYYP0EPfn4oYnLmNBcgMgl/6b6RvZrRBLI5awbyC0+Cb&#10;jh/TK1svQVyaP8E8JrWEf8r/tI3++KQzYnTmcubw1THwU+fZ9ETt6AaIVfmlq/kL1oyqgLfOWUMf&#10;vLM/Yldx6Xv8qeopJ5fCZ83vzdB1PwxMwQkdrn9nC/+3uRc1h/cO/oBOyzzQEu4o3f+C0eOfmT1r&#10;0s0XHt+5MRKhJL2e7vrwEAjb2jxGR61Pl0AUQc/P6aBt97eGKI4GQ76iY2of3g2ieEoHfE6HZB7f&#10;A6K4Umd8TEdkp3SGiMEJb9MFz+8PEZOjXmXMaqZ0g4jRIc9lGZ/glnYQMdv3iWrGY96AcggHNB/y&#10;TpbFph47BMIZu9/4FYvp65GtIdzyq4c2sDhW3XUohIManvliDW37/v6jUhCuan3FR7Ro/aTjSyHc&#10;tvO5k5fThiX3nlIO4YWOg59awyitfnzgzhBe2efSZ9cxChtfvKILhI9KDrrm5TU0UPX+Q+nDyiB8&#10;1qz7ebc9s6iamlbOuK3/3iUQCVGy+0nDHvzHauZV+fnMCTcM+nUriCRq1rXnKWcPufqmsROenvHW&#10;/GXBlkzVDyuWzJ/7+vSnJ99384UndGkKkcf/A7UZ7onu8CmKAAAAAElFTkSuQmCC&#10;"
       id="image1639"
       x="149.07837"
       y="97.79702" /></g>
       <g ref={circleRef}
     label="Circle"
     groupmode="layer"
     id="layer1"><circle
     onClick={e => choosePlace(e.target)} 
       onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle7"
       cx="155.88388"
       cy="130.118"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle8"
       cx="152.60907"
       cy="130.118"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle9"
       cx="149.43413"
       cy="130.13361"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle10"
       cx="146.35909"
       cy="130.14899"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle13"
       cx="125.39272"
       cy="130.1335"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle14"
       cx="122.31762"
       cy="130.11812"
       label="circle6"
       r="1.25"
       seat="6"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle15"
       cx="119.24259"
       cy="130.11812"
       label="circle7"
       r="1.25"
       seat="7"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle16"
       cx="116.06744"
       cy="130.11812"
       label="circle8"
       r="1.25"
       seat="8"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle17"
       cx="112.89237"
       cy="130.11812"
       label="circle9"
       r="1.25"
       seat="9"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle18"
       cx="109.81734"
       cy="130.11812"
       label="circle10"
       r="1.25"
       seat="10"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle19"
       cx="106.74228"
       cy="130.11812"
       label="circle11"
       r="1.25"
       seat="11"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle20"
       cx="103.66718"
       cy="130.11812"
       label="circle12"
       r="1.25"
       seat="12"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle21"
       cx="100.69212"
       cy="130.11812"
       label="circle13"
       r="1.25"
       seat="13"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle22"
       cx="97.517021"
       cy="130.11812"
       label="circle14"
       r="1.25"
       seat="14"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle23"
       cx="94.541954"
       cy="130.11812"
       label="circle15"
       r="1.25"
       seat="15"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle24"
       cx="91.466957"
       cy="130.11812"
       label="circle16"
       r="1.25"
       seat="16"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle35"
       cx="71.987762"
       cy="130.118"
       label="circle17"
       r="1.25"
       seat="17"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle36"
       cx="68.812683"
       cy="130.118"
       label="circle18"
       r="1.25"
       seat="18"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle37"
       cx="65.73761"
       cy="130.118"
       label="circle19"
       r="1.25"
       seat="19"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle38"
       cx="62.762573"
       cy="130.118"
       label="circle20"
       r="1.25"
       seat="20"
       row="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle41"
       cx="165.509"
       cy="126.41386"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle42"
       cx="162.23419"
       cy="126.41386"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle43"
       cx="159.05925"
       cy="126.42947"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle44"
       cx="155.88408"
       cy="126.44484"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle47"
       cx="152.68008"
       cy="126.46022"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle48"
       cx="149.50508"
       cy="126.44483"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle49"
       cx="146.35909"
       cy="126.44483"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle51"
       cx="127.07967"
       cy="126.44483"
       label="circle8"
       r="1.25"
       seat="8"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle52"
       cx="123.90459"
       cy="126.44483"
       label="circle9"
       r="1.25"
       seat="9"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle53"
       cx="120.82957"
       cy="126.44483"
       label="circle10"
       r="1.25"
       seat="10"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle54"
       cx="117.75452"
       cy="126.44483"
       label="circle11"
       r="1.25"
       seat="11"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle55"
       cx="114.67943"
       cy="126.44483"
       label="circle12"
       r="1.25"
       seat="12"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle56"
       cx="111.70436"
       cy="126.44483"
       label="circle13"
       r="1.25"
       seat="13"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle57"
       cx="108.52927"
       cy="126.44483"
       label="circle14"
       r="1.25"
       seat="14"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle58"
       cx="105.55419"
       cy="126.44483"
       label="circle15"
       r="1.25"
       seat="15"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle59"
       cx="102.47919"
       cy="126.44483"
       label="circle16"
       r="1.25"
       seat="16"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle60"
       cx="99.40419"
       cy="126.44483"
       label="circle17"
       r="1.25"
       seat="17"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle61"
       cx="96.229111"
       cy="126.44483"
       label="circle18"
       r="1.25"
       seat="18"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle62"
       cx="93.154037"
       cy="126.44483"
       label="circle19"
       r="1.25"
       seat="19"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle63"
       cx="90.179001"
       cy="126.44483"
       label="circle20"
       r="1.25"
       seat="20"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle75"
       cx="71.958359"
       cy="126.44483"
       label="circle21"
       r="1.25"
       seat="21"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle76"
       cx="68.883347"
       cy="126.44483"
       label="circle22"
       r="1.25"
       seat="22"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle77"
       cx="65.708344"
       cy="126.44483"
       label="circle23"
       r="1.25"
       seat="23"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle78"
       cx="62.433334"
       cy="126.44483"
       label="circle24"
       r="1.25"
       seat="24"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle79"
       cx="59.358337"
       cy="126.44483"
       label="circle25"
       r="1.25"
       seat="25"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle80"
       cx="56.183304"
       cy="126.44483"
       label="circle26"
       r="1.25"
       seat="26"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle81"
       cx="53.008324"
       cy="126.44483"
       label="circle27"
       r="1.25"
       seat="27"
       row="2"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle93"
       cx="159.15909"
       cy="122.70969"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle94"
       cx="155.88428"
       cy="122.70969"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle95"
       cx="152.70934"
       cy="122.7253"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle96"
       cx="149.53416"
       cy="122.74069"
       label="circle4"
       r="1.25"
       seat="4"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle97"
       cx="146.35909"
       cy="122.75604"
       label="circle5"
       r="1.25"
       seat="5"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle101"
       cx="129.19676"
       cy="122.75568"
       label="circle6"
       r="1.25"
       seat="6"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle102"
       cx="126.12174"
       cy="122.75568"
       label="circle7"
       r="1.25"
       seat="7"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle103"
       cx="122.9466"
       cy="122.75568"
       label="circle8"
       r="1.25"
       seat="8"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle104"
       cx="119.77153"
       cy="122.75568"
       label="circle9"
       r="1.25"
       seat="9"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
       onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle105"
       cx="116.6965"
       cy="122.75568"
       label="circle10"
       r="1.25"
       seat="10"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle106"
       cx="113.62144"
       cy="122.75568"
       label="circle11"
       r="1.25"
       seat="11"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle107"
       cx="110.54636"
       cy="122.75568"
       label="circle12"
       r="1.25"
       seat="12"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle108"
       cx="107.57129"
       cy="122.75568"
       label="circle13"
       r="1.25"
       seat="13"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle109"
       cx="104.3962"
       cy="122.75568"
       label="circle14"
       r="1.25"
       seat="14"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle110"
       cx="101.42113"
       cy="122.75568"
       label="circle15"
       r="1.25"
       seat="15"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle111"
       cx="98.34613"
       cy="122.75568"
       label="circle16"
       r="1.25"
       seat="16"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle112"
       cx="95.271118"
       cy="122.75568"
       label="circle17"
       r="1.25"
       seat="17"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle113"
       cx="92.096039"
       cy="122.75568"
       label="circle18"
       r="1.25"
       seat="18"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle114"
       cx="89.020966"
       cy="122.75568"
       label="circle19"
       r="1.25"
       seat="19"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle127"
       cx="71.95842"
       cy="122.75568"
       label="circle20"
       r="1.25"
       seat="20"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle128"
       cx="68.98336"
       cy="122.75568"
       label="circle21"
       r="1.25"
       seat="21"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle129"
       cx="65.908348"
       cy="122.75568"
       label="circle22"
       r="1.25"
       seat="22"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle130"
       cx="62.733349"
       cy="122.75568"
       label="circle23"
       r="1.25"
       seat="23"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle131"
       cx="59.45834"
       cy="122.75568"
       label="circle24"
       r="1.25"
       seat="24"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle135"
       cx="159.15909"
       cy="119.00552"
       label="circle1"
       r="1.25"
       row="4"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle136"
       cx="155.88428"
       cy="119.00552"
       label="circle2"
       r="1.25"
       seat="2"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle137"
       cx="152.70934"
       cy="119.02113"
       label="circle3"
       r="1.25"
       seat="3"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle138"
       cx="149.53416"
       cy="119.03652"
       label="circle4"
       r="1.25"
       seat="4"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle139"
       cx="146.35909"
       cy="119.05188"
       label="circle5"
       r="1.25"
       seat="5"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle143"
       cx="130.78424"
       cy="119.052"
       label="circle6"
       r="1.25"
       seat="6"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle144"
       cx="127.70924"
       cy="119.052"
       label="circle7"
       r="1.25"
       seat="7"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle145"
       cx="124.5341"
       cy="119.052"
       label="circle8"
       r="1.25"
       seat="8"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle177"
       cx="121.35904"
       cy="119.052"
       label="circle9"
       r="1.25"
       seat="9"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle178"
       cx="118.284"
       cy="119.052"
       label="circle10"
       r="1.25"
       seat="10"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle179"
       cx="115.20895"
       cy="119.052"
       label="circle11"
       r="1.25"
       seat="11"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle180"
       cx="112.13385"
       cy="119.052"
       label="circle12"
       r="1.25"
       seat="12"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle181"
       cx="109.15879"
       cy="119.052"
       label="circle13"
       r="1.25"
       seat="13"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle182"
       cx="105.9837"
       cy="119.052"
       label="circle14"
       r="1.25"
       seat="14"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle183"
       cx="103.00864"
       cy="119.052"
       label="circle15"
       r="1.25"
       seat="15"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle184"
       cx="99.933693"
       cy="119.052"
       label="circle16"
       r="1.25"
       seat="16"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle185"
       cx="96.85862"
       cy="119.052"
       label="circle17"
       r="1.25"
       seat="17"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle186"
       cx="93.68354"
       cy="119.052"
       label="circle18"
       r="1.25"
       seat="18"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle187"
       cx="90.608513"
       cy="119.052"
       label="circle19"
       r="1.25"
       seat="19"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle188"
       cx="87.63343"
       cy="119.052"
       label="circle20"
       r="1.25"
       seat="20"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle222"
       cx="71.958366"
       cy="119.052"
       label="circle21"
       r="1.25"
       seat="21"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle223"
       cx="68.883347"
       cy="119.052"
       label="circle22"
       r="1.25"
       seat="22"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle224"
       cx="65.708344"
       cy="119.052"
       label="circle23"
       r="1.25"
       seat="23"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle225"
       cx="62.433338"
       cy="119.052"
       label="circle24"
       r="1.25"
       seat="24"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle226"
       cx="59.358341"
       cy="119.052"
       label="circle25"
       r="1.25"
       seat="25"
       row="4"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle230"
       cx="159.15909"
       cy="115.30135"
       label="circle1"
       r="1.25"
       row="5"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle231"
       cx="155.88428"
       cy="115.30135"
       label="circle2"
       r="1.25"
       seat="2"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle232"
       cx="152.70934"
       cy="115.31696"
       label="circle3"
       r="1.25"
       seat="3"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle233"
       cx="149.53416"
       cy="115.33236"
       label="circle4"
       r="1.25"
       seat="4"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle234"
       cx="146.35909"
       cy="115.34772"
       label="circle5"
       r="1.25"
       seat="5"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle238"
       cx="132.37172"
       cy="115.348"
       label="circle6"
       r="1.25"
       seat="6"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle239"
       cx="129.29672"
       cy="115.348"
       label="circle7"
       r="1.25"
       seat="7"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle240"
       cx="126.1216"
       cy="115.348"
       label="circle8"
       r="1.25"
       seat="8"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle241"
       cx="122.94653"
       cy="115.348"
       label="circle9"
       r="1.25"
       seat="9"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle242"
       cx="119.87151"
       cy="115.348"
       label="circle10"
       r="1.25"
       seat="10"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle243"
       cx="116.79644"
       cy="115.348"
       label="circle11"
       r="1.25"
       seat="11"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle244"
       cx="113.72136"
       cy="115.348"
       label="circle12"
       r="1.25"
       seat="12"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle245"
       cx="110.74629"
       cy="115.348"
       label="circle13"
       r="1.25"
       seat="13"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle246"
       cx="107.57119"
       cy="115.348"
       label="circle14"
       r="1.25"
       seat="14"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle247"
       cx="104.59612"
       cy="115.348"
       label="circle15"
       r="1.25"
       seat="15"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle248"
       cx="101.52113"
       cy="115.348"
       label="circle16"
       r="1.25"
       seat="16"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle249"
       cx="98.446121"
       cy="115.348"
       label="circle17"
       r="1.25"
       seat="17"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle250"
       cx="95.271042"
       cy="115.348"
       label="circle18"
       r="1.25"
       seat="18"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle251"
       cx="92.195969"
       cy="115.348"
       label="circle19"
       r="1.25"
       seat="19"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle252"
       cx="89.220932"
       cy="115.348"
       label="circle20"
       r="1.25"
       seat="20"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle253"
       cx="86.245872"
       cy="115.348"
       label="circle21"
       r="1.25"
       seat="21"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle268"
       cx="71.958382"
       cy="115.348"
       label="circle22"
       r="1.25"
       seat="22"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle269"
       cx="68.783379"
       cy="115.348"
       label="circle23"
       r="1.25"
       seat="23"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle270"
       cx="65.508369"
       cy="115.348"
       label="circle24"
       r="1.25"
       seat="24"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle271"
       cx="62.433372"
       cy="115.348"
       label="circle25"
       r="1.25"
       seat="25"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle272"
       cx="59.258339"
       cy="115.348"
       label="circle26"
       r="1.25"
       seat="26"
       row="5"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle276"
       cx="155.98413"
       cy="111.59718"
       label="circle1"
       r="1.25"
       row="6"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle277"
       cx="152.70932"
       cy="111.59718"
       label="circle2"
       r="1.25"
       seat="2"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle278"
       cx="149.53438"
       cy="111.61279"
       label="circle3"
       r="1.25"
       seat="3"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle279"
       cx="146.35921"
       cy="111.62819"
       label="circle4"
       r="1.25"
       seat="4"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle282"
       cx="133.85892"
       cy="111.6434"
       label="circle5"
       r="1.25"
       seat="5"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle283"
       cx="130.78386"
       cy="111.628"
       label="circle6"
       r="1.25"
       seat="6"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle284"
       cx="127.70885"
       cy="111.628"
       label="circle7"
       r="1.25"
       seat="7"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle285"
       cx="124.53373"
       cy="111.628"
       label="circle8"
       r="1.25"
       seat="8"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle286"
       cx="121.35867"
       cy="111.628"
       label="circle9"
       r="1.25"
       seat="9"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle287"
       cx="118.28364"
       cy="111.628"
       label="circle10"
       r="1.25"
       seat="10"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle288"
       cx="115.20855"
       cy="111.628"
       label="circle11"
       r="1.25"
       seat="11"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle289"
       cx="112.13348"
       cy="111.628"
       label="circle12"
       r="1.25"
       seat="12"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle290"
       cx="109.15841"
       cy="111.628"
       label="circle13"
       r="1.25"
       seat="13"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle291"
       cx="105.98333"
       cy="111.628"
       label="circle14"
       r="1.25"
       seat="14"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle292"
       cx="103.00826"
       cy="111.628"
       label="circle15"
       r="1.25"
       seat="15"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle293"
       cx="99.933258"
       cy="111.628"
       label="circle16"
       r="1.25"
       seat="16"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle294"
       cx="96.858246"
       cy="111.628"
       label="circle17"
       r="1.25"
       seat="17"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle295"
       cx="93.683167"
       cy="111.628"
       label="circle18"
       r="1.25"
       seat="18"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle296"
       cx="90.608093"
       cy="111.628"
       label="circle19"
       r="1.25"
       seat="19"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle297"
       cx="87.633057"
       cy="111.628"
       label="circle20"
       r="1.25"
       seat="20"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle298"
       cx="84.657997"
       cy="111.628"
       label="circle21"
       r="1.25"
       seat="21"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle314"
       cx="71.958382"
       cy="111.628"
       label="circle22"
       r="1.25"
       seat="22"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle315"
       cx="68.783379"
       cy="111.628"
       label="circle23"
       r="1.25"
       seat="23"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle316"
       cx="65.508369"
       cy="111.628"
       label="circle24"
       r="1.25"
       seat="24"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle317"
       cx="62.433372"
       cy="111.628"
       label="circle25"
       r="1.25"
       seat="25"
       row="6"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle320"
       cx="155.98413"
       cy="107.89301"
       label="circle1"
       r="1.25"
       row="7"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle321"
       cx="152.70932"
       cy="107.89301"
       label="circle2"
       r="1.25"
       seat="2"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle322"
       cx="149.53438"
       cy="107.90862"
       label="circle3"
       r="1.25"
       seat="3"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle323"
       cx="146.35921"
       cy="107.92403"
       label="circle4"
       r="1.25"
       seat="4"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle326"
       cx="135.44678"
       cy="107.93927"
       label="circle5"
       r="1.25"
       seat="5"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle327"
       cx="132.37172"
       cy="107.92381"
       label="circle6"
       r="1.25"
       seat="6"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle328"
       cx="129.29672"
       cy="107.92381"
       label="circle7"
       r="1.25"
       seat="7"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle329"
       cx="126.1216"
       cy="107.92381"
       label="circle8"
       r="1.25"
       seat="8"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle330"
       cx="122.94653"
       cy="107.92381"
       label="circle9"
       r="1.25"
       seat="9"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle331"
       cx="119.87151"
       cy="107.92381"
       label="circle10"
       r="1.25"
       seat="10"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle332"
       cx="116.79644"
       cy="107.92381"
       label="circle11"
       r="1.25"
       seat="11"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle333"
       cx="113.72136"
       cy="107.92381"
       label="circle12"
       r="1.25"
       seat="12"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle334"
       cx="110.74629"
       cy="107.92381"
       label="circle13"
       r="1.25"
       seat="13"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle335"
       cx="107.57119"
       cy="107.92381"
       label="circle14"
       r="1.25"
       seat="14"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle336"
       cx="104.59612"
       cy="107.92381"
       label="circle15"
       r="1.25"
       seat="15"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle337"
       cx="101.52113"
       cy="107.92381"
       label="circle16"
       r="1.25"
       seat="16"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle338"
       cx="98.446121"
       cy="107.92381"
       label="circle17"
       r="1.25"
       seat="17"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle339"
       cx="95.271042"
       cy="107.92381"
       label="circle18"
       r="1.25"
       seat="18"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle340"
       cx="92.195969"
       cy="107.92381"
       label="circle19"
       r="1.25"
       seat="19"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle341"
       cx="89.220932"
       cy="107.92381"
       label="circle20"
       r="1.25"
       seat="20"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle342"
       cx="86.245872"
       cy="107.92381"
       label="circle21"
       r="1.25"
       seat="21"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle343"
       cx="83.17086"
       cy="107.92381"
       label="circle22"
       r="1.25"
       seat="22"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle360"
       cx="71.958382"
       cy="107.92381"
       label="circle23"
       r="1.25"
       seat="23"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle361"
       cx="68.683372"
       cy="107.92381"
       label="circle24"
       r="1.25"
       seat="24"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle362"
       cx="65.608376"
       cy="107.92381"
       label="circle25"
       r="1.25"
       seat="25"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#9c1142", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle363"
       cx="62.433342"
       cy="107.92381"
       label="circle26"
       r="1.25"
       seat="26"
       row="7"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle366"
       cx="155.98413"
       cy="104.18884"
       label="circle1"
       r="1.25"
       row="8"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle367"
       cx="152.70932"
       cy="104.18884"
       label="circle2"
       r="1.25"
       seat="2"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle368"
       cx="149.53438"
       cy="104.20446"
       label="circle3"
       r="1.25"
       seat="3"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle369"
       cx="146.35921"
       cy="104.21986"
       label="circle4"
       r="1.25"
       seat="4"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle372"
       cx="137.03424"
       cy="104.23542"
       label="circle5"
       r="1.25"
       seat="5"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle373"
       cx="133.95918"
       cy="104.22"
       label="circle6"
       r="1.25"
       seat="6"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle374"
       cx="130.88419"
       cy="104.22"
       label="circle7"
       r="1.25"
       seat="7"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle375"
       cx="127.7091"
       cy="104.22"
       label="circle8"
       r="1.25"
       seat="8"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle376"
       cx="124.53403"
       cy="104.22"
       label="circle9"
       r="1.25"
       seat="9"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle377"
       cx="121.45901"
       cy="104.22"
       label="circle10"
       r="1.25"
       seat="10"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle378"
       cx="118.38395"
       cy="104.22"
       label="circle11"
       r="1.25"
       seat="11"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle379"
       cx="115.30885"
       cy="104.22"
       label="circle12"
       r="1.25"
       seat="12"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle380"
       cx="112.33379"
       cy="104.22"
       label="circle13"
       r="1.25"
       seat="13"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle381"
       cx="109.1587"
       cy="104.22"
       label="circle14"
       r="1.25"
       seat="14"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle382"
       cx="106.18363"
       cy="104.22"
       label="circle15"
       r="1.25"
       seat="15"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle383"
       cx="103.10863"
       cy="104.22"
       label="circle16"
       r="1.25"
       seat="16"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle384"
       cx="100.03362"
       cy="104.22"
       label="circle17"
       r="1.25"
       seat="17"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle385"
       cx="96.858543"
       cy="104.22"
       label="circle18"
       r="1.25"
       seat="18"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle386"
       cx="93.783463"
       cy="104.22"
       label="circle19"
       r="1.25"
       seat="19"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle387"
       cx="90.808434"
       cy="104.22"
       label="circle20"
       r="1.25"
       seat="20"
       row="3"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle388"
       cx="87.833374"
       cy="104.22"
       label="circle21"
       r="1.25"
       seat="21"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle389"
       cx="84.758362"
       cy="104.22"
       label="circle22"
       r="1.25"
       seat="22"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle390"
       cx="81.583359"
       cy="104.22"
       label="circle23"
       r="1.25"
       seat="23"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle408"
       cx="71.958344"
       cy="104.22"
       label="circle24"
       r="1.25"
       seat="24"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle409"
       cx="68.883347"
       cy="104.22"
       label="circle25"
       r="1.25"
       seat="25"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle410"
       cx="65.708313"
       cy="104.22"
       label="circle26"
       r="1.25"
       seat="26"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle411"
       cx="62.533333"
       cy="104.22"
       label="circle27"
       r="1.25"
       seat="27"
       row="8"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle414"
       cx="138.62178"
       cy="100.51582"
       label="circle1"
       r="1.25"
       row="9"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle415"
       cx="135.34697"
       cy="100.51582"
       label="circle2"
       r="1.25"
       seat="2"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle416"
       cx="132.17203"
       cy="100.53149"
       label="circle3"
       r="1.25"
       seat="3"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle417"
       cx="129.09698"
       cy="100.54691"
       label="circle4"
       r="1.25"
       seat="4"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle418"
       cx="125.92188"
       cy="100.54691"
       label="circle5"
       r="1.25"
       seat="5"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle419"
       cx="122.84679"
       cy="100.53149"
       label="circle6"
       r="1.25"
       seat="6"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle420"
       cx="119.77176"
       cy="100.53149"
       label="circle7"
       r="1.25"
       seat="7"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle421"
       cx="116.5966"
       cy="100.53149"
       label="circle8"
       r="1.25"
       seat="8"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle428"
       cx="101.77987"
       cy="100.51582"
       label="circle9"
       r="1.25"
       seat="9"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle429"
       cx="98.704842"
       cy="100.51582"
       label="circle10"
       r="1.25"
       seat="10"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle430"
       cx="95.629768"
       cy="100.51582"
       label="circle11"
       r="1.25"
       seat="11"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle431"
       cx="92.554672"
       cy="100.51582"
       label="circle12"
       r="1.25"
       seat="12"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle432"
       cx="89.579613"
       cy="100.51582"
       label="circle13"
       r="1.25"
       seat="13"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle433"
       cx="86.40451"
       cy="100.51582"
       label="circle14"
       r="1.25"
       seat="14"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle434"
       cx="83.429443"
       cy="100.51582"
       label="circle15"
       r="1.25"
       seat="15"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle435"
       cx="80.354446"
       cy="100.51582"
       label="circle16"
       r="1.25"
       seat="16"
       row="9"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle489"
       cx="152.90909"
       cy="88.827515"
       label="circle1"
       r="1.25"
       row="10"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle490"
       cx="149.63428"
       cy="88.827515"
       label="circle2"
       r="1.25"
       seat="2"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle491"
       cx="146.45934"
       cy="88.843124"
       label="circle3"
       r="1.25"
       seat="3"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle492"
       cx="143.38429"
       cy="88.858559"
       label="circle4"
       r="1.25"
       seat="4"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle493"
       cx="140.20921"
       cy="88.858559"
       label="circle5"
       r="1.25"
       seat="5"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle494"
       cx="137.13416"
       cy="88.843124"
       label="circle6"
       r="1.25"
       seat="6"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle495"
       cx="134.05916"
       cy="88.843124"
       label="circle7"
       r="1.25"
       seat="7"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle496"
       cx="130.88408"
       cy="88.843124"
       label="circle8"
       r="1.25"
       seat="8"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle497"
       cx="127.70904"
       cy="88.843124"
       label="circle9"
       r="1.25"
       seat="9"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle498"
       cx="124.63402"
       cy="88.843124"
       label="circle10"
       r="1.25"
       seat="10"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle499"
       cx="121.55894"
       cy="88.843124"
       label="circle11"
       r="1.25"
       seat="11"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle500"
       cx="95.200508"
       cy="88.828003"
       label="circle12"
       r="1.25"
       seat="12"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle501"
       cx="92.225449"
       cy="88.828003"
       label="circle13"
       r="1.25"
       seat="13"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle502"
       cx="89.050346"
       cy="88.828003"
       label="circle14"
       r="1.25"
       seat="14"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle503"
       cx="86.075279"
       cy="88.828003"
       label="circle15"
       r="1.25"
       seat="15"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle504"
       cx="83.000282"
       cy="88.828003"
       label="circle16"
       r="1.25"
       seat="16"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle505"
       cx="79.92527"
       cy="88.828003"
       label="circle17"
       r="1.25"
       seat="17"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle506"
       cx="76.750191"
       cy="88.828003"
       label="circle18"
       r="1.25"
       seat="18"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle507"
       cx="73.675117"
       cy="88.828003"
       label="circle19"
       r="1.25"
       seat="19"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle508"
       cx="70.700081"
       cy="88.828003"
       label="circle20"
       r="1.25"
       seat="20"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle509"
       cx="67.725021"
       cy="88.828003"
       label="circle21"
       r="1.25"
       seat="21"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle510"
       cx="64.650009"
       cy="88.828003"
       label="circle22"
       r="1.25"
       seat="22"
       row="10"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle560"
       cx="162.10431"
       cy="85.123833"
       label="circle1"
       r="1.25"
       row="11"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle561"
       cx="158.8295"
       cy="85.123833"
       label="circle2"
       r="1.25"
       seat="2"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle562"
       cx="155.65456"
       cy="85.139442"
       label="circle3"
       r="1.25"
       seat="3"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle563"
       cx="152.57951"
       cy="85.154877"
       label="circle4"
       r="1.25"
       seat="4"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle564"
       cx="149.40443"
       cy="85.154877"
       label="circle5"
       r="1.25"
       seat="5"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle565"
       cx="146.32938"
       cy="85.139442"
       label="circle6"
       r="1.25"
       seat="6"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle566"
       cx="143.25438"
       cy="85.139442"
       label="circle7"
       r="1.25"
       seat="7"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle567"
       cx="140.0793"
       cy="85.139442"
       label="circle8"
       r="1.25"
       seat="8"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle568"
       cx="136.90427"
       cy="85.139442"
       label="circle9"
       r="1.25"
       seat="9"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle569"
       cx="133.82925"
       cy="85.139442"
       label="circle10"
       r="1.25"
       seat="10"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle570"
       cx="130.75423"
       cy="85.139442"
       label="circle11"
       r="1.25"
       seat="11"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle571"
       cx="127.67916"
       cy="85.139442"
       label="circle12"
       r="1.25"
       seat="12"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle572"
       cx="124.70412"
       cy="85.139442"
       label="circle13"
       r="1.25"
       seat="13"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle573"
       cx="121.52904"
       cy="85.139442"
       label="circle14"
       r="1.25"
       seat="14"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle574"
       cx="118.55396"
       cy="85.139442"
       label="circle15"
       r="1.25"
       seat="15"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle575"
       cx="115.479"
       cy="85.139442"
       label="circle16"
       r="1.25"
       seat="16"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle590"
       cx="101.42132"
       cy="85.123833"
       label="circle17"
       r="1.25"
       seat="17"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle591"
       cx="98.246254"
       cy="85.123833"
       label="circle18"
       r="1.25"
       seat="18"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle592"
       cx="95.171181"
       cy="85.123833"
       label="circle19"
       r="1.25"
       seat="19"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle593"
       cx="92.196144"
       cy="85.123833"
       label="circle20"
       r="1.25"
       seat="20"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle594"
       cx="89.221085"
       cy="85.123833"
       label="circle21"
       r="1.25"
       seat="21"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle595"
       cx="86.146072"
       cy="85.123833"
       label="circle22"
       r="1.25"
       seat="22"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle596"
       cx="82.971069"
       cy="85.123833"
       label="circle23"
       r="1.25"
       seat="23"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle597"
       cx="79.69606"
       cy="85.123833"
       label="circle24"
       r="1.25"
       seat="24"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle598"
       cx="76.621063"
       cy="85.123833"
       label="circle25"
       r="1.25"
       seat="25"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle599"
       cx="73.44603"
       cy="85.123833"
       label="circle26"
       r="1.25"
       seat="26"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle600"
       cx="70.271049"
       cy="85.123833"
       label="circle27"
       r="1.25"
       seat="27"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle601"
       cx="66.996017"
       cy="85.123833"
       label="circle28"
       r="1.25"
       seat="28"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle602"
       cx="63.921017"
       cy="85.123833"
       label="circle29"
       r="1.25"
       seat="29"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle603"
       cx="60.846004"
       cy="85.123833"
       label="circle30"
       r="1.25"
       seat="30"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle604"
       cx="57.771"
       cy="85.123833"
       label="circle31"
       r="1.25"
       seat="31"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle605"
       cx="54.495998"
       cy="85.123833"
       label="circle32"
       r="1.25"
       seat="32"
       row="11"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle648"
       cx="159.02939"
       cy="81.419662"
       label="circle1"
       r="1.25"
       row="12"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle649"
       cx="155.75458"
       cy="81.419662"
       label="circle2"
       r="1.25"
       seat="2"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle650"
       cx="152.57964"
       cy="81.435272"
       label="circle3"
       r="1.25"
       seat="3"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle651"
       cx="149.50459"
       cy="81.450706"
       label="circle4"
       r="1.25"
       seat="4"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle652"
       cx="146.32951"
       cy="81.450706"
       label="circle5"
       r="1.25"
       seat="5"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle653"
       cx="143.25446"
       cy="81.435272"
       label="circle6"
       r="1.25"
       seat="6"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle654"
       cx="140.17946"
       cy="81.435272"
       label="circle7"
       r="1.25"
       seat="7"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle655"
       cx="137.00438"
       cy="81.435272"
       label="circle8"
       r="1.25"
       seat="8"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle656"
       cx="133.82935"
       cy="81.435272"
       label="circle9"
       r="1.25"
       seat="9"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle657"
       cx="130.75433"
       cy="81.435272"
       label="circle10"
       r="1.25"
       seat="10"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle658"
       cx="127.67929"
       cy="81.435272"
       label="circle11"
       r="1.25"
       seat="11"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle659"
       cx="124.60417"
       cy="81.435272"
       label="circle12"
       r="1.25"
       seat="12"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle660"
       cx="121.62916"
       cy="81.435272"
       label="circle13"
       r="1.25"
       seat="13"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle661"
       cx="118.45407"
       cy="81.435272"
       label="circle14"
       r="1.25"
       seat="14"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle662"
       cx="115.479"
       cy="81.435272"
       label="circle15"
       r="1.25"
       seat="15"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle676"
       cx="101.42134"
       cy="81.434784"
       label="circle16"
       r="1.25"
       seat="16"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle677"
       cx="98.346329"
       cy="81.434784"
       label="circle17"
       r="1.25"
       seat="17"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle678"
       cx="95.171249"
       cy="81.434784"
       label="circle18"
       r="1.25"
       seat="18"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle679"
       cx="92.096176"
       cy="81.434784"
       label="circle19"
       r="1.25"
       seat="19"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle680"
       cx="89.12114"
       cy="81.434784"
       label="circle20"
       r="1.25"
       seat="20"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle681"
       cx="86.14608"
       cy="81.434784"
       label="circle21"
       r="1.25"
       seat="21"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle682"
       cx="83.071068"
       cy="81.434784"
       label="circle22"
       r="1.25"
       seat="22"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle683"
       cx="79.896065"
       cy="81.434784"
       label="circle23"
       r="1.25"
       seat="23"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle684"
       cx="76.621056"
       cy="81.434784"
       label="circle24"
       r="1.25"
       seat="24"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle685"
       cx="73.546059"
       cy="81.434784"
       label="circle25"
       r="1.25"
       seat="25"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle686"
       cx="70.371025"
       cy="81.434784"
       label="circle26"
       r="1.25"
       seat="26"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle687"
       cx="67.196045"
       cy="81.434784"
       label="circle27"
       r="1.25"
       seat="27"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle688"
       cx="63.921009"
       cy="81.434784"
       label="circle28"
       r="1.25"
       seat="28"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle689"
       cx="60.846012"
       cy="81.434784"
       label="circle29"
       r="1.25"
       seat="29"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#53ac4d", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle690"
       cx="57.771"
       cy="81.434784"
       label="circle30"
       r="1.25"
       seat="30"
       row="12"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle704"
       cx="156.05438"
       cy="77.715492"
       label="circle1"
       r="1.25"
       row="13"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle705"
       cx="152.77957"
       cy="77.715492"
       label="circle2"
       r="1.25"
       seat="2"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle706"
       cx="149.60463"
       cy="77.731102"
       label="circle3"
       r="1.25"
       seat="3"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle707"
       cx="146.52959"
       cy="77.746536"
       label="circle4"
       r="1.25"
       seat="4"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle708"
       cx="143.35451"
       cy="77.746536"
       label="circle5"
       r="1.25"
       seat="5"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle709"
       cx="140.27945"
       cy="77.731102"
       label="circle6"
       r="1.25"
       seat="6"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle710"
       cx="137.20445"
       cy="77.731102"
       label="circle7"
       r="1.25"
       seat="7"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle711"
       cx="134.02937"
       cy="77.731102"
       label="circle8"
       r="1.25"
       seat="8"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle712"
       cx="130.85434"
       cy="77.731102"
       label="circle9"
       r="1.25"
       seat="9"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle713"
       cx="127.77931"
       cy="77.731102"
       label="circle10"
       r="1.25"
       seat="10"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle714"
       cx="124.70423"
       cy="77.731102"
       label="circle11"
       r="1.25"
       seat="11"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle715"
       cx="121.62912"
       cy="77.731102"
       label="circle12"
       r="1.25"
       seat="12"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle716"
       cx="118.65409"
       cy="77.731102"
       label="circle13"
       r="1.25"
       seat="13"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle717"
       cx="115.479"
       cy="77.731102"
       label="circle14"
       r="1.25"
       seat="14"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle730"
       cx="101.42113"
       cy="77.730614"
       label="circle15"
       r="1.25"
       seat="15"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle731"
       cx="98.34613"
       cy="77.730614"
       label="circle16"
       r="1.25"
       seat="16"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle732"
       cx="95.271118"
       cy="77.730614"
       label="circle17"
       r="1.25"
       seat="17"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle733"
       cx="92.096039"
       cy="77.730614"
       label="circle18"
       r="1.25"
       seat="18"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle734"
       cx="89.020966"
       cy="77.730614"
       label="circle19"
       r="1.25"
       seat="19"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle735"
       cx="86.045929"
       cy="77.730614"
       label="circle20"
       r="1.25"
       seat="20"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle736"
       cx="83.070869"
       cy="77.730614"
       label="circle21"
       r="1.25"
       seat="21"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle737"
       cx="79.995857"
       cy="77.730614"
       label="circle22"
       r="1.25"
       seat="22"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle738"
       cx="76.820854"
       cy="77.730614"
       label="circle23"
       r="1.25"
       seat="23"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle739"
       cx="73.545845"
       cy="77.730614"
       label="circle24"
       r="1.25"
       seat="24"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle740"
       cx="70.470848"
       cy="77.730614"
       label="circle25"
       r="1.25"
       seat="25"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle741"
       cx="67.295815"
       cy="77.730614"
       label="circle26"
       r="1.25"
       seat="26"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle742"
       cx="64.120834"
       cy="77.730614"
       label="circle27"
       r="1.25"
       seat="27"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle743"
       cx="60.845802"
       cy="77.730614"
       label="circle28"
       r="1.25"
       seat="28"
       row="13"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle756"
       cx="149.90433"
       cy="74.011322"
       label="circle1"
       r="1.25"
       row="14"
       seat="1"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle757"
       cx="146.62952"
       cy="74.011322"
       label="circle2"
       r="1.25"
       seat="2"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle758"
       cx="143.45457"
       cy="74.026932"
       label="circle3"
       r="1.25"
       seat="3"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle759"
       cx="140.37953"
       cy="74.042366"
       label="circle4"
       r="1.25"
       seat="4"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle760"
       cx="137.20445"
       cy="74.042366"
       label="circle5"
       r="1.25"
       seat="5"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle761"
       cx="134.12939"
       cy="74.026932"
       label="circle6"
       r="1.25"
       seat="6"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle762"
       cx="131.0544"
       cy="74.026932"
       label="circle7"
       r="1.25"
       seat="7"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle763"
       cx="127.87931"
       cy="74.026932"
       label="circle8"
       r="1.25"
       seat="8"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle764"
       cx="124.70425"
       cy="74.026932"
       label="circle9"
       r="1.25"
       seat="9"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle765"
       cx="121.62918"
       cy="74.026932"
       label="circle10"
       r="1.25"
       seat="10"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle766"
       cx="118.55408"
       cy="74.026932"
       label="circle11"
       r="1.25"
       seat="11"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle767"
       cx="115.479"
       cy="74.026932"
       label="circle12"
       r="1.25"
       seat="12"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle778"
       cx="101.42142"
       cy="74.027"
       label="circle13"
       r="1.25"
       seat="13"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle779"
       cx="98.246338"
       cy="74.027"
       label="circle14"
       r="1.25"
       seat="14"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle780"
       cx="95.271271"
       cy="74.027"
       label="circle15"
       r="1.25"
       seat="15"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle781"
       cx="92.196274"
       cy="74.027"
       label="circle16"
       r="1.25"
       seat="16"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle782"
       cx="89.121262"
       cy="74.027"
       label="circle17"
       r="1.25"
       seat="17"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle783"
       cx="85.946182"
       cy="74.027"
       label="circle18"
       r="1.25"
       seat="18"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle784"
       cx="82.871109"
       cy="74.027"
       label="circle19"
       r="1.25"
       seat="19"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle785"
       cx="79.896072"
       cy="74.027"
       label="circle20"
       r="1.25"
       seat="20"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle786"
       cx="76.921013"
       cy="74.027"
       label="circle21"
       r="1.25"
       seat="21"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle787"
       cx="73.846001"
       cy="74.027"
       label="circle22"
       r="1.25"
       seat="22"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle788"
       cx="70.670998"
       cy="74.027"
       label="circle23"
       r="1.25"
       seat="23"
       row="14"
       floor="parterre" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle808"
       cx="122.38794"
       cy="57.077972"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle809"
       cx="119.11311"
       cy="57.077972"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle810"
       cx="115.93811"
       cy="57.093582"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle811"
       cx="112.86301"
       cy="57.109016"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle812"
       cx="104.39629"
       cy="57.109016"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle813"
       cx="101.32119"
       cy="57.093582"
       label="circle6"
       r="1.25"
       seat="6"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle814"
       cx="98.246124"
       cy="57.093582"
       label="circle7"
       r="1.25"
       seat="7"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle815"
       cx="95.070961"
       cy="57.093582"
       label="circle8"
       r="1.25"
       seat="8"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle822"
       cx="122.38794"
       cy="53.373802"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle823"
       cx="119.11311"
       cy="53.373802"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle824"
       cx="115.93811"
       cy="53.389412"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle825"
       cx="112.86301"
       cy="53.404846"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle826"
       cx="104.39629"
       cy="53.404846"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle827"
       cx="101.32119"
       cy="53.389412"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle828"
       cx="98.246124"
       cy="53.389412"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle829"
       cx="95.070961"
       cy="53.389412"
       label="circle8"
       r="1.25"
       seat="8"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle836"
       cx="122.38794"
       cy="49.669632"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle837"
       cx="119.11311"
       cy="49.669632"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle838"
       cx="115.93811"
       cy="49.685242"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle839"
       cx="112.86301"
       cy="49.700676"
       label="circle4"
       r="1.25"
       seat="4"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle840"
       cx="104.39629"
       cy="49.700676"
       label="circle5"
       r="1.25"
       seat="5"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle841"
       cx="101.32119"
       cy="49.685242"
       label="circle6"
       r="1.25"
       seat="6"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle842"
       cx="98.246124"
       cy="49.685242"
       label="circle7"
       r="1.25"
       seat="7"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle843"
       cx="95.070961"
       cy="49.685242"
       label="circle8"
       r="1.25"
       seat="8"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle856"
       cx="122.38794"
       cy="37.398346"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle857"
       cx="119.11311"
       cy="37.398346"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle858"
       cx="115.93811"
       cy="37.413956"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle859"
       cx="112.86301"
       cy="37.42939"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle860"
       cx="104.39629"
       cy="37.42939"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle861"
       cx="101.32119"
       cy="37.413956"
       label="circle6"
       r="1.25"
       seat="6"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle862"
       cx="98.246124"
       cy="37.413956"
       label="circle7"
       r="1.25"
       seat="7"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle863"
       cx="95.070961"
       cy="37.413956"
       label="circle8"
       r="1.25"
       seat="8"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle864"
       cx="122.38794"
       cy="33.694176"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle865"
       cx="119.11311"
       cy="33.694176"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle866"
       cx="115.93811"
       cy="33.709785"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle867"
       cx="112.86301"
       cy="33.72522"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle868"
       cx="104.39629"
       cy="33.72522"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle869"
       cx="101.32119"
       cy="33.709785"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle870"
       cx="98.246124"
       cy="33.709785"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle871"
       cx="95.070961"
       cy="33.709785"
       label="circle8"
       r="1.25"
       seat="8"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       // skmvksnvneoisvknsbdonsofbnkdfnvivind
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.249057" }}
       id="circle872"
       cx="122.38794"
       cy="30.00733"
       label="circle1"
       row="3"
       seat="1"
       floor="balcony"
       r="1.25"/><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle873"
       cx="119.11311"
       cy="29.99"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle874"
       cx="115.93811"
       cy="30.00561"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle875"
       cx="112.86301"
       cy="30.021044"
       label="circle4"
       r="1.25"
       seat="4"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle876"
       cx="104.39629"
       cy="30.021044"
       label="circle5"
       r="1.25"
       seat="5"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle877"
       cx="101.32119"
       cy="30.00561"
       label="circle6"
       r="1.25"
       seat="6"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle878"
       cx="98.246124"
       cy="30.00561"
       label="circle7"
       r="1.25"
       seat="7"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle879"
       cx="95.070961"
       cy="30.00561"
       label="circle8"
       r="1.25"
       seat="8"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle956"
       cx="104.39629"
       cy="57.109016"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle957"
       cx="101.32119"
       cy="57.093582"
       label="circle6"
       r="1.25"
       seat="6"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle958"
       cx="98.246124"
       cy="57.093582"
       label="circle7"
       r="1.25"
       seat="7"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle959"
       cx="95.070961"
       cy="57.093582"
       label="circle8"
       r="1.25"
       seat="8"
       row="1"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle960"
       cx="104.39629"
       cy="53.404846"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle961"
       cx="101.32119"
       cy="53.389412"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle962"
       cx="98.246124"
       cy="53.389412"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle963"
       cx="95.070961"
       cy="53.389412"
       label="circle8"
       r="1.25"
       seat="8"
       row="2"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle964"
       cx="104.39629"
       cy="49.700676"
       label="circle5"
       r="1.25"
       seat="5"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle965"
       cx="101.32119"
       cy="49.685242"
       label="circle6"
       r="1.25"
       seat="6"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle966"
       cx="98.246124"
       cy="49.685242"
       label="circle7"
       r="1.25"
       seat="7"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle967"
       cx="95.070961"
       cy="49.685242"
       label="circle8"
       r="1.25"
       seat="8"
       row="3"
       floor="mezzanine" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle968"
       cx="104.39629"
       cy="37.42939"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle969"
       cx="101.32119"
       cy="37.413956"
       label="circle6"
       r="1.25"
       seat="6"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle970"
       cx="98.246124"
       cy="37.413956"
       label="circle7"
       r="1.25"
       seat="7"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle971"
       cx="95.070961"
       cy="37.413956"
       label="circle8"
       r="1.25"
       seat="8"
       row="1"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle972"
       cx="104.39629"
       cy="33.72522"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle973"
       cx="101.32119"
       cy="33.709785"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle974"
       cx="98.246124"
       cy="33.709785"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle975"
       cx="95.070961"
       cy="33.709785"
       label="circle8"
       r="1.25"
       seat="8"
       row="2"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle976"
       cx="104.39629"
       cy="30.021044"
       label="circle5"
       r="1.25"
       seat="5"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle977"
       cx="101.32119"
       cy="30.00561"
       label="circle6"
       r="1.25"
       seat="6"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle978"
       cx="98.246124"
       cy="30.00561"
       label="circle7"
       r="1.25"
       seat="7"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle979"
       cx="95.070961"
       cy="30.00561"
       label="circle8"
       r="1.25"
       seat="8"
       row="3"
       floor="balcony" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1002"
       cx="137.9628"
       cy="57.377792"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1003"
       cx="134.688"
       cy="57.37796"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1004"
       cx="131.51305"
       cy="57.393574"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1005"
       cx="128.438"
       cy="57.409012"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1006"
       cx="137.9628"
       cy="53.673622"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1007"
       cx="134.688"
       cy="53.67379"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1008"
       cx="131.51305"
       cy="53.689404"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1009"
       cx="128.438"
       cy="53.704842"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1010"
       cx="137.9628"
       cy="49.969452"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1011"
       cx="134.688"
       cy="49.96962"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1012"
       cx="131.51305"
       cy="49.985233"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1013"
       cx="128.438"
       cy="50.000671"
       label="circle4"
       r="1.25"
       seat="4"
       row="3"
       floor="mezzanineLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1014"
       cx="137.9628"
       cy="37.698166"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1015"
       cx="134.688"
       cy="37.698334"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1016"
       cx="131.51305"
       cy="37.713947"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1017"
       cx="128.438"
       cy="37.729385"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1018"
       cx="137.9628"
       cy="33.993996"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1019"
       cx="134.688"
       cy="33.994164"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1020"
       cx="131.51305"
       cy="34.009777"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1021"
       cx="128.438"
       cy="34.025215"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1022"
       cx="134.88776"
       cy="30.290001"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1023"
       cx="131.61296"
       cy="30.290001"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1024"
       cx="128.438"
       cy="30.306002"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="balconyLoggia3" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1136"
       cx="89.279602"
       cy="57.377792"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1137"
       cx="86.004745"
       cy="57.37796"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1138"
       cx="82.829765"
       cy="57.393574"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1139"
       cx="79.754669"
       cy="57.409012"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1140"
       cx="89.279602"
       cy="53.673622"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1141"
       cx="86.004745"
       cy="53.67379"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1142"
       cx="82.829765"
       cy="53.689404"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1143"
       cx="79.754669"
       cy="53.704842"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1144"
       cx="89.279602"
       cy="49.969452"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1145"
       cx="86.004745"
       cy="49.96962"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1146"
       cx="82.829765"
       cy="49.985233"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1147"
       cx="79.754669"
       cy="50.000671"
       label="circle4"
       r="1.25"
       seat="4"
       row="3"
       floor="mezzanineLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1148"
       cx="89.279602"
       cy="37.698166"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1149"
       cx="86.004745"
       cy="37.698334"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1150"
       cx="82.829765"
       cy="37.713947"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1151"
       cx="79.754669"
       cy="37.729385"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1152"
       cx="89.279602"
       cy="33.993996"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1153"
       cx="86.004745"
       cy="33.994164"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1154"
       cx="82.829765"
       cy="34.009777"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1155"
       cx="79.754669"
       cy="34.025215"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1156"
       cx="89.17984"
       cy="30.290001"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1157"
       cx="85.905006"
       cy="30.290001"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1158"
       cx="82.730003"
       cy="30.306002"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="balconyLoggia4" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1203"
       cx="162.075"
       cy="60.494999"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1204"
       cx="158.80019"
       cy="60.195"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1205"
       cx="155.62524"
       cy="59.910999"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1206"
       cx="152.5502"
       cy="59.625999"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1207"
       cx="149.37512"
       cy="59.425999"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1208"
       cx="146.30006"
       cy="59.210251"
       label="circle6"
       r="1.25"
       seat="6"
       row="1"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1215"
       cx="162.075"
       cy="56.790829"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1216"
       cx="158.80019"
       cy="56.490829"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1217"
       cx="155.62524"
       cy="56.206829"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1218"
       cx="152.5502"
       cy="55.921829"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1219"
       cx="149.37512"
       cy="55.721828"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1220"
       cx="146.30006"
       cy="55.506081"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1221"
       cx="143.22507"
       cy="55.506081"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1227"
       cx="159"
       cy="52.786659"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1228"
       cx="155.72519"
       cy="52.487049"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1229"
       cx="152.55025"
       cy="52.202225"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1230"
       cx="149.4752"
       cy="52.017658"
       label="circle4"
       r="1.25"
       seat="4"
       row="3"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1231"
       cx="146.30013"
       cy="51.817345"
       label="circle5"
       r="1.25"
       seat="5"
       row="3"
       floor="mezzanineLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1239"
       cx="158.99988"
       cy="40.286171"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1240"
       cx="155.72507"
       cy="39.986286"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1241"
       cx="152.55013"
       cy="39.701897"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1242"
       cx="149.47508"
       cy="39.51733"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1243"
       cx="146.3"
       cy="39.317333"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1251"
       cx="162.075"
       cy="36.882"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1252"
       cx="158.80019"
       cy="36.582001"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1253"
       cx="155.62524"
       cy="36.297726"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1254"
       cx="152.5502"
       cy="36.013161"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1255"
       cx="149.37512"
       cy="35.81316"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1256"
       cx="146.30006"
       cy="35.597729"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1257"
       cx="143.22507"
       cy="35.397728"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1263"
       cx="155.8248"
       cy="32.577999"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1264"
       cx="152.54999"
       cy="32.278"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1265"
       cx="149.37505"
       cy="32.093609"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1266"
       cx="146.3"
       cy="31.909044"
       label="circle4"
       r="1.25"
       seat="4"
       row="3"
       floor="balconyLoggia2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1443"
       cx="74.734177"
       cy="55.506001"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1444"
       cx="71.45932"
       cy="55.706169"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1445"
       cx="68.284317"
       cy="55.90617"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1446"
       cx="65.209251"
       cy="56.106171"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1447"
       cx="62.034168"
       cy="56.40617"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1448"
       cx="58.959072"
       cy="56.706249"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#008080", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1449"
       cx="55.883999"
       cy="57.006001"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1455"
       cx="74.734177"
       cy="59.210171"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1456"
       cx="71.45932"
       cy="59.410339"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1457"
       cx="68.284317"
       cy="59.61034"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1458"
       cx="65.209251"
       cy="59.810341"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1459"
       cx="62.034168"
       cy="60.11034"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1460"
       cx="58.959072"
       cy="60.410419"
       label="circle6"
       r="1.25"
       seat="6"
       row="1"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fcb203", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1461"
       cx="55.883999"
       cy="60.710171"
       label="circle7"
       r="1.25"
       seat="7"
       row="1"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1467"
       cx="71.459427"
       cy="52.001999"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1468"
       cx="68.18457"
       cy="52.202"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1469"
       cx="65.009567"
       cy="52.402"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1470"
       cx="61.934502"
       cy="52.702"
       label="circle4"
       r="1.25"
       seat="4"
       row="3"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1471"
       cx="58.759415"
       cy="53.001999"
       label="circle5"
       r="1.25"
       seat="5"
       row="3"
       floor="mezzanineLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1479"
       cx="74.734177"
       cy="35.397648"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1480"
       cx="71.45932"
       cy="35.597816"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1481"
       cx="68.284317"
       cy="35.797817"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1482"
       cx="65.209251"
       cy="35.997818"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1483"
       cx="62.034168"
       cy="36.297817"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1484"
       cx="58.959072"
       cy="36.597897"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1486"
       cx="74.734177"
       cy="39.101818"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1487"
       cx="71.45932"
       cy="39.301987"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1488"
       cx="68.284317"
       cy="39.501987"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1489"
       cx="65.209251"
       cy="39.701988"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1490"
       cx="62.034168"
       cy="40.001987"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1493"
       cx="71.459427"
       cy="31.893646"
       label="circle1"
       r="1.25"
       row="3"
       seat="1"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1494"
       cx="68.18457"
       cy="32.093647"
       label="circle2"
       r="1.25"
       seat="2"
       row="3"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1495"
       cx="65.009567"
       cy="32.293648"
       label="circle3"
       r="1.25"
       seat="3"
       row="3"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1496"
       cx="61.934502"
       cy="32.593647"
       label="circle4"
       r="1.25"
       seat="4"
       row="3"
       floor="balconyLoggia5" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1515"
       cx="186.94576"
       cy="41.428001"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1516"
       cx="183.67094"
       cy="40.728001"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1517"
       cx="180.496"
       cy="40.144001"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1518"
       cx="177.4207"
       cy="39.558998"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1519"
       cx="174.24562"
       cy="38.959"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1520"
       cx="171.17056"
       cy="38.444"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1521"
       cx="168.09557"
       cy="38.043564"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1527"
       cx="174.47475"
       cy="42.632126"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1528"
       cx="171.19994"
       cy="42.132561"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1529"
       cx="168.02499"
       cy="41.747734"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="balconyLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1531"
       cx="177.42061"
       cy="59.736"
       label="circle1"
       r="1.2499992"
       row="2"
       seat="1"
       floor="mezzanineLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1532"
       cx="174.1458"
       cy="59.135998"
       label="circle2"
       r="1.2499992"
       seat="2"
       row="2"
       floor="mezzanineLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1533"
       cx="170.97087"
       cy="58.551998"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="mezzanineLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1534"
       cx="167.89583"
       cy="58.167351"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="mezzanineLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1539"
       cx="180.59557"
       cy="64.040001"
       label="circle1"
       r="1.2499992"
       row="1"
       seat="1"
       floor="mezzanineLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1540"
       cx="177.32077"
       cy="63.440174"
       label="circle2"
       r="1.2499992"
       seat="2"
       row="1"
       floor="mezzanineLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1541"
       cx="174.14581"
       cy="62.855782"
       label="circle3"
       r="1.2499992"
       seat="3"
       row="1"
       floor="mezzanineLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1542"
       cx="171.07079"
       cy="62.271603"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="mezzanineLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1543"
       cx="167.89571"
       cy="61.871521"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="mezzanineLoggia1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1547"
       cx="50.421242"
       cy="38.027954"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1548"
       cx="47.146385"
       cy="38.528"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1549"
       cx="43.971382"
       cy="39.043999"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1550"
       cx="40.896317"
       cy="39.659"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1551"
       cx="37.72123"
       cy="40.258999"
       label="circle5"
       r="1.25"
       seat="5"
       row="2"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1552"
       cx="34.646133"
       cy="40.844002"
       label="circle6"
       r="1.25"
       seat="6"
       row="2"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#2815bd", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1553"
       cx="31.57106"
       cy="41.543999"
       label="circle7"
       r="1.25"
       seat="7"
       row="2"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1559"
       cx="50.421242"
       cy="41.732124"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1560"
       cx="47.146385"
       cy="42.23217"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1561"
       cx="43.971382"
       cy="42.748169"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="balconyLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1563"
       cx="50.950409"
       cy="58.335999"
       label="circle1"
       r="1.25"
       row="2"
       seat="1"
       floor="mezzanineLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1564"
       cx="47.675552"
       cy="58.835999"
       label="circle2"
       r="1.25"
       seat="2"
       row="2"
       floor="mezzanineLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1565"
       cx="44.500549"
       cy="59.452"
       label="circle3"
       r="1.25"
       seat="3"
       row="2"
       floor="mezzanineLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#806600", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1566"
       cx="41.425484"
       cy="60.067001"
       label="circle4"
       r="1.25"
       seat="4"
       row="2"
       floor="mezzanineLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1571"
       cx="50.950409"
       cy="62.040169"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="mezzanineLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1572"
       cx="47.675552"
       cy="62.540169"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="mezzanineLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1573"
       cx="44.500549"
       cy="63.15617"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="mezzanineLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1574"
       cx="41.425484"
       cy="63.771172"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="mezzanineLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#fa2a7f", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1575"
       cx="38.250397"
       cy="64.471001"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="mezzanineLoggia6" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1579"
       cx="183.77054"
       cy="100.99887"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="baignoire1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1580"
       cx="180.49573"
       cy="99.411392"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="baignoire1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1581"
       cx="177.32079"
       cy="97.839417"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="baignoire1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1582"
       cx="174.24574"
       cy="96.267365"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="baignoire1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1585"
       cx="181.98349"
       cy="95.73822"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="baignoire1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1586"
       cx="178.90843"
       cy="94.135284"
       label="circle6"
       r="1.25"
       seat="6"
       row="1"
       floor="baignoire1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1587"
       cx="175.83344"
       cy="92.547783"
       label="circle7"
       r="1.25"
       seat="7"
       row="1"
       floor="baignoire1" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1589"
       cx="45.12957"
       cy="96.765511"
       label="circle1"
       r="1.25"
       row="1"
       seat="1"
       floor="baignoire2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1590"
       cx="41.854713"
       cy="98.353035"
       label="circle2"
       r="1.25"
       seat="2"
       row="1"
       floor="baignoire2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1591"
       cx="38.67971"
       cy="99.956085"
       label="circle3"
       r="1.25"
       seat="3"
       row="1"
       floor="baignoire2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1592"
       cx="35.604645"
       cy="101.55901"
       label="circle4"
       r="1.25"
       seat="4"
       row="1"
       floor="baignoire2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1595"
       cx="43.342167"
       cy="93.092384"
       label="circle5"
       r="1.25"
       seat="5"
       row="1"
       floor="baignoire2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1596"
       cx="40.267071"
       cy="94.664452"
       label="circle6"
       r="1.25"
       seat="6"
       row="1"
       floor="baignoire2" /><circle
       onClick={e => choosePlace(e.target)} 
         onMouseOver={e => enterCircle(e)}
       onMouseOut={e => leaveCircle(e)}
       style={{ display:"inline", fill:"#cf59cf", fillOpacity:"1", strokeWidth:"0.248452" }}
       id="circle1597"
       cx="37.191998"
       cy="96.251953"
       label="circle7"
       r="1.25"
       seat="7"
       row="1"
       floor="baignoire2" /></g><g
     groupmode="layer"
     id="layer3"
     label="Ladle"
     style={{display: 'inline',pointerEvents: 'none'}}
     insensitive="true"><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.59941"
       y="130.58379"
       id="text10"
       label="text1"><tspan
         role="line"
         id="tspan10"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.59941"
         y="130.58379">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.25479"
       y="130.58377"
       id="text11"
       label="text2"><tspan
         role="line"
         id="tspan11"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.25479"
         y="130.58377">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.07974"
       y="130.58377"
       id="text12"
       label="text3"><tspan
         role="line"
         id="tspan12"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.07974"
         y="130.58377">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.00517"
       y="130.58377"
       id="text13"
       label="text4"><tspan
         role="line"
         id="tspan13"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.00517"
         y="130.58377">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="125.03814"
       y="130.56828"
       id="text24"
       label="text5"><tspan
         role="line"
         id="tspan24"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="125.03814"
         y="130.56828">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.0635"
       y="130.56828"
       id="text25"
       label="text6"><tspan
         role="line"
         id="tspan25"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.0635"
         y="130.56828">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="118.98845"
       y="130.56828"
       id="text26"
       label="text7"><tspan
         role="line"
         id="tspan26"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="118.98845"
         y="130.56828">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="115.81351"
       y="130.56828"
       id="text27"
       label="text8"><tspan
         role="line"
         id="tspan27"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="115.81351"
         y="130.56828">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="112.63844"
       y="130.56828"
       id="text28"
       label="text9"><tspan
         role="line"
         id="tspan28"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="112.63844"
         y="130.56828">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="109.16345"
       y="130.56828"
       id="text29"
       label="text10"><tspan
         role="line"
         id="tspan29"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="109.16345"
         y="130.56828">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="106.11744"
       y="130.56828"
       id="text30"
       label="text11"><tspan
         role="line"
         id="tspan30"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="106.11744"
         y="130.56828">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="103.04234"
       y="130.56828"
       id="text31"
       label="text12"><tspan
         role="line"
         id="tspan31"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="103.04234"
         y="130.56828">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="100.06728"
       y="130.56828"
       id="text32"
       label="text13"><tspan
         role="line"
         id="tspan32"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="100.06728"
         y="130.56828">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="96.892189"
       y="130.56828"
       id="text33"
       label="text14"><tspan
         role="line"
         id="tspan33"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="96.892189"
         y="130.56828">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="93.846054"
       y="130.56828"
       id="text34"
       label="text15"><tspan
         role="line"
         id="tspan34"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="93.846054"
         y="130.56828">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="90.771057"
       y="130.56828"
       id="text35"
       label="text16"><tspan
         role="line"
         id="tspan35"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="90.771057"
         y="130.56828">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.320862"
       y="130.56816"
       id="text38"
       label="text17"><tspan
         role="line"
         id="tspan38"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.320862"
         y="130.56816">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="68.245834"
       y="130.56816"
       id="text39"
       label="text18"><tspan
         role="line"
         id="tspan39"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="68.245834"
         y="130.56816">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="65.070763"
       y="130.56816"
       id="text40"
       label="text19"><tspan
         role="line"
         id="tspan40"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="65.070763"
         y="130.56816">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="62.224716"
       y="130.56816"
       id="text41"
       label="text20"><tspan
         role="line"
         id="tspan41"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="62.224716"
         y="130.56816">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="165.22453"
       y="126.87965"
       id="text44"
       label="text1"><tspan
         role="line"
         id="tspan44"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="165.22453"
         y="126.87965">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="161.87991"
       y="126.87965"
       id="text45"
       label="text2"><tspan
         role="line"
         id="tspan45"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="161.87991"
         y="126.87965">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.70486"
       y="126.87965"
       id="text46"
       label="text3"><tspan
         role="line"
         id="tspan46"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.70486"
         y="126.87965">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.53017"
       y="126.87965"
       id="text47"
       label="text4"><tspan
         role="line"
         id="tspan47"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.53017"
         y="126.87965">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.32622"
       y="126.895"
       id="text49"
       label="text5"><tspan
         role="line"
         id="tspan49"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.32622"
         y="126.895">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.25098"
       y="126.895"
       id="text50"
       label="text6"><tspan
         role="line"
         id="tspan50"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.25098"
         y="126.895">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.10497"
       y="126.895"
       id="text51"
       label="text7"><tspan
         role="line"
         id="tspan51"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.10497"
         y="126.895">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="126.82571"
       y="126.89499"
       id="text63"
       label="text8"><tspan
         role="line"
         id="tspan63"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="126.82571"
         y="126.89499">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="123.65069"
       y="126.89499"
       id="text64"
       label="text9"><tspan
         role="line"
         id="tspan64"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="123.65069"
         y="126.89499">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="120.17567"
       y="126.89499"
       id="text65"
       label="text10"><tspan
         role="line"
         id="tspan65"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="120.17567"
         y="126.89499">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="117.12965"
       y="126.89499"
       id="text66"
       label="text11"><tspan
         role="line"
         id="tspan66"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="117.12965"
         y="126.89499">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="114.05458"
       y="126.89499"
       id="text67"
       label="text12"><tspan
         role="line"
         id="tspan67"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="114.05458"
         y="126.89499">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="111.07951"
       y="126.89499"
       id="text68"
       label="text13"><tspan
         role="line"
         id="tspan68"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="111.07951"
         y="126.89499">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="107.90443"
       y="126.89499"
       id="text69"
       label="text14"><tspan
         role="line"
         id="tspan69"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="107.90443"
         y="126.89499">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.85829"
       y="126.89499"
       id="text70"
       label="text15"><tspan
         role="line"
         id="tspan70"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.85829"
         y="126.89499">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.78329"
       y="126.89499"
       id="text71"
       label="text16"><tspan
         role="line"
         id="tspan71"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.78329"
         y="126.89499">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="98.737289"
       y="126.89499"
       id="text72"
       label="text17"><tspan
         role="line"
         id="tspan72"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="98.737289"
         y="126.89499">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="95.662262"
       y="126.89499"
       id="text73"
       label="text18"><tspan
         role="line"
         id="tspan73"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="95.662262"
         y="126.89499">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="92.48719"
       y="126.89499"
       id="text74"
       label="text19"><tspan
         role="line"
         id="tspan74"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="92.48719"
         y="126.89499">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="89.641144"
       y="126.89499"
       id="text75"
       label="text20"><tspan
         role="line"
         id="tspan75"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="89.641144"
         y="126.89499">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.420456"
       y="126.895"
       id="text81"
       label="text21"><tspan
         role="line"
         id="tspan81"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.420456"
         y="126.895">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="68.24543"
       y="126.895"
       id="text82"
       label="text22"><tspan
         role="line"
         id="tspan82"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="68.24543"
         y="126.895">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="65.070427"
       y="126.895"
       id="text83"
       label="text23"><tspan
         role="line"
         id="tspan83"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="65.070427"
         y="126.895">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.795456"
       y="126.895"
       id="text84"
       label="text24"><tspan
         role="line"
         id="tspan84"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.795456"
         y="126.895">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="58.720421"
       y="126.895"
       id="text85"
       label="text25"><tspan
         role="line"
         id="tspan85"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="58.720421"
         y="126.895">25</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="55.545418"
       y="126.895"
       id="text86"
       label="text26"><tspan
         role="line"
         id="tspan86"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="55.545418"
         y="126.895">26</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="52.370415"
       y="126.895"
       id="text87"
       label="text27"><tspan
         role="line"
         id="tspan87"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="52.370415"
         y="126.895">27</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.87462"
       y="123.17548"
       id="text97"
       label="text1"><tspan
         role="line"
         id="tspan97"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.87462"
         y="123.17548">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.53"
       y="123.17548"
       id="text98"
       label="text2"><tspan
         role="line"
         id="tspan98"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.53"
         y="123.17548">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.35495"
       y="123.17548"
       id="text99"
       label="text3"><tspan
         role="line"
         id="tspan99"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.35495"
         y="123.17548">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.18025"
       y="123.17548"
       id="text100"
       label="text4"><tspan
         role="line"
         id="tspan100"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.18025"
         y="123.17548">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.00522"
       y="123.19085"
       id="text101"
       label="text5"><tspan
         role="line"
         id="tspan101"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.00522"
         y="123.19085">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.94266"
       y="123.20586"
       id="text114"
       label="text6"><tspan
         role="line"
         id="tspan114"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.94266"
         y="123.20586">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="125.86761"
       y="123.20586"
       id="text115"
       label="text7"><tspan
         role="line"
         id="tspan115"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="125.86761"
         y="123.20586">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.69267"
       y="123.20586"
       id="text116"
       label="text8"><tspan
         role="line"
         id="tspan116"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.69267"
         y="123.20586">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="119.51762"
       y="123.20586"
       id="text117"
       label="text9"><tspan
         role="line"
         id="tspan117"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="119.51762"
         y="123.20586">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="116.04261"
       y="123.20586"
       id="text118"
       label="text10"><tspan
         role="line"
         id="tspan118"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="116.04261"
         y="123.20586">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="112.9966"
       y="123.20586"
       id="text119"
       label="text11"><tspan
         role="line"
         id="tspan119"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="112.9966"
         y="123.20586">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="109.92152"
       y="123.20586"
       id="text120"
       label="text12"><tspan
         role="line"
         id="tspan120"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="109.92152"
         y="123.20586">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="106.94645"
       y="123.20586"
       id="text121"
       label="text13"><tspan
         role="line"
         id="tspan121"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="106.94645"
         y="123.20586">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="103.77135"
       y="123.20586"
       id="text122"
       label="text14"><tspan
         role="line"
         id="tspan122"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="103.77135"
         y="123.20586">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="100.72523"
       y="123.20586"
       id="text123"
       label="text15"><tspan
         role="line"
         id="tspan123"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="100.72523"
         y="123.20586">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.65023"
       y="123.20586"
       id="text124"
       label="text16"><tspan
         role="line"
         id="tspan124"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.65023"
         y="123.20586">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.604218"
       y="123.20586"
       id="text125"
       label="text17"><tspan
         role="line"
         id="tspan125"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.604218"
         y="123.20586">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="91.52919"
       y="123.20586"
       id="text126"
       label="text18"><tspan
         role="line"
         id="tspan126"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="91.52919"
         y="123.20586">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.354118"
       y="123.20586"
       id="text127"
       label="text19"><tspan
         role="line"
         id="tspan127"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.354118"
         y="123.20586">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.42057"
       y="123.20586"
       id="text131"
       label="text20"><tspan
         role="line"
         id="tspan131"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.42057"
         y="123.20586">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="68.445457"
       y="123.20586"
       id="text132"
       label="text21"><tspan
         role="line"
         id="tspan132"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="68.445457"
         y="123.20586">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="65.270432"
       y="123.20586"
       id="text133"
       label="text22"><tspan
         role="line"
         id="tspan133"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="65.270432"
         y="123.20586">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="62.095432"
       y="123.20586"
       id="text134"
       label="text23"><tspan
         role="line"
         id="tspan134"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="62.095432"
         y="123.20586">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="58.820461"
       y="123.20586"
       id="text135"
       label="text24"><tspan
         role="line"
         id="tspan135"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="58.820461"
         y="123.20586">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.87462"
       y="119.47134"
       id="text139"
       label="text1"><tspan
         role="line"
         id="tspan139"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.87462"
         y="119.47134">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.53"
       y="119.47134"
       id="text140"
       label="text2"><tspan
         role="line"
         id="tspan140"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.53"
         y="119.47134">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.35495"
       y="119.47134"
       id="text141"
       label="text3"><tspan
         role="line"
         id="tspan141"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.35495"
         y="119.47134">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.18025"
       y="119.47134"
       id="text142"
       label="text4"><tspan
         role="line"
         id="tspan142"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.18025"
         y="119.47134">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.00522"
       y="119.48668"
       id="text143"
       label="text5"><tspan
         role="line"
         id="tspan143"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.00522"
         y="119.48668">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="130.53014"
       y="119.50217"
       id="text208"
       label="text6"><tspan
         role="line"
         id="tspan208"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="130.53014"
         y="119.50217">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="127.45512"
       y="119.50217"
       id="text209"
       label="text7"><tspan
         role="line"
         id="tspan209"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="127.45512"
         y="119.50217">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="124.28017"
       y="119.50217"
       id="text210"
       label="text8"><tspan
         role="line"
         id="tspan210"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="124.28017"
         y="119.50217">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="121.10511"
       y="119.50217"
       id="text211"
       label="text9"><tspan
         role="line"
         id="tspan211"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="121.10511"
         y="119.50217">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="117.63012"
       y="119.50217"
       id="text212"
       label="text10"><tspan
         role="line"
         id="tspan212"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="117.63012"
         y="119.50217">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="114.58411"
       y="119.50217"
       id="text213"
       label="text11"><tspan
         role="line"
         id="tspan213"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="114.58411"
         y="119.50217">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="111.50901"
       y="119.50217"
       id="text214"
       label="text12"><tspan
         role="line"
         id="tspan214"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="111.50901"
         y="119.50217">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="108.53395"
       y="119.50217"
       id="text215"
       label="text13"><tspan
         role="line"
         id="tspan215"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="108.53395"
         y="119.50217">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="105.35886"
       y="119.50217"
       id="text216"
       label="text14"><tspan
         role="line"
         id="tspan216"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="105.35886"
         y="119.50217">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="102.31279"
       y="119.50217"
       id="text217"
       label="text15"><tspan
         role="line"
         id="tspan217"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="102.31279"
         y="119.50217">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="99.237793"
       y="119.50217"
       id="text218"
       label="text16"><tspan
         role="line"
         id="tspan218"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="99.237793"
         y="119.50217">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="96.191719"
       y="119.50217"
       id="text219"
       label="text17"><tspan
         role="line"
         id="tspan219"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="96.191719"
         y="119.50217">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="93.116707"
       y="119.50217"
       id="text220"
       label="text18"><tspan
         role="line"
         id="tspan220"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="93.116707"
         y="119.50217">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="89.94162"
       y="119.50217"
       id="text221"
       label="text19"><tspan
         role="line"
         id="tspan221"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="89.94162"
         y="119.50217">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="87.095551"
       y="119.50217"
       id="text222"
       label="text20"><tspan
         role="line"
         id="tspan222"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="87.095551"
         y="119.50217">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.420464"
       y="119.50217"
       id="text226"
       label="text21"><tspan
         role="line"
         id="tspan226"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.420464"
         y="119.50217">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="68.24543"
       y="119.50217"
       id="text227"
       label="text22"><tspan
         role="line"
         id="tspan227"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="68.24543"
         y="119.50217">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="65.070427"
       y="119.50217"
       id="text228"
       label="text23"><tspan
         role="line"
         id="tspan228"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="65.070427"
         y="119.50217">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.79546"
       y="119.50217"
       id="text229"
       label="text24"><tspan
         role="line"
         id="tspan229"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.79546"
         y="119.50217">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="58.720425"
       y="119.50217"
       id="text230"
       label="text25"><tspan
         role="line"
         id="tspan230"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="58.720425"
         y="119.50217">25</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.87462"
       y="115.76717"
       id="text234"
       label="text1"><tspan
         role="line"
         id="tspan234"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.87462"
         y="115.76717">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.53"
       y="115.76717"
       id="text235"
       label="text2"><tspan
         role="line"
         id="tspan235"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.53"
         y="115.76717">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.35495"
       y="115.76717"
       id="text236"
       label="text3"><tspan
         role="line"
         id="tspan236"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.35495"
         y="115.76717">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.18025"
       y="115.76717"
       id="text237"
       label="text4"><tspan
         role="line"
         id="tspan237"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.18025"
         y="115.76717">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.00522"
       y="115.78252"
       id="text238"
       label="text5"><tspan
         role="line"
         id="tspan238"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.00522"
         y="115.78252">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="132.11761"
       y="115.79815"
       id="text253"
       label="text6"><tspan
         role="line"
         id="tspan253"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="132.11761"
         y="115.79815">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="129.0426"
       y="115.79815"
       id="text254"
       label="text7"><tspan
         role="line"
         id="tspan254"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="129.0426"
         y="115.79815">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="125.86765"
       y="115.79815"
       id="text255"
       label="text8"><tspan
         role="line"
         id="tspan255"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="125.86765"
         y="115.79815">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.69262"
       y="115.79815"
       id="text256"
       label="text9"><tspan
         role="line"
         id="tspan256"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.69262"
         y="115.79815">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="119.21761"
       y="115.79815"
       id="text257"
       label="text10"><tspan
         role="line"
         id="tspan257"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="119.21761"
         y="115.79815">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="116.17159"
       y="115.79815"
       id="text258"
       label="text11"><tspan
         role="line"
         id="tspan258"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="116.17159"
         y="115.79815">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="113.09651"
       y="115.79815"
       id="text259"
       label="text12"><tspan
         role="line"
         id="tspan259"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="113.09651"
         y="115.79815">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="110.12144"
       y="115.79815"
       id="text260"
       label="text13"><tspan
         role="line"
         id="tspan260"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="110.12144"
         y="115.79815">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="106.94635"
       y="115.79815"
       id="text261"
       label="text14"><tspan
         role="line"
         id="tspan261"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="106.94635"
         y="115.79815">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="103.90022"
       y="115.79815"
       id="text262"
       label="text15"><tspan
         role="line"
         id="tspan262"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="103.90022"
         y="115.79815">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="100.82523"
       y="115.79815"
       id="text263"
       label="text16"><tspan
         role="line"
         id="tspan263"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="100.82523"
         y="115.79815">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.779221"
       y="115.79815"
       id="text264"
       label="text17"><tspan
         role="line"
         id="tspan264"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.779221"
         y="115.79815">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.704193"
       y="115.79815"
       id="text265"
       label="text18"><tspan
         role="line"
         id="tspan265"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.704193"
         y="115.79815">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="91.529121"
       y="115.79815"
       id="text266"
       label="text19"><tspan
         role="line"
         id="tspan266"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="91.529121"
         y="115.79815">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.683075"
       y="115.79815"
       id="text267"
       label="text20"><tspan
         role="line"
         id="tspan267"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.683075"
         y="115.79815">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.70797"
       y="115.79815"
       id="text268"
       label="text21"><tspan
         role="line"
         id="tspan268"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.70797"
         y="115.79815">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.320465"
       y="115.79819"
       id="text272"
       label="text22"><tspan
         role="line"
         id="tspan272"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.320465"
         y="115.79819">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="68.145462"
       y="115.79819"
       id="text273"
       label="text23"><tspan
         role="line"
         id="tspan273"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="68.145462"
         y="115.79819">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.870491"
       y="115.79819"
       id="text274"
       label="text24"><tspan
         role="line"
         id="tspan274"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.870491"
         y="115.79819">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.795456"
       y="115.79819"
       id="text275"
       label="text25"><tspan
         role="line"
         id="tspan275"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.795456"
         y="115.79819">25</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="58.620453"
       y="115.79819"
       id="text276"
       label="text26"><tspan
         role="line"
         id="tspan276"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="58.620453"
         y="115.79819">26</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.69966"
       y="112.06303"
       id="text279"
       label="text1"><tspan
         role="line"
         id="tspan279"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.69966"
         y="112.06303">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.35504"
       y="112.06303"
       id="text280"
       label="text2"><tspan
         role="line"
         id="tspan280"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.35504"
         y="112.06303">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.17999"
       y="112.06303"
       id="text281"
       label="text3"><tspan
         role="line"
         id="tspan281"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.17999"
         y="112.06303">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.00529"
       y="112.06303"
       id="text282"
       label="text4"><tspan
         role="line"
         id="tspan282"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.00529"
         y="112.06303">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="133.50476"
       y="112.07816"
       id="text298"
       label="text5"><tspan
         role="line"
         id="tspan298"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="133.50476"
         y="112.07816">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="130.52975"
       y="112.07816"
       id="text299"
       label="text6"><tspan
         role="line"
         id="tspan299"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="130.52975"
         y="112.07816">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="127.45472"
       y="112.07816"
       id="text300"
       label="text7"><tspan
         role="line"
         id="tspan300"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="127.45472"
         y="112.07816">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="124.27977"
       y="112.07816"
       id="text301"
       label="text8"><tspan
         role="line"
         id="tspan301"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="124.27977"
         y="112.07816">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="121.10474"
       y="112.07816"
       id="text302"
       label="text9"><tspan
         role="line"
         id="tspan302"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="121.10474"
         y="112.07816">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="117.62975"
       y="112.07816"
       id="text303"
       label="text10"><tspan
         role="line"
         id="tspan303"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="117.62975"
         y="112.07816">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="114.58372"
       y="112.07816"
       id="text304"
       label="text11"><tspan
         role="line"
         id="tspan304"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="114.58372"
         y="112.07816">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="111.50863"
       y="112.07816"
       id="text305"
       label="text12"><tspan
         role="line"
         id="tspan305"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="111.50863"
         y="112.07816">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="108.53357"
       y="112.07816"
       id="text306"
       label="text13"><tspan
         role="line"
         id="tspan306"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="108.53357"
         y="112.07816">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="105.35847"
       y="112.07816"
       id="text307"
       label="text14"><tspan
         role="line"
         id="tspan307"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="105.35847"
         y="112.07816">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="102.31236"
       y="112.07816"
       id="text308"
       label="text15"><tspan
         role="line"
         id="tspan308"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="102.31236"
         y="112.07816">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="99.237358"
       y="112.07816"
       id="text309"
       label="text16"><tspan
         role="line"
         id="tspan309"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="99.237358"
         y="112.07816">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="96.191322"
       y="112.07816"
       id="text310"
       label="text17"><tspan
         role="line"
         id="tspan310"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="96.191322"
         y="112.07816">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="93.116318"
       y="112.07816"
       id="text311"
       label="text18"><tspan
         role="line"
         id="tspan311"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="93.116318"
         y="112.07816">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="89.941246"
       y="112.07816"
       id="text312"
       label="text19"><tspan
         role="line"
         id="tspan312"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="89.941246"
         y="112.07816">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="87.0952"
       y="112.07816"
       id="text313"
       label="text20"><tspan
         role="line"
         id="tspan313"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="87.0952"
         y="112.07816">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="84.120094"
       y="112.07816"
       id="text314"
       label="text21"><tspan
         role="line"
         id="tspan314"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="84.120094"
         y="112.07816">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.320465"
       y="112.07818"
       id="text317"
       label="text22"><tspan
         role="line"
         id="tspan317"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.320465"
         y="112.07818">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="68.145462"
       y="112.07818"
       id="text318"
       label="text23"><tspan
         role="line"
         id="tspan318"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="68.145462"
         y="112.07818">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.870491"
       y="112.07818"
       id="text319"
       label="text24"><tspan
         role="line"
         id="tspan319"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.870491"
         y="112.07818">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.795456"
       y="112.07818"
       id="text320"
       label="text25"><tspan
         role="line"
         id="tspan320"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.795456"
         y="112.07818">25</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.69966"
       y="108.35886"
       id="text323"
       label="text1"><tspan
         role="line"
         id="tspan323"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.69966"
         y="108.35886">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.35504"
       y="108.35886"
       id="text324"
       label="text2"><tspan
         role="line"
         id="tspan324"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.35504"
         y="108.35886">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.17999"
       y="108.35886"
       id="text325"
       label="text3"><tspan
         role="line"
         id="tspan325"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.17999"
         y="108.35886">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.00529"
       y="108.35886"
       id="text326"
       label="text4"><tspan
         role="line"
         id="tspan326"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.00529"
         y="108.35886">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="135.09262"
       y="108.37399"
       id="text343"
       label="text5"><tspan
         role="line"
         id="tspan343"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="135.09262"
         y="108.37399">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="132.11761"
       y="108.37399"
       id="text344"
       label="text6"><tspan
         role="line"
         id="tspan344"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="132.11761"
         y="108.37399">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="129.0426"
       y="108.37399"
       id="text345"
       label="text7"><tspan
         role="line"
         id="tspan345"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="129.0426"
         y="108.37399">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="125.86765"
       y="108.37399"
       id="text346"
       label="text8"><tspan
         role="line"
         id="tspan346"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="125.86765"
         y="108.37399">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.69262"
       y="108.37399"
       id="text347"
       label="text9"><tspan
         role="line"
         id="tspan347"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.69262"
         y="108.37399">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="119.21761"
       y="108.37399"
       id="text348"
       label="text10"><tspan
         role="line"
         id="tspan348"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="119.21761"
         y="108.37399">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="116.17159"
       y="108.37399"
       id="text349"
       label="text11"><tspan
         role="line"
         id="tspan349"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="116.17159"
         y="108.37399">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="113.09651"
       y="108.37399"
       id="text350"
       label="text12"><tspan
         role="line"
         id="tspan350"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="113.09651"
         y="108.37399">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="110.12144"
       y="108.37399"
       id="text351"
       label="text13"><tspan
         role="line"
         id="tspan351"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="110.12144"
         y="108.37399">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="106.94635"
       y="108.37399"
       id="text352"
       label="text14"><tspan
         role="line"
         id="tspan352"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="106.94635"
         y="108.37399">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="103.90022"
       y="108.37399"
       id="text353"
       label="text15"><tspan
         role="line"
         id="tspan353"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="103.90022"
         y="108.37399">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="100.82523"
       y="108.37399"
       id="text354"
       label="text16"><tspan
         role="line"
         id="tspan354"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="100.82523"
         y="108.37399">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.779221"
       y="108.37399"
       id="text355"
       label="text17"><tspan
         role="line"
         id="tspan355"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.779221"
         y="108.37399">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.704193"
       y="108.37399"
       id="text356"
       label="text18"><tspan
         role="line"
         id="tspan356"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.704193"
         y="108.37399">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="91.529121"
       y="108.37399"
       id="text357"
       label="text19"><tspan
         role="line"
         id="tspan357"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="91.529121"
         y="108.37399">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.683075"
       y="108.37399"
       id="text358"
       label="text20"><tspan
         role="line"
         id="tspan358"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.683075"
         y="108.37399">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.70797"
       y="108.37399"
       id="text359"
       label="text21"><tspan
         role="line"
         id="tspan359"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.70797"
         y="108.37399">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.532944"
       y="108.37399"
       id="text360"
       label="text22"><tspan
         role="line"
         id="tspan360"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.532944"
         y="108.37399">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.320465"
       y="108.37399"
       id="text363"
       label="text23"><tspan
         role="line"
         id="tspan363"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.320465"
         y="108.37399">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="68.045494"
       y="108.37399"
       id="text364"
       label="text24"><tspan
         role="line"
         id="tspan364"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="68.045494"
         y="108.37399">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.970459"
       y="108.37399"
       id="text365"
       label="text25"><tspan
         role="line"
         id="tspan365"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.970459"
         y="108.37399">25</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.795456"
       y="108.37399"
       id="text366"
       label="text26"><tspan
         role="line"
         id="tspan366"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.795456"
         y="108.37399">26</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.69966"
       y="104.65469"
       id="text369"
       label="text1"><tspan
         role="line"
         id="tspan369"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.69966"
         y="104.65469">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.35504"
       y="104.65469"
       id="text370"
       label="text2"><tspan
         role="line"
         id="tspan370"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.35504"
         y="104.65469">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.17999"
       y="104.65469"
       id="text371"
       label="text3"><tspan
         role="line"
         id="tspan371"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.17999"
         y="104.65469">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.00529"
       y="104.65469"
       id="text372"
       label="text4"><tspan
         role="line"
         id="tspan372"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.00529"
         y="104.65469">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="136.68008"
       y="104.67015"
       id="text390"
       label="text5"><tspan
         role="line"
         id="tspan390"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="136.68008"
         y="104.67015">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="133.70508"
       y="104.67015"
       id="text391"
       label="text6"><tspan
         role="line"
         id="tspan391"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="133.70508"
         y="104.67015">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="130.63007"
       y="104.67015"
       id="text392"
       label="text7"><tspan
         role="line"
         id="tspan392"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="130.63007"
         y="104.67015">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="127.45514"
       y="104.67015"
       id="text393"
       label="text8"><tspan
         role="line"
         id="tspan393"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="127.45514"
         y="104.67015">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="124.28011"
       y="104.67015"
       id="text394"
       label="text9"><tspan
         role="line"
         id="tspan394"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="124.28011"
         y="104.67015">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="120.80511"
       y="104.67015"
       id="text395"
       label="text10"><tspan
         role="line"
         id="tspan395"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="120.80511"
         y="104.67015">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="117.75909"
       y="104.67015"
       id="text396"
       label="text11"><tspan
         role="line"
         id="tspan396"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="117.75909"
         y="104.67015">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="114.68398"
       y="104.67015"
       id="text397"
       label="text12"><tspan
         role="line"
         id="tspan397"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="114.68398"
         y="104.67015">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="111.70895"
       y="104.67015"
       id="text398"
       label="text13"><tspan
         role="line"
         id="tspan398"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="111.70895"
         y="104.67015">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="108.53386"
       y="104.67015"
       id="text399"
       label="text14"><tspan
         role="line"
         id="tspan399"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="108.53386"
         y="104.67015">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="105.48773"
       y="104.67015"
       id="text400"
       label="text15"><tspan
         role="line"
         id="tspan400"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="105.48773"
         y="104.67015">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="102.41273"
       y="104.67015"
       id="text401"
       label="text16"><tspan
         role="line"
         id="tspan401"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="102.41273"
         y="104.67015">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="99.366722"
       y="104.67015"
       id="text402"
       label="text17"><tspan
         role="line"
         id="tspan402"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="99.366722"
         y="104.67015">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="96.291672"
       y="104.67015"
       id="text403"
       label="text18"><tspan
         role="line"
         id="tspan403"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="96.291672"
         y="104.67015">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="93.116623"
       y="104.67015"
       id="text404"
       label="text19"><tspan
         role="line"
         id="tspan404"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="93.116623"
         y="104.67015">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="90.270576"
       y="104.67015"
       id="text405"
       label="text20"><tspan
         role="line"
         id="tspan405"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="90.270576"
         y="104.67015">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="87.295471"
       y="104.67015"
       id="text406"
       label="text21"><tspan
         role="line"
         id="tspan406"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="87.295471"
         y="104.67015">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="84.120445"
       y="104.67015"
       id="text407"
       label="text22"><tspan
         role="line"
         id="tspan407"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="84.120445"
         y="104.67015">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="80.945442"
       y="104.67015"
       id="text408"
       label="text23"><tspan
         role="line"
         id="tspan408"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="80.945442"
         y="104.67015">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.320465"
       y="104.67016"
       id="text411"
       label="text24"><tspan
         role="line"
         id="tspan411"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.320465"
         y="104.67016">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="68.24543"
       y="104.67016"
       id="text412"
       label="text25"><tspan
         role="line"
         id="tspan412"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="68.24543"
         y="104.67016">25</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="65.070427"
       y="104.67016"
       id="text413"
       label="text26"><tspan
         role="line"
         id="tspan413"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="65.070427"
         y="104.67016">26</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.895424"
       y="104.67016"
       id="text414"
       label="text27"><tspan
         role="line"
         id="tspan414"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.895424"
         y="104.67016">27</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="138.33768"
       y="100.98167"
       id="text421"
       label="text1"><tspan
         role="line"
         id="tspan421"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="138.33768"
         y="100.98167">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.99269"
       y="100.98167"
       id="text422"
       label="text2"><tspan
         role="line"
         id="tspan422"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.99269"
         y="100.98167">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.81764"
       y="100.98167"
       id="text423"
       label="text3"><tspan
         role="line"
         id="tspan423"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.81764"
         y="100.98167">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.74271"
       y="100.98167"
       id="text424"
       label="text4"><tspan
         role="line"
         id="tspan424"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.74271"
         y="100.98167">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="125.56773"
       y="100.98167"
       id="text425"
       label="text5"><tspan
         role="line"
         id="tspan425"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="125.56773"
         y="100.98167">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.59267"
       y="100.98167"
       id="text426"
       label="text6"><tspan
         role="line"
         id="tspan426"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.59267"
         y="100.98167">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="119.51762"
       y="100.98167"
       id="text427"
       label="text7"><tspan
         role="line"
         id="tspan427"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="119.51762"
         y="100.98167">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="116.34268"
       y="100.98167"
       id="text428"
       label="text8"><tspan
         role="line"
         id="tspan428"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="116.34268"
         y="100.98167">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.52594"
       y="100.96603"
       id="text435"
       label="text9"><tspan
         role="line"
         id="tspan435"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.52594"
         y="100.96603">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="98.050941"
       y="100.96603"
       id="text436"
       label="text10"><tspan
         role="line"
         id="tspan436"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="98.050941"
         y="100.96603">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="95.004921"
       y="100.96603"
       id="text437"
       label="text11"><tspan
         role="line"
         id="tspan437"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="95.004921"
         y="100.96603">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="91.929832"
       y="100.96603"
       id="text438"
       label="text12"><tspan
         role="line"
         id="tspan438"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="91.929832"
         y="100.96603">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.954773"
       y="100.96603"
       id="text439"
       label="text13"><tspan
         role="line"
         id="tspan439"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.954773"
         y="100.96603">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.779678"
       y="100.96603"
       id="text440"
       label="text14"><tspan
         role="line"
         id="tspan440"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.779678"
         y="100.96603">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.733543"
       y="100.96603"
       id="text441"
       label="text15"><tspan
         role="line"
         id="tspan441"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.733543"
         y="100.96603">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.658546"
       y="100.96603"
       id="text442"
       label="text16"><tspan
         role="line"
         id="tspan442"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.658546"
         y="100.96603">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.62498"
       y="89.293312"
       id="text510"
       label="text1"><tspan
         role="line"
         id="tspan510"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.62498"
         y="89.293312">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.28"
       y="89.293312"
       id="text511"
       label="text2"><tspan
         role="line"
         id="tspan511"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.28"
         y="89.293312">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.10495"
       y="89.293312"
       id="text512"
       label="text3"><tspan
         role="line"
         id="tspan512"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.10495"
         y="89.293312">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="143.03001"
       y="89.293312"
       id="text513"
       label="text4"><tspan
         role="line"
         id="tspan513"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="143.03001"
         y="89.293312">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="139.85506"
       y="89.293312"
       id="text514"
       label="text5"><tspan
         role="line"
         id="tspan514"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="139.85506"
         y="89.293312">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="136.88005"
       y="89.293312"
       id="text515"
       label="text6"><tspan
         role="line"
         id="tspan515"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="136.88005"
         y="89.293312">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="133.80504"
       y="89.293312"
       id="text516"
       label="text7"><tspan
         role="line"
         id="tspan516"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="133.80504"
         y="89.293312">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="130.63013"
       y="89.293312"
       id="text517"
       label="text8"><tspan
         role="line"
         id="tspan517"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="130.63013"
         y="89.293312">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="127.45509"
       y="89.293312"
       id="text518"
       label="text9"><tspan
         role="line"
         id="tspan518"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="127.45509"
         y="89.293312">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="123.98012"
       y="89.293312"
       id="text519"
       label="text10"><tspan
         role="line"
         id="tspan519"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="123.98012"
         y="89.293312">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="120.93407"
       y="89.293312"
       id="text520"
       label="text11"><tspan
         role="line"
         id="tspan520"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="120.93407"
         y="89.293312">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.575668"
       y="89.278191"
       id="text521"
       label="text12"><tspan
         role="line"
         id="tspan521"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.575668"
         y="89.278191">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="91.600609"
       y="89.278191"
       id="text522"
       label="text13"><tspan
         role="line"
         id="tspan522"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="91.600609"
         y="89.278191">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.425514"
       y="89.278191"
       id="text523"
       label="text14"><tspan
         role="line"
         id="tspan523"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.425514"
         y="89.278191">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.379379"
       y="89.278191"
       id="text524"
       label="text15"><tspan
         role="line"
         id="tspan524"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.379379"
         y="89.278191">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.304382"
       y="89.278191"
       id="text525"
       label="text16"><tspan
         role="line"
         id="tspan525"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.304382"
         y="89.278191">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.258392"
       y="89.278191"
       id="text526"
       label="text17"><tspan
         role="line"
         id="tspan526"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.258392"
         y="89.278191">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="76.183342"
       y="89.278191"
       id="text527"
       label="text18"><tspan
         role="line"
         id="tspan527"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="76.183342"
         y="89.278191">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="73.00827"
       y="89.278191"
       id="text528"
       label="text19"><tspan
         role="line"
         id="tspan528"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="73.00827"
         y="89.278191">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="70.162224"
       y="89.278191"
       id="text529"
       label="text20"><tspan
         role="line"
         id="tspan529"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="70.162224"
         y="89.278191">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="67.187119"
       y="89.278191"
       id="text530"
       label="text21"><tspan
         role="line"
         id="tspan530"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="67.187119"
         y="89.278191">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.012093"
       y="89.278191"
       id="text531"
       label="text22"><tspan
         role="line"
         id="tspan531"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.012093"
         y="89.278191">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="161.82021"
       y="85.58963"
       id="text575"
       label="text1"><tspan
         role="line"
         id="tspan575"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="161.82021"
         y="85.58963">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.47522"
       y="85.58963"
       id="text576"
       label="text2"><tspan
         role="line"
         id="tspan576"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.47522"
         y="85.58963">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.30017"
       y="85.58963"
       id="text577"
       label="text3"><tspan
         role="line"
         id="tspan577"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.30017"
         y="85.58963">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.22523"
       y="85.58963"
       id="text578"
       label="text4"><tspan
         role="line"
         id="tspan578"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.22523"
         y="85.58963">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.05028"
       y="85.58963"
       id="text579"
       label="text5"><tspan
         role="line"
         id="tspan579"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.05028"
         y="85.58963">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.07527"
       y="85.58963"
       id="text580"
       label="text6"><tspan
         role="line"
         id="tspan580"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.07527"
         y="85.58963">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="143.00026"
       y="85.58963"
       id="text581"
       label="text7"><tspan
         role="line"
         id="tspan581"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="143.00026"
         y="85.58963">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="139.82535"
       y="85.58963"
       id="text582"
       label="text8"><tspan
         role="line"
         id="tspan582"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="139.82535"
         y="85.58963">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="136.65036"
       y="85.58963"
       id="text583"
       label="text9"><tspan
         role="line"
         id="tspan583"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="136.65036"
         y="85.58963">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="133.1754"
       y="85.58963"
       id="text584"
       label="text10"><tspan
         role="line"
         id="tspan584"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="133.1754"
         y="85.58963">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="130.12936"
       y="85.58963"
       id="text585"
       label="text11"><tspan
         role="line"
         id="tspan585"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="130.12936"
         y="85.58963">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="127.05437"
       y="85.58963"
       id="text586"
       label="text12"><tspan
         role="line"
         id="tspan586"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="127.05437"
         y="85.58963">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="124.07928"
       y="85.58963"
       id="text587"
       label="text13"><tspan
         role="line"
         id="tspan587"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="124.07928"
         y="85.58963">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="120.9042"
       y="85.58963"
       id="text588"
       label="text14"><tspan
         role="line"
         id="tspan588"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="120.9042"
         y="85.58963">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="117.85809"
       y="85.58963"
       id="text589"
       label="text15"><tspan
         role="line"
         id="tspan589"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="117.85809"
         y="85.58963">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="114.7831"
       y="85.58963"
       id="text590"
       label="text16"><tspan
         role="line"
         id="tspan590"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="114.7831"
         y="85.58963">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="100.75443"
       y="85.57402"
       id="text605"
       label="text17"><tspan
         role="line"
         id="tspan605"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="100.75443"
         y="85.57402">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.679405"
       y="85.57402"
       id="text606"
       label="text18"><tspan
         role="line"
         id="tspan606"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.679405"
         y="85.57402">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.504333"
       y="85.57402"
       id="text607"
       label="text19"><tspan
         role="line"
         id="tspan607"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.504333"
         y="85.57402">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="91.658287"
       y="85.57402"
       id="text608"
       label="text20"><tspan
         role="line"
         id="tspan608"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="91.658287"
         y="85.57402">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.683182"
       y="85.57402"
       id="text609"
       label="text21"><tspan
         role="line"
         id="tspan609"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.683182"
         y="85.57402">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.508156"
       y="85.57402"
       id="text610"
       label="text22"><tspan
         role="line"
         id="tspan610"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.508156"
         y="85.57402">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.333153"
       y="85.57402"
       id="text611"
       label="text23"><tspan
         role="line"
         id="tspan611"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.333153"
         y="85.57402">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.058182"
       y="85.57402"
       id="text612"
       label="text24"><tspan
         role="line"
         id="tspan612"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.058182"
         y="85.57402">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="75.983147"
       y="85.57402"
       id="text613"
       label="text25"><tspan
         role="line"
         id="tspan613"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="75.983147"
         y="85.57402">25</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="72.808144"
       y="85.57402"
       id="text614"
       label="text26"><tspan
         role="line"
         id="tspan614"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="72.808144"
         y="85.57402">26</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="69.633141"
       y="85.57402"
       id="text615"
       label="text27"><tspan
         role="line"
         id="tspan615"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="69.633141"
         y="85.57402">27</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="66.458115"
       y="85.57402"
       id="text616"
       label="text28"><tspan
         role="line"
         id="tspan616"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="66.458115"
         y="85.57402">28</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="63.283123"
       y="85.57402"
       id="text617"
       label="text29"><tspan
         role="line"
         id="tspan617"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="63.283123"
         y="85.57402">29</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="60.308125"
       y="85.57402"
       id="text618"
       label="text30"><tspan
         role="line"
         id="tspan618"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="60.308125"
         y="85.57402">30</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="57.133114"
       y="85.57402"
       id="text619"
       label="text31"><tspan
         role="line"
         id="tspan619"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="57.133114"
         y="85.57402">31</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="53.958107"
       y="85.57402"
       id="text620"
       label="text32"><tspan
         role="line"
         id="tspan620"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="53.958107"
         y="85.57402">32</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.74529"
       y="81.88546"
       id="text662"
       label="text1"><tspan
         role="line"
         id="tspan662"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.74529"
         y="81.88546">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.4003"
       y="81.88546"
       id="text663"
       label="text2"><tspan
         role="line"
         id="tspan663"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.4003"
         y="81.88546">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.22525"
       y="81.88546"
       id="text664"
       label="text3"><tspan
         role="line"
         id="tspan664"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.22525"
         y="81.88546">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.15031"
       y="81.88546"
       id="text665"
       label="text4"><tspan
         role="line"
         id="tspan665"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.15031"
         y="81.88546">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="145.97536"
       y="81.88546"
       id="text666"
       label="text5"><tspan
         role="line"
         id="tspan666"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="145.97536"
         y="81.88546">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="143.00035"
       y="81.88546"
       id="text667"
       label="text6"><tspan
         role="line"
         id="tspan667"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="143.00035"
         y="81.88546">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="139.92534"
       y="81.88546"
       id="text668"
       label="text7"><tspan
         role="line"
         id="tspan668"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="139.92534"
         y="81.88546">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="136.75043"
       y="81.88546"
       id="text669"
       label="text8"><tspan
         role="line"
         id="tspan669"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="136.75043"
         y="81.88546">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="133.57544"
       y="81.88546"
       id="text670"
       label="text9"><tspan
         role="line"
         id="tspan670"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="133.57544"
         y="81.88546">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="130.10048"
       y="81.88546"
       id="text671"
       label="text10"><tspan
         role="line"
         id="tspan671"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="130.10048"
         y="81.88546">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="127.05442"
       y="81.88546"
       id="text672"
       label="text11"><tspan
         role="line"
         id="tspan672"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="127.05442"
         y="81.88546">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="123.97941"
       y="81.88546"
       id="text673"
       label="text12"><tspan
         role="line"
         id="tspan673"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="123.97941"
         y="81.88546">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="121.00432"
       y="81.88546"
       id="text674"
       label="text13"><tspan
         role="line"
         id="tspan674"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="121.00432"
         y="81.88546">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="117.82923"
       y="81.88546"
       id="text675"
       label="text14"><tspan
         role="line"
         id="tspan675"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="117.82923"
         y="81.88546">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="114.78314"
       y="81.88546"
       id="text676"
       label="text15"><tspan
         role="line"
         id="tspan676"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="114.78314"
         y="81.88546">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="100.72544"
       y="81.884972"
       id="text690"
       label="text16"><tspan
         role="line"
         id="tspan690"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="100.72544"
         y="81.884972">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.679428"
       y="81.884972"
       id="text691"
       label="text17"><tspan
         role="line"
         id="tspan691"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.679428"
         y="81.884972">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.604401"
       y="81.884972"
       id="text692"
       label="text18"><tspan
         role="line"
         id="tspan692"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.604401"
         y="81.884972">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="91.429329"
       y="81.884972"
       id="text693"
       label="text19"><tspan
         role="line"
         id="tspan693"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="91.429329"
         y="81.884972">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.583282"
       y="81.884972"
       id="text694"
       label="text20"><tspan
         role="line"
         id="tspan694"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.583282"
         y="81.884972">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.608177"
       y="81.884972"
       id="text695"
       label="text21"><tspan
         role="line"
         id="tspan695"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.608177"
         y="81.884972">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.433151"
       y="81.884972"
       id="text696"
       label="text22"><tspan
         role="line"
         id="tspan696"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.433151"
         y="81.884972">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.258148"
       y="81.884972"
       id="text697"
       label="text23"><tspan
         role="line"
         id="tspan697"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.258148"
         y="81.884972">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="75.983177"
       y="81.884972"
       id="text698"
       label="text24"><tspan
         role="line"
         id="tspan698"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="75.983177"
         y="81.884972">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="72.908142"
       y="81.884972"
       id="text699"
       label="text25"><tspan
         role="line"
         id="tspan699"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="72.908142"
         y="81.884972">25</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="69.733139"
       y="81.884972"
       id="text700"
       label="text26"><tspan
         role="line"
         id="tspan700"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="69.733139"
         y="81.884972">26</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="66.558136"
       y="81.884972"
       id="text701"
       label="text27"><tspan
         role="line"
         id="tspan701"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="66.558136"
         y="81.884972">27</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="63.383106"
       y="81.884972"
       id="text702"
       label="text28"><tspan
         role="line"
         id="tspan702"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="63.383106"
         y="81.884972">28</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="60.208118"
       y="81.884972"
       id="text703"
       label="text29"><tspan
         role="line"
         id="tspan703"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="60.208118"
         y="81.884972">29</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="57.23312"
       y="81.884972"
       id="text704"
       label="text30"><tspan
         role="line"
         id="tspan704"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="57.23312"
         y="81.884972">30</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.77028"
       y="78.18129"
       id="text717"
       label="text1"><tspan
         role="line"
         id="tspan717"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.77028"
         y="78.18129">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.42529"
       y="78.18129"
       id="text718"
       label="text2"><tspan
         role="line"
         id="tspan718"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.42529"
         y="78.18129">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.25024"
       y="78.18129"
       id="text719"
       label="text3"><tspan
         role="line"
         id="tspan719"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.25024"
         y="78.18129">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.17531"
       y="78.18129"
       id="text720"
       label="text4"><tspan
         role="line"
         id="tspan720"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.17531"
         y="78.18129">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="143.00035"
       y="78.18129"
       id="text721"
       label="text5"><tspan
         role="line"
         id="tspan721"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="143.00035"
         y="78.18129">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="140.02534"
       y="78.18129"
       id="text722"
       label="text6"><tspan
         role="line"
         id="tspan722"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="140.02534"
         y="78.18129">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="136.95033"
       y="78.18129"
       id="text723"
       label="text7"><tspan
         role="line"
         id="tspan723"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="136.95033"
         y="78.18129">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="133.77542"
       y="78.18129"
       id="text724"
       label="text8"><tspan
         role="line"
         id="tspan724"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="133.77542"
         y="78.18129">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="130.60043"
       y="78.18129"
       id="text725"
       label="text9"><tspan
         role="line"
         id="tspan725"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="130.60043"
         y="78.18129">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="127.12545"
       y="78.18129"
       id="text726"
       label="text10"><tspan
         role="line"
         id="tspan726"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="127.12545"
         y="78.18129">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="124.07938"
       y="78.18129"
       id="text727"
       label="text11"><tspan
         role="line"
         id="tspan727"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="124.07938"
         y="78.18129">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="121.00434"
       y="78.18129"
       id="text728"
       label="text12"><tspan
         role="line"
         id="tspan728"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="121.00434"
         y="78.18129">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="118.02924"
       y="78.18129"
       id="text729"
       label="text13"><tspan
         role="line"
         id="tspan729"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="118.02924"
         y="78.18129">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="114.85416"
       y="78.18129"
       id="text730"
       label="text14"><tspan
         role="line"
         id="tspan730"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="114.85416"
         y="78.18129">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="100.72523"
       y="78.180801"
       id="text743"
       label="text15"><tspan
         role="line"
         id="tspan743"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="100.72523"
         y="78.180801">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.65023"
       y="78.180801"
       id="text744"
       label="text16"><tspan
         role="line"
         id="tspan744"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.65023"
         y="78.180801">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.604218"
       y="78.180801"
       id="text745"
       label="text17"><tspan
         role="line"
         id="tspan745"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.604218"
         y="78.180801">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="91.52919"
       y="78.180801"
       id="text746"
       label="text18"><tspan
         role="line"
         id="tspan746"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="91.52919"
         y="78.180801">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.354118"
       y="78.180801"
       id="text747"
       label="text19"><tspan
         role="line"
         id="tspan747"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.354118"
         y="78.180801">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.508072"
       y="78.180801"
       id="text748"
       label="text20"><tspan
         role="line"
         id="tspan748"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.508072"
         y="78.180801">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.532967"
       y="78.180801"
       id="text749"
       label="text21"><tspan
         role="line"
         id="tspan749"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.532967"
         y="78.180801">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.357941"
       y="78.180801"
       id="text750"
       label="text22"><tspan
         role="line"
         id="tspan750"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.357941"
         y="78.180801">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="76.182938"
       y="78.180801"
       id="text751"
       label="text23"><tspan
         role="line"
         id="tspan751"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="76.182938"
         y="78.180801">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="72.907967"
       y="78.180801"
       id="text752"
       label="text24"><tspan
         role="line"
         id="tspan752"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="72.907967"
         y="78.180801">24</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="69.832932"
       y="78.180801"
       id="text753"
       label="text25"><tspan
         role="line"
         id="tspan753"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="69.832932"
         y="78.180801">25</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="66.657928"
       y="78.180801"
       id="text754"
       label="text26"><tspan
         role="line"
         id="tspan754"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="66.657928"
         y="78.180801">26</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="63.482925"
       y="78.180801"
       id="text755"
       label="text27"><tspan
         role="line"
         id="tspan755"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="63.482925"
         y="78.180801">27</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="60.307899"
       y="78.180801"
       id="text756"
       label="text28"><tspan
         role="line"
         id="tspan756"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="60.307899"
         y="78.180801">28</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.62022"
       y="74.477119"
       id="text767"
       label="text1"><tspan
         role="line"
         id="tspan767"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.62022"
         y="74.477119">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.27524"
       y="74.477119"
       id="text768"
       label="text2"><tspan
         role="line"
         id="tspan768"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.27524"
         y="74.477119">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="143.10019"
       y="74.477119"
       id="text769"
       label="text3"><tspan
         role="line"
         id="tspan769"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="143.10019"
         y="74.477119">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="140.02525"
       y="74.477119"
       id="text770"
       label="text4"><tspan
         role="line"
         id="tspan770"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="140.02525"
         y="74.477119">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="136.8503"
       y="74.477119"
       id="text771"
       label="text5"><tspan
         role="line"
         id="tspan771"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="136.8503"
         y="74.477119">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="133.87529"
       y="74.477119"
       id="text772"
       label="text6"><tspan
         role="line"
         id="tspan772"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="133.87529"
         y="74.477119">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="130.80028"
       y="74.477119"
       id="text773"
       label="text7"><tspan
         role="line"
         id="tspan773"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="130.80028"
         y="74.477119">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="127.62535"
       y="74.477119"
       id="text774"
       label="text8"><tspan
         role="line"
         id="tspan774"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="127.62535"
         y="74.477119">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="124.45032"
       y="74.477119"
       id="text775"
       label="text9"><tspan
         role="line"
         id="tspan775"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="124.45032"
         y="74.477119">9</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="120.97533"
       y="74.477119"
       id="text776"
       label="text10"><tspan
         role="line"
         id="tspan776"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="120.97533"
         y="74.477119">10</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="117.92924"
       y="74.477119"
       id="text777"
       label="text11"><tspan
         role="line"
         id="tspan777"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="117.92924"
         y="74.477119">11</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="114.85419"
       y="74.477119"
       id="text778"
       label="text12"><tspan
         role="line"
         id="tspan778"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="114.85419"
         y="74.477119">12</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="100.79659"
       y="74.477188"
       id="text788"
       label="text13"><tspan
         role="line"
         id="tspan788"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="100.79659"
         y="74.477188">13</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.621506"
       y="74.477188"
       id="text789"
       label="text14"><tspan
         role="line"
         id="tspan789"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.621506"
         y="74.477188">14</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.575371"
       y="74.477188"
       id="text790"
       label="text15"><tspan
         role="line"
         id="tspan790"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.575371"
         y="74.477188">15</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="91.500374"
       y="74.477188"
       id="text791"
       label="text16"><tspan
         role="line"
         id="tspan791"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="91.500374"
         y="74.477188">16</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.454361"
       y="74.477188"
       id="text792"
       label="text17"><tspan
         role="line"
         id="tspan792"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.454361"
         y="74.477188">17</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.379333"
       y="74.477188"
       id="text793"
       label="text18"><tspan
         role="line"
         id="tspan793"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.379333"
         y="74.477188">18</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.204262"
       y="74.477188"
       id="text794"
       label="text19"><tspan
         role="line"
         id="tspan794"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.204262"
         y="74.477188">19</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.358215"
       y="74.477188"
       id="text795"
       label="text20"><tspan
         role="line"
         id="tspan795"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.358215"
         y="74.477188">20</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="76.38311"
       y="74.477188"
       id="text796"
       label="text21"><tspan
         role="line"
         id="tspan796"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="76.38311"
         y="74.477188">21</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="73.208084"
       y="74.477188"
       id="text797"
       label="text22"><tspan
         role="line"
         id="tspan797"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="73.208084"
         y="74.477188">22</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="70.033081"
       y="74.477188"
       id="text798"
       label="text23"><tspan
         role="line"
         id="tspan798"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="70.033081"
         y="74.477188">23</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.10384"
       y="57.54377"
       id="text815"
       label="text1"><tspan
         role="line"
         id="tspan815"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.10384"
         y="57.54377">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="118.75879"
       y="57.54377"
       id="text816"
       label="text2"><tspan
         role="line"
         id="tspan816"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="118.75879"
         y="57.54377">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="115.58371"
       y="57.54377"
       id="text817"
       label="text3"><tspan
         role="line"
         id="tspan817"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="115.58371"
         y="57.54377">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="112.50872"
       y="57.54377"
       id="text818"
       label="text4"><tspan
         role="line"
         id="tspan818"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="112.50872"
         y="57.54377">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="57.54377"
       id="text819"
       label="text5"><tspan
         role="line"
         id="tspan819"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="57.54377">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="57.54377"
       id="text820"
       label="text6"><tspan
         role="line"
         id="tspan820"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="57.54377">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="57.54377"
       id="text821"
       label="text7"><tspan
         role="line"
         id="tspan821"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="57.54377">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="57.54377"
       id="text822"
       label="text8"><tspan
         role="line"
         id="tspan822"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="57.54377">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.10384"
       y="53.8396"
       id="text829"
       label="text1"><tspan
         role="line"
         id="tspan829"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.10384"
         y="53.8396">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="118.75879"
       y="53.8396"
       id="text830"
       label="text2"><tspan
         role="line"
         id="tspan830"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="118.75879"
         y="53.8396">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="115.58371"
       y="53.8396"
       id="text831"
       label="text3"><tspan
         role="line"
         id="tspan831"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="115.58371"
         y="53.8396">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="112.50872"
       y="53.8396"
       id="text832"
       label="text4"><tspan
         role="line"
         id="tspan832"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="112.50872"
         y="53.8396">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="53.8396"
       id="text833"
       label="text5"><tspan
         role="line"
         id="tspan833"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="53.8396">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="53.8396"
       id="text834"
       label="text6"><tspan
         role="line"
         id="tspan834"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="53.8396">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="53.8396"
       id="text835"
       label="text7"><tspan
         role="line"
         id="tspan835"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="53.8396">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="53.8396"
       id="text836"
       label="text8"><tspan
         role="line"
         id="tspan836"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="53.8396">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.10384"
       y="50.135429"
       id="text843"
       label="text1"><tspan
         role="line"
         id="tspan843"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.10384"
         y="50.135429">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="118.75879"
       y="50.135429"
       id="text844"
       label="text2"><tspan
         role="line"
         id="tspan844"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="118.75879"
         y="50.135429">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="115.58371"
       y="50.135429"
       id="text845"
       label="text3"><tspan
         role="line"
         id="tspan845"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="115.58371"
         y="50.135429">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="112.50872"
       y="50.135429"
       id="text846"
       label="text4"><tspan
         role="line"
         id="tspan846"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="112.50872"
         y="50.135429">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="50.135429"
       id="text847"
       label="text5"><tspan
         role="line"
         id="tspan847"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="50.135429">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="50.135429"
       id="text848"
       label="text6"><tspan
         role="line"
         id="tspan848"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="50.135429">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="50.135429"
       id="text849"
       label="text7"><tspan
         role="line"
         id="tspan849"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="50.135429">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="50.135429"
       id="text850"
       label="text8"><tspan
         role="line"
         id="tspan850"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="50.135429">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.10384"
       y="37.864143"
       id="text879"
       label="text1"><tspan
         role="line"
         id="tspan879"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.10384"
         y="37.864143">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="118.75879"
       y="37.864143"
       id="text880"
       label="text2"><tspan
         role="line"
         id="tspan880"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="118.75879"
         y="37.864143">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="115.58371"
       y="37.864143"
       id="text881"
       label="text3"><tspan
         role="line"
         id="tspan881"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="115.58371"
         y="37.864143">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="112.50872"
       y="37.864143"
       id="text882"
       label="text4"><tspan
         role="line"
         id="tspan882"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="112.50872"
         y="37.864143">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="37.864143"
       id="text883"
       label="text5"><tspan
         role="line"
         id="tspan883"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="37.864143">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="37.864143"
       id="text884"
       label="text6"><tspan
         role="line"
         id="tspan884"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="37.864143">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="37.864143"
       id="text885"
       label="text7"><tspan
         role="line"
         id="tspan885"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="37.864143">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="37.864143"
       id="text886"
       label="text8"><tspan
         role="line"
         id="tspan886"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="37.864143">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.10384"
       y="34.159973"
       id="text887"
       label="text1"><tspan
         role="line"
         id="tspan887"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.10384"
         y="34.159973">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="118.75879"
       y="34.159973"
       id="text888"
       label="text2"><tspan
         role="line"
         id="tspan888"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="118.75879"
         y="34.159973">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="115.58371"
       y="34.159973"
       id="text889"
       label="text3"><tspan
         role="line"
         id="tspan889"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="115.58371"
         y="34.159973">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="112.50872"
       y="34.159973"
       id="text890"
       label="text4"><tspan
         role="line"
         id="tspan890"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="112.50872"
         y="34.159973">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="34.159973"
       id="text891"
       label="text5"><tspan
         role="line"
         id="tspan891"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="34.159973">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="34.159973"
       id="text892"
       label="text6"><tspan
         role="line"
         id="tspan892"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="34.159973">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="34.159973"
       id="text893"
       label="text7"><tspan
         role="line"
         id="tspan893"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="34.159973">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="34.159973"
       id="text894"
       label="text8"><tspan
         role="line"
         id="tspan894"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="34.159973">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="122.10384"
       y="30.455797"
       id="text895"
       label="text1"><tspan
         role="line"
         id="tspan895"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="122.10384"
         y="30.455797">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="118.75879"
       y="30.455797"
       id="text896"
       label="text2"><tspan
         role="line"
         id="tspan896"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="118.75879"
         y="30.455797">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="115.58371"
       y="30.455797"
       id="text897"
       label="text3"><tspan
         role="line"
         id="tspan897"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="115.58371"
         y="30.455797">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="112.50872"
       y="30.455797"
       id="text898"
       label="text4"><tspan
         role="line"
         id="tspan898"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="112.50872"
         y="30.455797">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="30.455797"
       id="text899"
       label="text5"><tspan
         role="line"
         id="tspan899"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="30.455797">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="30.455797"
       id="text900"
       label="text6"><tspan
         role="line"
         id="tspan900"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="30.455797">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="30.455797"
       id="text901"
       label="text7"><tspan
         role="line"
         id="tspan901"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="30.455797">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="30.455797"
       id="text902"
       label="text8"><tspan
         role="line"
         id="tspan902"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="30.455797">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="57.84359"
       id="text933"
       label="text1"><tspan
         role="line"
         id="tspan933"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="57.84359">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="57.843758"
       id="text934"
       label="text2"><tspan
         role="line"
         id="tspan934"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="57.843758">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="57.843761"
       id="text935"
       label="text3"><tspan
         role="line"
         id="tspan935"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="57.843761">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="57.843765"
       id="text936"
       label="text4"><tspan
         role="line"
         id="tspan936"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="57.843765">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="54.13942"
       id="text937"
       label="text1"><tspan
         role="line"
         id="tspan937"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="54.13942">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="54.139587"
       id="text938"
       label="text2"><tspan
         role="line"
         id="tspan938"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="54.139587">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="54.139591"
       id="text939"
       label="text3"><tspan
         role="line"
         id="tspan939"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="54.139591">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="54.139595"
       id="text940"
       label="text4"><tspan
         role="line"
         id="tspan940"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="54.139595">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="50.435249"
       id="text941"
       label="text1"><tspan
         role="line"
         id="tspan941"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="50.435249">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="50.435417"
       id="text942"
       label="text2"><tspan
         role="line"
         id="tspan942"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="50.435417">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="50.435421"
       id="text943"
       label="text3"><tspan
         role="line"
         id="tspan943"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="50.435421">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="50.435425"
       id="text944"
       label="text4"><tspan
         role="line"
         id="tspan944"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="50.435425">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="38.163963"
       id="text945"
       label="text1"><tspan
         role="line"
         id="tspan945"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="38.163963">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="38.164131"
       id="text946"
       label="text2"><tspan
         role="line"
         id="tspan946"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="38.164131">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="38.164135"
       id="text947"
       label="text3"><tspan
         role="line"
         id="tspan947"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="38.164135">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="38.164139"
       id="text948"
       label="text4"><tspan
         role="line"
         id="tspan948"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="38.164139">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="34.459793"
       id="text949"
       label="text1"><tspan
         role="line"
         id="tspan949"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="34.459793">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="34.459961"
       id="text950"
       label="text2"><tspan
         role="line"
         id="tspan950"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="34.459961">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="34.459965"
       id="text951"
       label="text3"><tspan
         role="line"
         id="tspan951"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="34.459965">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="34.459969"
       id="text952"
       label="text4"><tspan
         role="line"
         id="tspan952"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="34.459969">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.60365"
       y="30.755798"
       id="text953"
       label="text1"><tspan
         role="line"
         id="tspan953"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.60365"
         y="30.755798">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.25864"
       y="30.755798"
       id="text954"
       label="text2"><tspan
         role="line"
         id="tspan954"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.25864"
         y="30.755798">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08359"
       y="30.756189"
       id="text955"
       label="text3"><tspan
         role="line"
         id="tspan955"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08359"
         y="30.756189">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="57.54377"
       id="text979"
       label="text5"><tspan
         role="line"
         id="tspan979"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="57.54377">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="57.54377"
       id="text980"
       label="text6"><tspan
         role="line"
         id="tspan980"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="57.54377">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="57.54377"
       id="text981"
       label="text7"><tspan
         role="line"
         id="tspan981"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="57.54377">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="57.54377"
       id="text982"
       label="text8"><tspan
         role="line"
         id="tspan982"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="57.54377">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="53.8396"
       id="text983"
       label="text5"><tspan
         role="line"
         id="tspan983"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="53.8396">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="53.8396"
       id="text984"
       label="text6"><tspan
         role="line"
         id="tspan984"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="53.8396">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="53.8396"
       id="text985"
       label="text7"><tspan
         role="line"
         id="tspan985"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="53.8396">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="53.8396"
       id="text986"
       label="text8"><tspan
         role="line"
         id="tspan986"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="53.8396">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="50.135429"
       id="text987"
       label="text5"><tspan
         role="line"
         id="tspan987"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="50.135429">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="50.135429"
       id="text988"
       label="text6"><tspan
         role="line"
         id="tspan988"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="50.135429">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="50.135429"
       id="text989"
       label="text7"><tspan
         role="line"
         id="tspan989"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="50.135429">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="50.135429"
       id="text990"
       label="text8"><tspan
         role="line"
         id="tspan990"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="50.135429">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="37.864143"
       id="text991"
       label="text5"><tspan
         role="line"
         id="tspan991"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="37.864143">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="37.864143"
       id="text992"
       label="text6"><tspan
         role="line"
         id="tspan992"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="37.864143">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="37.864143"
       id="text993"
       label="text7"><tspan
         role="line"
         id="tspan993"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="37.864143">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="37.864143"
       id="text994"
       label="text8"><tspan
         role="line"
         id="tspan994"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="37.864143">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="34.159973"
       id="text995"
       label="text5"><tspan
         role="line"
         id="tspan995"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="34.159973">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="34.159973"
       id="text996"
       label="text6"><tspan
         role="line"
         id="tspan996"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="34.159973">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="34.159973"
       id="text997"
       label="text7"><tspan
         role="line"
         id="tspan997"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="34.159973">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="34.159973"
       id="text998"
       label="text8"><tspan
         role="line"
         id="tspan998"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="34.159973">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="104.04212"
       y="30.455797"
       id="text999"
       label="text5"><tspan
         role="line"
         id="tspan999"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="104.04212"
         y="30.455797">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="101.06703"
       y="30.455797"
       id="text1000"
       label="text6"><tspan
         role="line"
         id="tspan1000"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="101.06703"
         y="30.455797">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="97.992035"
       y="30.455797"
       id="text1001"
       label="text7"><tspan
         role="line"
         id="tspan1001"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="97.992035"
         y="30.455797">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="94.817032"
       y="30.455797"
       id="text1002"
       label="text8"><tspan
         role="line"
         id="tspan1002"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="94.817032"
         y="30.455797">8</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="57.84359"
       id="text1024"
       label="text1"><tspan
         role="line"
         id="tspan1024"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="57.84359">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="57.843758"
       id="text1025"
       label="text2"><tspan
         role="line"
         id="tspan1025"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="57.843758">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="57.843761"
       id="text1026"
       label="text3"><tspan
         role="line"
         id="tspan1026"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="57.843761">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="57.843765"
       id="text1027"
       label="text4"><tspan
         role="line"
         id="tspan1027"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="57.843765">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="54.13942"
       id="text1028"
       label="text1"><tspan
         role="line"
         id="tspan1028"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="54.13942">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="54.139587"
       id="text1029"
       label="text2"><tspan
         role="line"
         id="tspan1029"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="54.139587">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="54.139591"
       id="text1030"
       label="text3"><tspan
         role="line"
         id="tspan1030"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="54.139591">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="54.139595"
       id="text1031"
       label="text4"><tspan
         role="line"
         id="tspan1031"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="54.139595">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="50.435249"
       id="text1032"
       label="text1"><tspan
         role="line"
         id="tspan1032"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="50.435249">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="50.435417"
       id="text1033"
       label="text2"><tspan
         role="line"
         id="tspan1033"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="50.435417">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="50.435421"
       id="text1034"
       label="text3"><tspan
         role="line"
         id="tspan1034"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="50.435421">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="50.435425"
       id="text1035"
       label="text4"><tspan
         role="line"
         id="tspan1035"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="50.435425">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="38.163963"
       id="text1036"
       label="text1"><tspan
         role="line"
         id="tspan1036"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="38.163963">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="38.164131"
       id="text1037"
       label="text2"><tspan
         role="line"
         id="tspan1037"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="38.164131">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="38.164135"
       id="text1038"
       label="text3"><tspan
         role="line"
         id="tspan1038"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="38.164135">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="38.164139"
       id="text1039"
       label="text4"><tspan
         role="line"
         id="tspan1039"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="38.164139">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="137.6787"
       y="34.459793"
       id="text1040"
       label="text1"><tspan
         role="line"
         id="tspan1040"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="137.6787"
         y="34.459793">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.33368"
       y="34.459961"
       id="text1041"
       label="text2"><tspan
         role="line"
         id="tspan1041"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.33368"
         y="34.459961">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.15863"
       y="34.459965"
       id="text1042"
       label="text3"><tspan
         role="line"
         id="tspan1042"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.15863"
         y="34.459965">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08368"
       y="34.459969"
       id="text1043"
       label="text4"><tspan
         role="line"
         id="tspan1043"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08368"
         y="34.459969">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="134.60365"
       y="30.755798"
       id="text1044"
       label="text1"><tspan
         role="line"
         id="tspan1044"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="134.60365"
         y="30.755798">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="131.25864"
       y="30.755798"
       id="text1045"
       label="text2"><tspan
         role="line"
         id="tspan1045"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="131.25864"
         y="30.755798">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="128.08359"
       y="30.756189"
       id="text1046"
       label="text3"><tspan
         role="line"
         id="tspan1046"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="128.08359"
         y="30.756189">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="57.84359"
       id="text1158"
       label="text1"><tspan
         role="line"
         id="tspan1158"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="57.84359">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="57.843758"
       id="text1159"
       label="text2"><tspan
         role="line"
         id="tspan1159"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="57.843758">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="57.843761"
       id="text1160"
       label="text3"><tspan
         role="line"
         id="tspan1160"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="57.843761">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="57.843765"
       id="text1161"
       label="text4"><tspan
         role="line"
         id="tspan1161"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="57.843765">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="54.13942"
       id="text1162"
       label="text1"><tspan
         role="line"
         id="tspan1162"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="54.13942">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="54.139587"
       id="text1163"
       label="text2"><tspan
         role="line"
         id="tspan1163"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="54.139587">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="54.139591"
       id="text1164"
       label="text3"><tspan
         role="line"
         id="tspan1164"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="54.139591">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="54.139595"
       id="text1165"
       label="text4"><tspan
         role="line"
         id="tspan1165"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="54.139595">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="50.435249"
       id="text1166"
       label="text1"><tspan
         role="line"
         id="tspan1166"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="50.435249">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="50.435417"
       id="text1167"
       label="text2"><tspan
         role="line"
         id="tspan1167"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="50.435417">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="50.435421"
       id="text1168"
       label="text3"><tspan
         role="line"
         id="tspan1168"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="50.435421">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="50.435425"
       id="text1169"
       label="text4"><tspan
         role="line"
         id="tspan1169"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="50.435425">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="38.163963"
       id="text1170"
       label="text1"><tspan
         role="line"
         id="tspan1170"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="38.163963">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="38.164131"
       id="text1171"
       label="text2"><tspan
         role="line"
         id="tspan1171"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="38.164131">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="38.164135"
       id="text1172"
       label="text3"><tspan
         role="line"
         id="tspan1172"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="38.164135">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="38.164139"
       id="text1173"
       label="text4"><tspan
         role="line"
         id="tspan1173"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="38.164139">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="34.459793"
       id="text1174"
       label="text1"><tspan
         role="line"
         id="tspan1174"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="34.459793">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="34.459961"
       id="text1175"
       label="text2"><tspan
         role="line"
         id="tspan1175"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="34.459961">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="34.459965"
       id="text1176"
       label="text3"><tspan
         role="line"
         id="tspan1176"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="34.459965">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="34.459969"
       id="text1177"
       label="text4"><tspan
         role="line"
         id="tspan1177"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="34.459969">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.895714"
       y="30.755798"
       id="text1178"
       label="text1"><tspan
         role="line"
         id="tspan1178"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.895714"
         y="30.755798">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.550674"
       y="30.755798"
       id="text1179"
       label="text2"><tspan
         role="line"
         id="tspan1179"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.550674"
         y="30.755798">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.375618"
       y="30.756189"
       id="text1180"
       label="text3"><tspan
         role="line"
         id="tspan1180"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.375618"
         y="30.756189">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="57.84359"
       id="text1181"
       label="text1"><tspan
         role="line"
         id="tspan1181"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="57.84359">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="57.843758"
       id="text1182"
       label="text2"><tspan
         role="line"
         id="tspan1182"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="57.843758">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="57.843761"
       id="text1183"
       label="text3"><tspan
         role="line"
         id="tspan1183"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="57.843761">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="57.843765"
       id="text1184"
       label="text4"><tspan
         role="line"
         id="tspan1184"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="57.843765">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="54.13942"
       id="text1185"
       label="text1"><tspan
         role="line"
         id="tspan1185"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="54.13942">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="54.139587"
       id="text1186"
       label="text2"><tspan
         role="line"
         id="tspan1186"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="54.139587">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="54.139591"
       id="text1187"
       label="text3"><tspan
         role="line"
         id="tspan1187"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="54.139591">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="54.139595"
       id="text1188"
       label="text4"><tspan
         role="line"
         id="tspan1188"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="54.139595">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="50.435249"
       id="text1189"
       label="text1"><tspan
         role="line"
         id="tspan1189"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="50.435249">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="50.435417"
       id="text1190"
       label="text2"><tspan
         role="line"
         id="tspan1190"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="50.435417">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="50.435421"
       id="text1191"
       label="text3"><tspan
         role="line"
         id="tspan1191"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="50.435421">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="50.435425"
       id="text1192"
       label="text4"><tspan
         role="line"
         id="tspan1192"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="50.435425">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="38.163963"
       id="text1193"
       label="text1"><tspan
         role="line"
         id="tspan1193"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="38.163963">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="38.164131"
       id="text1194"
       label="text2"><tspan
         role="line"
         id="tspan1194"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="38.164131">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="38.164135"
       id="text1195"
       label="text3"><tspan
         role="line"
         id="tspan1195"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="38.164135">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="38.164139"
       id="text1196"
       label="text4"><tspan
         role="line"
         id="tspan1196"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="38.164139">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.995476"
       y="34.459793"
       id="text1197"
       label="text1"><tspan
         role="line"
         id="tspan1197"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.995476"
         y="34.459793">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.650375"
       y="34.459961"
       id="text1198"
       label="text2"><tspan
         role="line"
         id="tspan1198"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.650375"
         y="34.459961">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.475349"
       y="34.459965"
       id="text1199"
       label="text3"><tspan
         role="line"
         id="tspan1199"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.475349"
         y="34.459965">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="79.400337"
       y="34.459969"
       id="text1200"
       label="text4"><tspan
         role="line"
         id="tspan1200"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="79.400337"
         y="34.459969">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="88.895714"
       y="30.755798"
       id="text1201"
       label="text1"><tspan
         role="line"
         id="tspan1201"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="88.895714"
         y="30.755798">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="85.550674"
       y="30.755798"
       id="text1202"
       label="text2"><tspan
         role="line"
         id="tspan1202"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="85.550674"
         y="30.755798">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="82.375618"
       y="30.756189"
       id="text1203"
       label="text3"><tspan
         role="line"
         id="tspan1203"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="82.375618"
         y="30.756189">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="161.79089"
       y="60.960796"
       id="text1209"
       label="text1"><tspan
         role="line"
         id="tspan1209"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="161.79089"
         y="60.960796">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.44591"
       y="60.660797"
       id="text1210"
       label="text2"><tspan
         role="line"
         id="tspan1210"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.44591"
         y="60.660797">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.27086"
       y="60.361187"
       id="text1211"
       label="text3"><tspan
         role="line"
         id="tspan1211"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.27086"
         y="60.361187">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.19592"
       y="60.060753"
       id="text1212"
       label="text4"><tspan
         role="line"
         id="tspan1212"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.19592"
         y="60.060753">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.02097"
       y="59.860752"
       id="text1213"
       label="text5"><tspan
         role="line"
         id="tspan1213"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.02097"
         y="59.860752">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.04596"
       y="59.660439"
       id="text1214"
       label="text6"><tspan
         role="line"
         id="tspan1214"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.04596"
         y="59.660439">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="161.79089"
       y="57.256626"
       id="text1221"
       label="text1"><tspan
         role="line"
         id="tspan1221"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="161.79089"
         y="57.256626">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.44591"
       y="56.956627"
       id="text1222"
       label="text2"><tspan
         role="line"
         id="tspan1222"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.44591"
         y="56.956627">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.27086"
       y="56.657017"
       id="text1223"
       label="text3"><tspan
         role="line"
         id="tspan1223"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.27086"
         y="56.657017">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.19592"
       y="56.356583"
       id="text1224"
       label="text4"><tspan
         role="line"
         id="tspan1224"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.19592"
         y="56.356583">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.02097"
       y="56.156582"
       id="text1225"
       label="text5"><tspan
         role="line"
         id="tspan1225"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.02097"
         y="56.156582">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.04596"
       y="55.956268"
       id="text1226"
       label="text6"><tspan
         role="line"
         id="tspan1226"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.04596"
         y="55.956268">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="142.97095"
       y="55.956268"
       id="text1227"
       label="text7"><tspan
         role="line"
         id="tspan1227"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="142.97095"
         y="55.956268">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.7159"
       y="53.252457"
       id="text1233"
       label="text1"><tspan
         role="line"
         id="tspan1233"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.7159"
         y="53.252457">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.37091"
       y="52.952847"
       id="text1234"
       label="text2"><tspan
         role="line"
         id="tspan1234"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.37091"
         y="52.952847">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.19586"
       y="52.652412"
       id="text1235"
       label="text3"><tspan
         role="line"
         id="tspan1235"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.19586"
         y="52.652412">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.12093"
       y="52.452412"
       id="text1236"
       label="text4"><tspan
         role="line"
         id="tspan1236"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.12093"
         y="52.452412">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="145.94597"
       y="52.252098"
       id="text1237"
       label="text5"><tspan
         role="line"
         id="tspan1237"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="145.94597"
         y="52.252098">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.71577"
       y="40.751968"
       id="text1245"
       label="text1"><tspan
         role="line"
         id="tspan1245"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.71577"
         y="40.751968">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.37079"
       y="40.452084"
       id="text1246"
       label="text2"><tspan
         role="line"
         id="tspan1246"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.37079"
         y="40.452084">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.19574"
       y="40.152084"
       id="text1247"
       label="text3"><tspan
         role="line"
         id="tspan1247"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.19574"
         y="40.152084">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.1208"
       y="39.952084"
       id="text1248"
       label="text4"><tspan
         role="line"
         id="tspan1248"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.1208"
         y="39.952084">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="145.94585"
       y="39.752087"
       id="text1249"
       label="text5"><tspan
         role="line"
         id="tspan1249"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="145.94585"
         y="39.752087">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="161.79089"
       y="37.347797"
       id="text1257"
       label="text1"><tspan
         role="line"
         id="tspan1257"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="161.79089"
         y="37.347797">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="158.44591"
       y="37.047798"
       id="text1258"
       label="text2"><tspan
         role="line"
         id="tspan1258"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="158.44591"
         y="37.047798">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.27086"
       y="36.747913"
       id="text1259"
       label="text3"><tspan
         role="line"
         id="tspan1259"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.27086"
         y="36.747913">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.19592"
       y="36.447914"
       id="text1260"
       label="text4"><tspan
         role="line"
         id="tspan1260"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.19592"
         y="36.447914">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.02097"
       y="36.247913"
       id="text1261"
       label="text5"><tspan
         role="line"
         id="tspan1261"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.02097"
         y="36.247913">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="146.04596"
       y="36.047916"
       id="text1262"
       label="text6"><tspan
         role="line"
         id="tspan1262"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="146.04596"
         y="36.047916">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="142.97095"
       y="35.847916"
       id="text1263"
       label="text7"><tspan
         role="line"
         id="tspan1263"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="142.97095"
         y="35.847916">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="155.5407"
       y="33.043797"
       id="text1269"
       label="text1"><tspan
         role="line"
         id="tspan1269"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="155.5407"
         y="33.043797">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="152.19571"
       y="32.743797"
       id="text1270"
       label="text2"><tspan
         role="line"
         id="tspan1270"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="152.19571"
         y="32.743797">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="149.02066"
       y="32.543797"
       id="text1271"
       label="text3"><tspan
         role="line"
         id="tspan1271"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="149.02066"
         y="32.543797">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="145.94572"
       y="32.3438"
       id="text1272"
       label="text4"><tspan
         role="line"
         id="tspan1272"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="145.94572"
         y="32.3438">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="74.45005"
       y="55.971798"
       id="text1449"
       label="text1"><tspan
         role="line"
         id="tspan1449"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="74.45005"
         y="55.971798">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.105072"
       y="56.171967"
       id="text1450"
       label="text2"><tspan
         role="line"
         id="tspan1450"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.105072"
         y="56.171967">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="67.929939"
       y="56.356358"
       id="text1451"
       label="text3"><tspan
         role="line"
         id="tspan1451"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="67.929939"
         y="56.356358">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.855003"
       y="56.540924"
       id="text1452"
       label="text4"><tspan
         role="line"
         id="tspan1452"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.855003"
         y="56.540924">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.680004"
       y="56.840923"
       id="text1453"
       label="text5"><tspan
         role="line"
         id="tspan1453"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.680004"
         y="56.840923">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="58.704899"
       y="57.156437"
       id="text1454"
       label="text6"><tspan
         role="line"
         id="tspan1454"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="58.704899"
         y="57.156437">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="55.62991"
       y="57.456188"
       id="text1455"
       label="text7"><tspan
         role="line"
         id="tspan1455"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="55.62991"
         y="57.456188">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="74.45005"
       y="59.675968"
       id="text1461"
       label="text1"><tspan
         role="line"
         id="tspan1461"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="74.45005"
         y="59.675968">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.105072"
       y="59.876137"
       id="text1462"
       label="text2"><tspan
         role="line"
         id="tspan1462"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.105072"
         y="59.876137">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="67.929939"
       y="60.060528"
       id="text1463"
       label="text3"><tspan
         role="line"
         id="tspan1463"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="67.929939"
         y="60.060528">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.855003"
       y="60.245094"
       id="text1464"
       label="text4"><tspan
         role="line"
         id="tspan1464"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.855003"
         y="60.245094">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.680004"
       y="60.545094"
       id="text1465"
       label="text5"><tspan
         role="line"
         id="tspan1465"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.680004"
         y="60.545094">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="58.704899"
       y="60.860607"
       id="text1466"
       label="text6"><tspan
         role="line"
         id="tspan1466"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="58.704899"
         y="60.860607">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="55.62991"
       y="61.160358"
       id="text1467"
       label="text7"><tspan
         role="line"
         id="tspan1467"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="55.62991"
         y="61.160358">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.175301"
       y="52.467796"
       id="text1473"
       label="text1"><tspan
         role="line"
         id="tspan1473"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.175301"
         y="52.467796">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="67.830322"
       y="52.667797"
       id="text1474"
       label="text2"><tspan
         role="line"
         id="tspan1474"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="67.830322"
         y="52.667797">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.65519"
       y="52.852188"
       id="text1475"
       label="text3"><tspan
         role="line"
         id="tspan1475"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.65519"
         y="52.852188">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.580254"
       y="53.136753"
       id="text1476"
       label="text4"><tspan
         role="line"
         id="tspan1476"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.580254"
         y="53.136753">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="58.405251"
       y="53.436752"
       id="text1477"
       label="text5"><tspan
         role="line"
         id="tspan1477"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="58.405251"
         y="53.436752">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="74.45005"
       y="35.863445"
       id="text1497"
       label="text1"><tspan
         role="line"
         id="tspan1497"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="74.45005"
         y="35.863445">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.105072"
       y="36.063614"
       id="text1498"
       label="text2"><tspan
         role="line"
         id="tspan1498"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.105072"
         y="36.063614">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="67.929939"
       y="36.248005"
       id="text1499"
       label="text3"><tspan
         role="line"
         id="tspan1499"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="67.929939"
         y="36.248005">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.855003"
       y="36.432571"
       id="text1500"
       label="text4"><tspan
         role="line"
         id="tspan1500"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.855003"
         y="36.432571">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.680004"
       y="36.732571"
       id="text1501"
       label="text5"><tspan
         role="line"
         id="tspan1501"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.680004"
         y="36.732571">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="58.704899"
       y="37.048084"
       id="text1502"
       label="text6"><tspan
         role="line"
         id="tspan1502"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="58.704899"
         y="37.048084">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="74.45005"
       y="39.567616"
       id="text1504"
       label="text1"><tspan
         role="line"
         id="tspan1504"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="74.45005"
         y="39.567616">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.105072"
       y="39.767784"
       id="text1505"
       label="text2"><tspan
         role="line"
         id="tspan1505"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.105072"
         y="39.767784">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="67.929939"
       y="39.952175"
       id="text1506"
       label="text3"><tspan
         role="line"
         id="tspan1506"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="67.929939"
         y="39.952175">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.855003"
       y="40.136742"
       id="text1507"
       label="text4"><tspan
         role="line"
         id="tspan1507"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.855003"
         y="40.136742">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.680004"
       y="40.436741"
       id="text1508"
       label="text5"><tspan
         role="line"
         id="tspan1508"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.680004"
         y="40.436741">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="71.175301"
       y="32.359444"
       id="text1511"
       label="text1"><tspan
         role="line"
         id="tspan1511"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="71.175301"
         y="32.359444">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="67.830322"
       y="32.559444"
       id="text1512"
       label="text2"><tspan
         role="line"
         id="tspan1512"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="67.830322"
         y="32.559444">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="64.65519"
       y="32.743835"
       id="text1513"
       label="text3"><tspan
         role="line"
         id="tspan1513"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="64.65519"
         y="32.743835">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="61.580254"
       y="33.0284"
       id="text1514"
       label="text4"><tspan
         role="line"
         id="tspan1514"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="61.580254"
         y="33.0284">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="186.66165"
       y="41.893799"
       id="text1521"
       label="text1"><tspan
         role="line"
         id="tspan1521"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="186.66165"
         y="41.893799">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="183.31667"
       y="41.193798"
       id="text1522"
       label="text2"><tspan
         role="line"
         id="tspan1522"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="183.31667"
         y="41.193798">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="180.14162"
       y="40.594189"
       id="text1523"
       label="text3"><tspan
         role="line"
         id="tspan1523"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="180.14162"
         y="40.594189">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="177.06642"
       y="39.993752"
       id="text1524"
       label="text4"><tspan
         role="line"
         id="tspan1524"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="177.06642"
         y="39.993752">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="173.89146"
       y="39.393753"
       id="text1525"
       label="text5"><tspan
         role="line"
         id="tspan1525"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="173.89146"
         y="39.393753">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="170.91646"
       y="38.894188"
       id="text1526"
       label="text6"><tspan
         role="line"
         id="tspan1526"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="170.91646"
         y="38.894188">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="167.84145"
       y="38.493752"
       id="text1527"
       label="text7"><tspan
         role="line"
         id="tspan1527"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="167.84145"
         y="38.493752">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="174.19064"
       y="43.097923"
       id="text1529"
       label="text1"><tspan
         role="line"
         id="tspan1529"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="174.19064"
         y="43.097923">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="170.84566"
       y="42.598358"
       id="text1530"
       label="text2"><tspan
         role="line"
         id="tspan1530"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="170.84566"
         y="42.598358">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="167.67061"
       y="42.197922"
       id="text1531"
       label="text3"><tspan
         role="line"
         id="tspan1531"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="167.67061"
         y="42.197922">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fonteight:"bold", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264582" }}
       x="177.13652"
       y="60.201801"
       id="text1535"
       label="text1"><tspan
         role="line"
         id="tspan1535"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264582" }}
         x="177.13652"
         y="60.201801">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264582" }}
       x="173.79153"
       y="59.601799"
       id="text1536"
       label="text2"><tspan
         role="line"
         id="tspan1536"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264582" }}
         x="173.79153"
         y="59.601799">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="170.61649"
       y="59.002186"
       id="text1537"
       label="text3"><tspan
         role="line"
         id="tspan1537"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="170.61649"
         y="59.002186">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="167.54155"
       y="58.602104"
       id="text1538"
       label="text4"><tspan
         role="line"
         id="tspan1538"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="167.54155"
         y="58.602104">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fonteight:"bold", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264582" }}
       x="180.31148"
       y="64.505783"
       id="text1543"
       label="text1"><tspan
         role="line"
         id="tspan1543"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264582" }}
         x="180.31148"
         y="64.505783">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264582" }}
       x="176.96651"
       y="63.905968"
       id="text1544"
       label="text2"><tspan
         role="line"
         id="tspan1544"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264582" }}
         x="176.96651"
         y="63.905968">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264582" }}
       x="173.79144"
       y="63.305965"
       id="text1545"
       label="text3"><tspan
         role="line"
         id="tspan1545"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23473px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264582" }}
         x="173.79144"
         y="63.305965">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="170.71651"
       y="62.706356"
       id="text1546"
       label="text4"><tspan
         role="line"
         id="tspan1546"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="170.71651"
         y="62.706356">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="167.54155"
       y="62.306274"
       id="text1547"
       label="text5"><tspan
         role="line"
         id="tspan1547"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="167.54155"
         y="62.306274">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="50.137115"
       y="38.493752"
       id="text1553"
       label="text1"><tspan
         role="line"
         id="tspan1553"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="50.137115"
         y="38.493752">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="46.792137"
       y="38.993797"
       id="text1554"
       label="text2"><tspan
         role="line"
         id="tspan1554"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="46.792137"
         y="38.993797">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="43.617004"
       y="39.494186"
       id="text1555"
       label="text3"><tspan
         role="line"
         id="tspan1555"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="43.617004"
         y="39.494186">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="40.542068"
       y="40.093754"
       id="text1556"
       label="text4"><tspan
         role="line"
         id="tspan1556"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="40.542068"
         y="40.093754">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="37.367065"
       y="40.693752"
       id="text1557"
       label="text5"><tspan
         role="line"
         id="tspan1557"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="37.367065"
         y="40.693752">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="34.292046"
       y="41.294189"
       id="text1558"
       label="text6"><tspan
         role="line"
         id="tspan1558"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="34.292046"
         y="41.294189">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="31.316971"
       y="41.86478"
       id="text1559"
       label="text7"><tspan
         role="line"
         id="tspan1559"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="31.316971"
         y="41.86478">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="50.137115"
       y="42.197922"
       id="text1561"
       label="text1"><tspan
         role="line"
         id="tspan1561"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="50.137115"
         y="42.197922">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="46.792137"
       y="42.697968"
       id="text1562"
       label="text2"><tspan
         role="line"
         id="tspan1562"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="46.792137"
         y="42.697968">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="43.617004"
       y="43.198357"
       id="text1563"
       label="text3"><tspan
         role="line"
         id="tspan1563"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="43.617004"
         y="43.198357">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="50.666283"
       y="58.801796"
       id="text1567"
       label="text1"><tspan
         role="line"
         id="tspan1567"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="50.666283"
         y="58.801796">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="47.321304"
       y="59.301796"
       id="text1568"
       label="text2"><tspan
         role="line"
         id="tspan1568"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="47.321304"
         y="59.301796">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="44.146172"
       y="59.902187"
       id="text1569"
       label="text3"><tspan
         role="line"
         id="tspan1569"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="44.146172"
         y="59.902187">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="41.071236"
       y="60.501755"
       id="text1570"
       label="text4"><tspan
         role="line"
         id="tspan1570"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="41.071236"
         y="60.501755">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="50.666283"
       y="62.505966"
       id="text1575"
       label="text1"><tspan
         role="line"
         id="tspan1575"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="50.666283"
         y="62.505966">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="47.321304"
       y="63.005966"
       id="text1576"
       label="text2"><tspan
         role="line"
         id="tspan1576"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="47.321304"
         y="63.005966">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="44.146172"
       y="63.606358"
       id="text1577"
       label="text3"><tspan
         role="line"
         id="tspan1577"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="44.146172"
         y="63.606358">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="41.071236"
       y="64.205917"
       id="text1578"
       label="text4"><tspan
         role="line"
         id="tspan1578"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="41.071236"
         y="64.205917">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="37.896233"
       y="64.905746"
       id="text1579"
       label="text5"><tspan
         role="line"
         id="tspan1579"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="37.896233"
         y="64.905746">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="183.48643"
       y="101.46463"
       id="text1582"
       label="text1"><tspan
         role="line"
         id="tspan1582"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="183.48643"
         y="101.46463">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="180.14145"
       y="99.877136"
       id="text1583"
       label="text2"><tspan
         role="line"
         id="tspan1583"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="180.14145"
         y="99.877136">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="176.9664"
       y="98.289658"
       id="text1584"
       label="text3"><tspan
         role="line"
         id="tspan1584"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="176.9664"
         y="98.289658">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="173.89146"
       y="96.702156"
       id="text1585"
       label="text4"><tspan
         role="line"
         id="tspan1585"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="173.89146"
         y="96.702156">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="181.62933"
       y="96.172974"
       id="text1587"
       label="text5"><tspan
         role="line"
         id="tspan1587"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="181.62933"
         y="96.172974">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="178.65433"
       y="94.585472"
       id="text1588"
       label="text6"><tspan
         role="line"
         id="tspan1588"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="178.65433"
         y="94.585472">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="175.57932"
       y="92.997971"
       id="text1589"
       label="text7"><tspan
         role="line"
         id="tspan1589"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="175.57932"
         y="92.997971">7</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal",fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="44.845444"
       y="97.231308"
       id="text1592"
       label="text1"><tspan
         role="line"
         id="tspan1592"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="44.845444"
         y="97.231308">1</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="41.500465"
       y="98.818825"
       id="text1593"
       label="text2"><tspan
         role="line"
         id="tspan1593"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="41.500465"
         y="98.818825">2</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="38.325333"
       y="100.4063"
       id="text1594"
       label="text3"><tspan
         role="line"
         id="tspan1594"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="38.325333"
         y="100.4063">3</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="35.250397"
       y="101.99378"
       id="text1595"
       label="text4"><tspan
         role="line"
         id="tspan1595"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="35.250397"
         y="101.99378">4</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="42.988003"
       y="93.527138"
       id="text1597"
       label="text5"><tspan
         role="line"
         id="tspan1597"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="42.988003"
         y="93.527138">5</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="40.012897"
       y="95.114639"
       id="text1598"
       label="text6"><tspan
         role="line"
         id="tspan1598"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="40.012897"
         y="95.114639">6</tspan></text><text
       space="preserve"
       style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"normal", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", display:"inline", fill:"#ffffff", fillOpacity:"1", strokeWidth:"0.264583" }}
       x="36.937908"
       y="96.702141"
       id="text1599"
       label="text7"><tspan
         role="line"
         id="tspan1599"
         style={{ fontStyle:"normal", fontVariant:"normal", fontWeight:"bold", fontStretch:"normal", fontSize:"1.23472px", fontFamily:"Arial", fill:"#ffffff", strokeWidth:"0.264583" }}
         x="36.937908"
         y="96.702141">7</tspan></text></g></svg>

        </div>
    );
});

export default HallDramteatr;
