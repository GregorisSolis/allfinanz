export const TOKEN_KEY = "@allfinanz-Token"

export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null

export const getToken = () => localStorage.getItem(TOKEN_KEY)

//OBTENER EL TOKEN PARA HACER LOGIN
export const login = token => {
	localStorage.setItem(TOKEN_KEY, token)
}

//REMOVER EL TOKEN PARA EL LOGOUT
export const logout = () => {
	localStorage.removeItem(TOKEN_KEY)
	localStorage.removeItem('iden')
}