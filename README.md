# JS WebSockets

This is a simple implementation of Express, WebSockets (Socket.io), and the HTML canvas. 

Express serves necessary static files to each client to draw assets onto each client's canvas. Positions and movement functions of sprites on the canvas are updated and stored server-side. The server constantly emits a function to re-draw the canvas with that data, at some fps. Client listens for WASD keyPresses  and emits to the server to update 'player' data.

This implementation takes into account some basic game dev architecture in that basic cheating prevention is handled by making all player interactions server-sided, because cheating is bad.

To run this demo:

1. clone and navigate to repo in terminal
2. start server by running:
```{r, engine='bash', code_block_name}
$ node app.js
```
3. access app through browser with address http://localhost:3000/

<p align="center">
  <img src="https://media.giphy.com/media/l49JUYtJCpwfnUP3G/giphy.gif"><br>
  fullscreen gif: https://giphy.com/gifs/l49JUYtJCpwfnUP3G/fullscreen
</p>
