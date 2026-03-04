import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      autoConnect: false,
      transports: ['websocket'],
    })
  }
  return socket
}

export const connectSocket = (projectId) => {
  const s = getSocket()
  if (!s.connected) s.connect()
  if (projectId) s.emit('join-project', projectId)
  return s
}

export const disconnectSocket = (projectId) => {
  const s = getSocket()
  if (projectId) s.emit('leave-project', projectId)
}
