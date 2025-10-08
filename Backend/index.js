//require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//const config = require("./config");
const { db } = require("./db.js");
const { verifyToken } = require("./middleware/auth.middleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const ppqr = require("promptpay-qr");
const qr = require("qrcode");
const stream = require("stream");
const generatePayload = require("promptpay-qr");
const { format } = require("date-fns");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const { router: authRouter } = require('./route/auth');
const roomsRouter = require('./route/rooms');
const queueRouter = require('./route/queue');
const tasksRouter = require('./route/tasks');
const billsRouter = require('./route/bills');
const mainRouter = require('./route/main');
const chatRouter = require('./route/chat');
const parcelRouter = require('./route/parcel');
const landingPageRouter = require('./route/landingpage');
const roomtypeRouter = require('./route/roomtype');

app.get('/', (req, res) => {
  res.status(200);
});

const app = express();
const port = 3000;

const cors = require("cors");

const allowedOrigins = ["*"];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`Request URL: ${req.originalUrl} via ${req.method} method`);
  next();
});

app.use('/auth', authRouter);
app.use('/rooms', roomsRouter);
app.use('/queue', queueRouter);
app.use('/tasks', tasksRouter);
app.use('/bills', billsRouter);
app.use('/main', mainRouter);
app.use('/chat', chatRouter);
app.use('/parcel', parcelRouter);
app.use('/landingpage', landingPageRouter);
app.use('/roomtype', roomtypeRouter);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dormitory Management System API',
      version: '1.0.0',
      description: 'API documentation for Dormitory Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'], // สามารถเพิ่มไฟล์อื่นๆได้
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log("Before app.listen");
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
console.log("After app.listen");
