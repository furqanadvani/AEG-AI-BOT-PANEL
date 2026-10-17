import axios from "axios";

export const get = (url, params) => axios.get(url, { params });

export const post = (url, data, config) => axios.post(url, data, config);

export const put = (url, data) => axios.put(url, data);

export const patch = (url, data) => axios.patch(url, data);

export const del = (url, data) => axios.delete(url, { data });
