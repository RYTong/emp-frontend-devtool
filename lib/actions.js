'use babel'

export const selectProject = (project) => ({
  type : 'SELECT-PROJECT',
  project
})

export const toggleEbank = (project) => ({
  type : 'TOGGLE-EBANK',
  project
})

export const startService = (service, port) => ({
  type: 'START-SERVICE',
  service,
  port
})

export const stopService = (service) => ({
  type: 'STOP-SERVICE',
  service
})

export const online = (client) => ({
  type: 'ONLINE',
  client
})

export const acceptService = (service, client) => ({
  type: 'ACCEPT-SERVICE',
  service,
  client
})

export const rejectService = (service, client) => ({
  type: 'REJECT-SERVICE',
  service,
  client
})
