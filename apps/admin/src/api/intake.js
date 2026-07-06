import request from './request'

export function listIntake(params = {}) {
  return request.get('/intake/admin/list', params)
}

export function getIntakeDetail(id) {
  return request.get(`/intake/admin/detail/${id}`)
}

export function updateIntake(id, data) {
  return request.patch(`/intake/admin/${id}`, data)
}

export function updateIntakeWorkflow(id, data) {
  return request.post(`/intake/admin/${id}/workflow`, data)
}

export function exportIntakePdf(id) {
  return request.get(`/intake/admin/pdf/${id}`)
}
