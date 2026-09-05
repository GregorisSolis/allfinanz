import axios from 'axios'

//export const API = axios.create({ baseURL: 'https://allfinanz-production.up.railway.app/' })

//export const API = axios.create({ baseURL: 'https://allfinanz.onrender.com/' })

export const API = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/',
	withCredentials: true,
});
