const socket = io('ws://192.168.0.53:3000');

const form = document.getElementById("form");
const input = document.getElementById("input");

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit('message', input.value);
      input.value = '';
    }
});