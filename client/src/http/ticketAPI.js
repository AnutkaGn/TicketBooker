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
        const {data} = await $host.get(`ticket/${id}`);
        return data;
    }
    catch(error){
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