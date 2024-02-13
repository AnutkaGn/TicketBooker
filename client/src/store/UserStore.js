import {makeAutoObservable} from 'mobx';

export class UserStore{
    constructor(){
        this._concerts = [];
        this._aboutConcert = {};
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
};