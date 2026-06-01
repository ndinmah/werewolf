import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupHandlers } from './socket/handlers.ts';

const app = express();
const corsOrigin = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({ origin: corsOrigin }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Một người dùng kết nối:', socket.id);
  
  setupHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server chạy tại cổng ${PORT}`);
});
