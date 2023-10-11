import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('Connected to the server')

@sio.event
def disconnect():
    print('Disconnected from the server')

sio.connect('http://192.168.0.53:3000')

sio.emit('message', 'Hello from pi!')

sio.disconnect()