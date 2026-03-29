import express from "express";
import { exec } from "child_process";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run", (req, res) => {
  const code = req.body.code;

  fs.writeFileSync("code.py", code);

  exec("python3 code.py", (err, stdout, stderr) => {
    if (err) {
      return res.send(stderr || err.message);
    }
    res.send(stdout);
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});