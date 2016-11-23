'use babel'

export const selectProject = (project) => ({
  type : 'SELECT-PROJECT',
  project
})

export const toggleEbank = (project) => ({
  type : 'TOGGLE-EBANK',
  project
})

export const openPort = (service, port) => ({
  type: 'OPEN-PORT',
  service,
  port
})

export const closePort = (service) => ({
  type: 'CLOSE-PORT',
  service
})
