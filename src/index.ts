import "dotenv/config";
import express from "express";
import fireRouter from "./routes/fire";
import alertRouter from "./routes/alert";
import notificationRouter from "./routes/notification";
import racRouter from "./routes/rac";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/fire", fireRouter);
app.use("/alert", alertRouter);
app.use("/notifications", notificationRouter);
app.use("/rac", racRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
