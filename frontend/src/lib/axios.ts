import axios from 'axios'

export const get = async <T, V = undefined>(path: string, token?: string, params?: V): Promise<T> => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
  try {
    return await axios.get<T>(`${process.env.REACT_APP_API_ENDPOINT}${path}`, { params, headers }).then((r) => r.data)
  } catch (e: unknown) {
    throw e
  }
}

export const post = async <T, V = undefined>(path: string, data?: V, token?: string, contentType?: string): Promise<T> => {
  const headers = {
    'Content-Type': contentType || 'application/json',
    Authorization: `Bearer ${token}`,
  }
  try {
    return await axios.post<T>(`${process.env.REACT_APP_API_ENDPOINT}${path}`, data, { headers }).then((r) => r.data)
  } catch (e: unknown) {
    throw e
  }
}

export const put = async <T, V = undefined>(path: string, data?: V, token?: string): Promise<T> => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
  try {
    return await axios.put<T>(`${process.env.REACT_APP_API_ENDPOINT}${path}`, data, { headers }).then((r) => r.data)
  } catch (e: unknown) {
    throw e
  }
}

export const deleteData = async <T>(path: string, token?: string): Promise<T> => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
  try {
    return await axios.delete<T>(`${process.env.REACT_APP_API_ENDPOINT}${path}`, { headers }).then((r) => r.data)
  } catch (e: unknown) {
    throw e
  }
}
