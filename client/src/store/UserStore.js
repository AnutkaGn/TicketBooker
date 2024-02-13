import {makeAutoObservable} from 'mobx';

export class UserStore{
    constructor(){
        this._concerts = [];
        makeAutoObservable(this);
    }
    get concerts(){
        return this._concerts
    }
    set concerts(value){
        this._concerts = value
    }
};