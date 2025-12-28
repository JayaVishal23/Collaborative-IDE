import express from "express";
import fs from "fs/promises";
import { exec } from "child_process";
import { spawn } from "child_process";
import { randomUUID } from "crypto";

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

const runFile = async (fileName, res) => {
  let output = "";
  let error = "";

  const child = spawn("docker", [
    "run",
    "--rm",
    "--cpus",
    "0.5",
    "--memory",
    "128m",
    "-v",
    `${process.cwd()}/runCode/programs:/app`,
    "python-runner",
    "python",
    fileName,
  ]);

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    error += data.toString();
  });
  child.on("close", async (code) => {
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
};

router.post("/run", async (req, res) => {
  const code = req.body.code;
  const language = req.body.language;
  let nm = await writeFileCode(code);
  await runFile(`${nm}.py`, res);
});

export default router;
