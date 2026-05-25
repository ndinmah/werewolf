import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupHandlers } from './socket/handlers.ts';

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Má»™t ngÆ°á»i dÃ¹ng káº¿t ná»‘i:', socket.id);
  
  setupHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server cháº¡y táº¡i cá»•ng ${PORT}`);
});
