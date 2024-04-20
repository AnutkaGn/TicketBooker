import { $host } from "./index"

export const getConcerts = async (type, dateTime, venue, page=1, limit=5) => {
    const {data} = await $host.get('concert', {params: {type, dateTime, venue, page, limit}});
    return data;
}

export const getAboutConcert = async (id) => {
    const {data} = await $host.get(`concert/${id}`);
    return data;
} 