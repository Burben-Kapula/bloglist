import axios from 'axios'

// БУДЬ ЛАСКА, ТІЛЬКИ ЦЕЙ URL:
const baseUrl = 'http://localhost:3003/api/login'

const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login }
