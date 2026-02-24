
import dotenv from "dotenv";
import app from "./app";
import { connectDB  } from "./data/data.config";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server rodando na porta ${PORT}`);
  });
}

startServer();
