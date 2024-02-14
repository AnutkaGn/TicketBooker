import { $authHost, $host } from "./index";
import { jwtDecode } from 'jwt-decode';

export const signUp = async (login, email, password) => {
    const { data } = await $host.post('user/signUp', { login, email, password });
    if (data.hasOwnProperty('message')) {
        return data.message;
    }
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token)
}

export const logIn = async (login, password) => {
    const { data } = await $host.post('user/logIn', { login, password });
    if (data.hasOwnProperty('message')) {
        return data.message;
    }
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token)
}

export const addToTickets = async (id) => {
    const {data} = await $authHost.post('user/add', { id });
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token)
}

export const deleteFromTickets = async (id) => {
    const {data} = await $authHost.delete('user/', { id });
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token)
}