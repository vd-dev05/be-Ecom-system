// Import các thư viện cần thiết
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import RootRouter from './routes/index.js';
import PayPalServices from './services/paypal.js';
dotenv.config();

// Utiles
import connectDB from './config/mongodb.js';
// import { Server } from "socket.io"; 
// import http from "http";

connectDB();  // Kết nối với database
// Tạo ứng dụng Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Expires",
        "Pragma",
    ],
    credentials: true,
}));
app.use(cookieParser());

// Route mặc định
app.get("/", async (req, res) => {
    res.send('API Working');
 
    
});

// Sử dụng các router của bạn
app.use(RootRouter);

// Bắt đầu server HTTP và kết nối database
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);

});

