import express from "express";
import fs from "fs/promises";
import { exec } from "child_process";
import { spawn } from "child_process";
import { randomUUID } from "crypto";

const TIME_LIMIT_MS = 3000;
const router = express.Router();

async function writeFileCode(content) {
  const executeId = randomUUID();

  try {
    await fs.writeFile(`runCode/programs/${executeId}.py`, content, {
      flag: "w+",
    });
  } catch (err) {
    console.log(err);
  }
  return executeId;
}

const runFile = async (fileName, input, res) => {
  let output = "";
  let error = "";

  const child = spawn("docker", [
    "run",
    "--rm",
    "--cpus",
    "0.5",
    "--memory",
    "128m",
    "-i",
    "-v",
    `${process.cwd()}/runCode/programs:/app`,
    "python-runner",
    "python",
    fileName,
  ]);

  const timer = setTimeout(() => {
    error = "Time Limit Exceeded";
    child.kill("SIGKILL");
  }, TIME_LIMIT_MS);

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    error += data.toString();
  });
  child.on("close", async (code) => {
    clearTimeout(timer);
    try {
      await fs.unlink(`runCode/programs/${fileName}`);
    } catch (err) {
      console.log("Error in deleting file");
    }

    if (error) {
      res.json({ error });
    } else {
      res.json({ output });
    }
  });
  if (input) {
    child.stdin.write(input);
  }
  child.stdin.end();
};

router.post("/run", async (req, res) => {
  const code = req.body.code;
  const language = req.body.language;
  const input = req.body.input;
  let nm = await writeFileCode(code);
  await runFile(`${nm}.py`, input, res);
});

export default router;
