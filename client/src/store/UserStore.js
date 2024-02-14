import {makeAutoObservable} from 'mobx';

export class UserStore{
    constructor(){
        this._concerts = [];
        this._aboutConcert = {};
        this._isLogin = true;
        this._login = '';
        this._email = '';
        this._role = '';
        this._tickets = [];
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
        return this._email;
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
    get tickets(){
        return this._tickets
    }
    set tickets(value){
        this._tickets = value
    }
};