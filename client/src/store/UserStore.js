import {makeAutoObservable} from 'mobx';

export class UserStore{
    constructor(){
        this._concerts = [];
        this._aboutConcert = {};
        this._isLogin = true;
        this._login = '';
        this._email = '';
        this._role = '';
        this._ticketsToBook = [];
        this._userTickets = [];
        makeAutoObservable(this);
    }
    get concerts(){
        return this._concerts
    }
    set concerts(value){
        this._concerts = value
    }
    get aboutConcert(){
        return this._aboutConcert
    }
    set aboutConcert(value){
        this._aboutConcert = value
    }
    get isLogin(){
        return this._isLogin
    }
    set isLogin(value){
        this._isLogin = value
    }
    get login(){
        return this._login
    }
    set login(value){
        this._login = value
    }
    get email(){
        return this._email
    }
    set email(value){
        this._email = value
    }
    get role(){
        return this._role
    }
    set role(value){
        this._role = value
    }
    get userTickets(){
        return this._userTickets
    }
    set userTickets(value){
        this._userTickets = value
    }
    get ticketsToBook(){
        return this._ticketsToBook
    }
    set ticketsToBook(value){
        this._ticketsToBook = value
    }
    includesTicketToBook(ticket){
        return JSON.parse(JSON.stringify(this._ticketsToBook)).some(ticketToBook => ticket.row === ticketToBook.row && ticket.seat === ticketToBook.seat && ticket.floor === ticketToBook.floor)
    }
    getTicketPrice(ticket){
        return JSON.parse(JSON.stringify(this._ticketsToBook)).filter(ticketToBook => ticket.row === ticketToBook.row && ticket.seat === ticketToBook.seat && ticket.floor === ticketToBook.floor)[0].price
    }
    deleteTicket(ticket){
        this._ticketsToBook = JSON.parse(JSON.stringify(this._ticketsToBook)).filter(ticketToBook => JSON.stringify(ticketToBook) !== JSON.stringify(ticket))
    }
    includesTicketId(id){
        return JSON.parse(JSON.stringify(this._userTickets)).some(userTicket => id === userTicket)
    }
};