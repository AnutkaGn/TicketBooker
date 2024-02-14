import { $host } from "./index"

export const getConcerts = async (type, dateTime, venue) => {
    const {data} = await $host.get('concert', {params: {type, dateTime, venue}});
    return data;
}

export const getAboutConcert = async (id) => {
    const {data} = $host.get(`concert/${id}`);
    return data;
} 