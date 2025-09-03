import createApp from "./app";

const port = 3000;

const startServer = async () => {
    const app = createApp();

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});