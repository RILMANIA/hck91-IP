import axios from "axios";

export const cvApi = axios.create({
  baseURL: "http://localhost:3000",
});
