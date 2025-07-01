// io.js
const { io } = require('./server.js')

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