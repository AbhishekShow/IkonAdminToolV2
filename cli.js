#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec, execSync } = require("child_process");
const net = require("net");

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function readDirectory(dir, base = dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if (file === "lib") continue;
    const node = {
      id: file === "src" ? Date.now().toString() : file.split("_")[1],
      name: file.split("_")[0],
      path: fullPath,
      type: stats.isDirectory() ? "folder" : "file",
      children: stats.isDirectory() ? readDirectory(fullPath, base) : [],
    };
    results.push(node);
  }
  return results;
}

function findFreePort(startPort = 3000, maxTries = 100) {
  return new Promise((resolve, reject) => {
    let port = startPort;

    const tryPort = () => {
      const server = net.createServer();
      server.unref();
      server.on("error", () => {
        port++;
        if (port - startPort >= maxTries) reject(new Error("No free ports found"));
        else tryPort();
      });
      server.listen(port, () => {
        server.close(() => resolve(port));
      });
    };

    tryPort();
  });
}

// Get the app directory
const appFolder = path.dirname(__filename);

// Command-line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === "dev") {
  console.log("🚀 Starting Next.js in development mode...");
  const devProcess = exec("npm run dev", { cwd: appFolder });
  devProcess.stdout.on("data", (data) => console.log(data));
  devProcess.stderr.on("data", (data) => console.error(data));

} else if (command === "update") {
  (async () => {
    try {
      console.log("📥 Pulling latest changes from master...");
      execSync("git checkout master && git pull origin master", {
        cwd: appFolder,
        stdio: "inherit",
      });

      console.log("🔧 Installing globally from local folder...");
      execSync("npm i -g .", { cwd: appFolder, stdio: "inherit" });

      console.log("🔨 Rebuilding Next.js app...");
      execSync("npm run build", { cwd: appFolder, stdio: "inherit" });

      console.log("✅ Update complete!");
    } catch (err) {
      console.error("❌ Update failed:", err.message);
      process.exit(1);
    }
  })();

} else {
  // Default: Save folder structure & run built app
  (async () => {
    try {
      const targetFolder = process.cwd();
      const structure = readDirectory(targetFolder);
      const outputPath = path.join(appFolder, "public/folderStructure.json");
      fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));
      console.log(`✅ Folder structure saved!`);

      const nextFolderPath = path.join(appFolder, ".next");
      if (!fs.existsSync(nextFolderPath)) {
        console.log("🔨 .next folder not found, building...");
        execSync("npm run build", { cwd: appFolder, stdio: "inherit" });
        console.log("✅ Build completed!");
      }

      const port = await findFreePort(3000);
      console.log(`🚀 Starting built app on http://localhost:${port}`);
      const serverProcess = exec(`npm run start -- -p ${port}`, { cwd: appFolder });

      serverProcess.stdout.on("data", (data) => console.log(data));
      serverProcess.stderr.on("data", (data) => console.error(data));

    } catch (err) {
      console.error("❌ Error during default run:", err.message);
      process.exit(1);
    }
  })();
}
