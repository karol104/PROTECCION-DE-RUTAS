
import { apiClient } from '../plugins/pluginAxios.js'

// Re-exportar apiClient para uso directo
export { apiClient }


export const getData = async (url, config = {}) => {
  const response = await apiClient.get(url, config)
  return response.data
}

export const postData = async (url, data, config = {}) => {
  const response = await apiClient.post(url, data, config)
  return response.data
}

export const putData = async (url, data, config = {}) => {
  const response = await apiClient.put(url, data, config)
  return response.data
}

export const deleteData = async (url, config = {}) => {
  const response = await apiClient.delete(url, config)
  return response.data
}