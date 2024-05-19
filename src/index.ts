import express from "express";
import type { Express, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { CORS_ORIGIN_URL } from "./constants/URL";

const app: Express = express();
const PORT = 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [`${CORS_ORIGIN_URL}`],
  },
});

app.use(express.json());
app.use(cors());
const prisma = new PrismaClient();

app.get("/allTodos", async (req: Request, res: Response) => {
  try {
    const allTodos = await prisma.todo.findMany();
    return res.status(200).json(allTodos);
  } catch (err) {
    return res.status(400).json(err);
  }
});

app.post("/createTodo", async (req: Request, res: Response) => {
  try {
    const { title, isCompleted } = req.body;
    const createTodo = await prisma.todo.create({
      data: {
        title,
        isCompleted,
      },
    });
    return res.status(200).json(createTodo);
  } catch (err) {
    return res.status(400).json(err);
  }
});

app.put("/editTodo/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, isCompleted } = req.body;
    const editTodo = await prisma.todo.update({
      where: {
        id,
      },
      data: {
        title,
        isCompleted,
      },
    });
    return res.status(200).json(editTodo);
  } catch (err) {
    return res.status(400).json(err);
  }
});

app.delete("/deleteTodo/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleteTodo = await prisma.todo.delete({
      where: {
        id,
      },
    });
    return res.status(200).json(deleteTodo);
  } catch (err) {
    return res.status(400).json(err);
  }
});

io.on("connection", (socket) => {
  console.log("クライアントと接続できました。");

  socket.on("send_todo", (todos) => {
    io.emit("send_todo", todos);
  });

  socket.on("disconnect", () => {
    console.log("クライアントとの接続が切れました。");
  });
});

server.listen(PORT, () => {
  console.log("server is running🚀");
});
