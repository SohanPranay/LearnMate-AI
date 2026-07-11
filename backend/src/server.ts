import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 LearnMate AI Backend Running on Port ${PORT}`);
});

server.on("error", (error) => {
  console.error("🔥 Server Error:", error);
});

server.on("close", () => {
  console.log("🛑 Server Closed!");
});
