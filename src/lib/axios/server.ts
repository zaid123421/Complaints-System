import axios from "axios";

const server = axios.create({
  baseURL: process.env.API_URL,
});

server.interceptors.request.use((config) => {
  return config;
});

export default server;
