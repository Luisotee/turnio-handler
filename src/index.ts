import "dotenv/config";
import express from "express";
import fireRouter from "./routes/fire";

const app = express();
const port = process.env.PORT || 3000;

// Use JSON middleware to parse incoming requests.
app.use(express.json());

// Mount the /fire route.
app.use("/fire", fireRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
