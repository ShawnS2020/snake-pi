import { io } from "socket.io-client"
const pixels = Array(64).fill([0, 0, 0]);
pixels[0] = [255, 0, 0];

const socket = io.connect('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
})

socket.emit('joinGame', 'test client')

socket.emit('pixels', pixels)