# JS WebSockets

This is a simple implementation of Express, WebSockets (Socket.io), and the HTML canvas. Static files are served via Express to each client to draw assets onto each client's canvas. Position and movement of sprites on the canvas are updated and stored server-side. The server constantly emits a function to re-draw the canvas with that data, at some fps. Client listens for WASD keyPresses  and emits to the server to update 'player' data.

All you got to do to run dis:

1. clone repo
2. navigate to repo in terminal
3. start server by running:
```{r, engine='bash', code_block_name}
$ node app.js
```

<p align="center">
  <img src="https://media.giphy.com/media/l49JUYtJCpwfnUP3G/giphy.gif"><br>
  fullscreen gif: https://giphy.com/gifs/l49JUYtJCpwfnUP3G/fullscreen
</p>
