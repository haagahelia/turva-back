// CORS configuration for the application

export const corsOptions = {
    origin: [
        "http://localhost:3000",
        "https://localhost:5432",
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    exposedHeaders: ['Authorization'],
};