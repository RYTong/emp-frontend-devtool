'use babel'

export const selectProject = (project) => ({
  type : 'SELECT-PROJECT',
  project
})

export const toggleApp = (project) => ({
  type : 'TOGGLE-APP',
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

export const online = (device) => ({
  type: 'ONLINE',
  device
})

export const offline = (device) => ({
  type: 'OFFLINE',
  device
})

export const acceptService = (service, device) => ({
  type: 'ACCEPT-SERVICE',
  service,
  device
})

export const rejectService = (service, device) => ({
  type: 'REJECT-SERVICE',
  service,
  device
})
