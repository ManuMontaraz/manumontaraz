// io.js

const path = require('path')
const socketIO = require('socket.io')
const { server } = require(path.join(__dirname,'..','..','server','js','server.js'))

const io = socketIO(server)

io.on('connection', (socket) => {
  console.log('Cliente conectado')

  socket.on('mensaje', (message) => {
    console.log('Mensaje recibido:', message)
    socket.broadcast.emit('mensaje', message)
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado')
  })
})