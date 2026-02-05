import express from "express";
import fs from "fs/promises";
// fs - built in file system - To read, write,and manage files in asynchronous way
// (Asynchronous programming allows tasks to run in the background without blocking the main thread,
// so the program can continue executing other operations.)
import { spawn } from "child_process";
// Runs another program (Python, ffmpeg, git, etc.) from Node.js and streams its output live.
// Starts a child process, Sends input to it, Receives output chunk by chunk (streaming), Doesn’t block your server
// spawn runs external programs as child processes with streaming I/O, ideal for long-running tasks and large outputs.
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

let containers = [];
var count = 1;
const startContainer = () => {
  const name = `py${count++}`;
  const c = spawn("docker", [
    "run",
    "-d",
    "--name",
    name,
    "--cpus", // limit CPU usage
    "0.5",
    "--memory", // limit RAM
    "128m",
    "--pids-limit=64", // prevent fork bomb
    "--network=none", // block internet
    "-v",
    `${process.cwd()}/runCode/programs:/app`,
    "python-runner", // Docker image with Python installed
  ]);
  c.on("close", () => {
    containers.push({ name, free: true });
  });
};

const endContainer = (name) => {
  spawn("docker", ["rm", "-f", name]);
  containers = containers.filter((c) => c.name != name);
  startContainer();
};

for (var i = 0; i < 3; i++) {
  startContainer();
  console.log("started container " + (i + 1));
}

// Run user code safely in a sandbox and return the output.
const runFile = async (containerName, fileName, input, res) => {
  let output = "";
  let error = "";

  const child = spawn("docker", [
    "exec",
    "-i",
    containerName,
    "python",
    `/app/${fileName}`, // run user’s code => python fileName.py
  ]);

  // Why Docker?
  // Prevents malicious code from harming your server
  // Isolates user execution (sandbox)

  const timer = setTimeout(() => {
    error = "Time Limit Exceeded";
    spawn("docker", ["kill", containerName]);
    endContainer(containerName);
  }, TIME_LIMIT_MS);

  // If code runs too long: Kill the process and Return "Time Limit Exceeded";

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    error += data.toString();
  });
  child.on("close", async (code) => {
    clearTimeout(timer);
    try {
      await fs.unlink(`runCode/programs/${fileName}`); // Deletes uploaded code file
    } catch (err) {
      console.log("Error in deleting file");
    }
    const cont = containers.find((c) => c.name === containerName);
    spawn("docker", ["kill", containerName]); // Kill the container
    endContainer(containerName);

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
  const contName = containers.find((c) => c.free === true);
  if (contName != null) {
    contName.free = false;
    await runFile(contName.name, `${nm}.py`, input, res);
  } else {
    res.json({ output: "server is busy wait for few seconds" });
  }
});

export default router;

// const runFile = async (fileName, input, res) => {
//   let output = "";
//   let error = "";

//   const child = spawn("docker", [
//     "run", // start container
//     "--rm", // auto delete container after run
//     "--cpus", // limit CPU usage
//     "0.5",
//     "--memory", // limit RAM
//     "128m",
//     "-i", // interactive input (stdin)
//     "-v",
//     `${process.cwd()}/runCode/programs:/app`, // mount code folder into container
//     "python-runner", // Docker image with Python installed
//     "python", // run user’s code => python fileName.py
//     fileName,
//   ]);

//   // Why Docker?
//   // Prevents malicious code from harming your server
//   // Isolates user execution (sandbox)

//   const timer = setTimeout(() => {
//     error = "Time Limit Exceeded";
//     child.kill("SIGKILL");
//   }, TIME_LIMIT_MS);

//   // If code runs too long: Kill the process and Return "Time Limit Exceeded";

//   child.stdout.on("data", (data) => {
//     output += data.toString();
//   });

//   child.stderr.on("data", (data) => {
//     error += data.toString();
//   });
//   child.on("close", async (code) => {
//     clearTimeout(timer);
//     try {
//       await fs.unlink(`runCode/programs/${fileName}`); // Deletes uploaded code file
//     } catch (err) {
//       console.log("Error in deleting file");
//     }

//     if (error) {
//       res.json({ error });
//     } else {
//       res.json({ output });
//     }
//   });
//   if (input) {
//     child.stdin.write(input);
//   }
//   child.stdin.end();
// };
