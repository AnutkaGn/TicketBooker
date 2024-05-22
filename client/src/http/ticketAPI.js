import { $authHost, $host } from "./index";

export const createTicket = async(ticket) =>{
    try{
        const {data} = await $authHost.post('ticket', {...ticket});
        return data;
    }
    catch(error){
        return error.response.data;
    }
}
export const getTickets = async(id) =>{
    try{
        const {data} = await $host.get(`ticket/concertId/${id}`);
        return data;
    }
    catch(error){
        return error.response.data;
    }
}

export const getUserTickets = async() => {
    try {
        const {data} = await $authHost.get('ticket');
        return data;
    } catch (error) {
        return error.response.data;
    }
}

export const getTicketId = async(value) => {
    try {
        const {data} = await $authHost.get(`ticket/getId?concertId=${value.concertId}&seat=${value.seat}&row=${value.row}&floor=${value.floor}`);
        return data.id;
    } catch (error) {
        return error.response.data;
    }
}

export const getTicketPrice = async (id) => {
    try {
        const {data} = await $authHost.get(`ticket/getPrice?id=${id}`);
        return data.price;
    } catch (error) {
        return error.response.data;
    }
}

export const deleteTicket = async(id) =>{
    try {
        const {data} = await $authHost.delete(`ticket/${id}`)
        return data;
    } catch (error) {
        return error.response.data;
    }
}

export const bookManyTickets = async(idArray) =>{
    try {
        const {data} = await $authHost.put(`ticket?idArray=${idArray}`)
        return data;
    } catch (error) {
        return error.response.data;
    }
}