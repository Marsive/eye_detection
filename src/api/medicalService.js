// src/api/medicalService.js
import axios from 'axios'

export const uploadEyeImage = (file, config) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post('/api/v1/upload', formData, config)
}

export const startAnalysisTask = (params) =>
  axios.post('/api/v1/analysis/tasks', params)

export const getAnalysisProgress = (taskId) =>
  axios.get(`/api/v1/analysis/tasks/${taskId}`)

export const getAnalysisResult = (taskId) =>
  axios.get(`/api/v1/analysis/results/${taskId}`)