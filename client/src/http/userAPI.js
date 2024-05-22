import { $authHost, $host } from "./index.js";
import { jwtDecode } from 'jwt-decode';

export const signUp = async (login, email, password) => {
    try{
        const { data } = await $host.post('user/signUp', { login, email, password });
        localStorage.setItem('token', data.token);
        return jwtDecode(data.token)
    }
    catch(error){
        return error.response.data;
    }
}

export const logIn = async (login, password) => {
    try{
        const { data } = await $host.post('user/logIn', { login, password });
        localStorage.setItem('token', data.token);
        return jwtDecode(data.token)
    }
    catch(error){
        return error.response.data;
    }
}

export const check = async () => {
    try {
        const { data } = await $authHost.get('user/');
        localStorage.setItem('token', data.token);
        return jwtDecode(data.token)
    } catch(error) {
        return error.response.data;
    }
}

export const addToTickets = async (id) => {
    const {data} = await $authHost.post('user/add', { id });
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token)
}

export const deleteFromTickets = async (id) => {
    const {data} = await $authHost.delete('user/', { id });
    console.log(jwtDecode(data.token))
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token)
}