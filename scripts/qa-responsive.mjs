import { spawn } from "node:child_process";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PrismaClient } from "../src/generated/prisma/index.js";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const screenshotsDir = resolve(process.cwd(), "qa/screenshots/authenticated");
const chromeBin = process.env.CHROME_BIN ?? "/usr/bin/google-chrome";

const viewports = [
  { name: "360", width: 360, height: 900 },
  { name: "390", width: 390, height: 900 },
  { name: "430", width: 430, height: 932 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1366, height: 900 }
];

const accounts = {
  admin: {
    email: "super.admin.teste@delsonps.local",
    routes: ["/admin/dashboard", "/admin/students", "/admin/staff", "/admin/courses", "/admin/classes"]
  },
  teacher: {
    email: "prof.nelson.teste@delsonps.local",
    routes: ["/teacher/dashboard", "/debate"]
  },
  student: {
    email: "alipio.teste@delsonps.local",
    routes: ["/student/dashboard"]
  }
};

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function createToken(user, secret) {
  const payload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

async function connectToChrome(port) {
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((response) => response.json());
  const websocket = await createWebSocket(target.webSocketDebuggerUrl);

  let id = 0;
  const pending = new Map();
  websocket.onMessage((message) => {
    const data = JSON.parse(message);
    if (!data.id || !pending.has(data.id)) return;
    const { resolveMessage, rejectMessage } = pending.get(data.id);
    pending.delete(data.id);
    if (data.error) rejectMessage(new Error(data.error.message));
    else resolveMessage(data.result);
  });

  return {
    send(method, params = {}) {
      const messageId = ++id;
      websocket.send(JSON.stringify({ id: messageId, method, params }));
      return new Promise((resolveMessage, rejectMessage) => {
        pending.set(messageId, { resolveMessage, rejectMessage });
      });
    },
    close() {
      websocket.close();
    }
  };
}

async function createWebSocket(websocketUrl) {
  const url = new URL(websocketUrl);
  const key = randomBytes(16).toString("base64");
  const expectedAccept = createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
  const socket = connect(Number(url.port), url.hostname);
  const listeners = new Set();
  let buffer = Buffer.alloc(0);
  let handshaken = false;

  await new Promise((resolveOpen, rejectOpen) => {
    socket.once("connect", () => {
      socket.write([
        `GET ${url.pathname}${url.search} HTTP/1.1`,
        `Host: ${url.host}`,
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Key: ${key}`,
        "Sec-WebSocket-Version: 13",
        "",
        ""
      ].join("\r\n"));
    });

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      if (!handshaken) {
        const headerEnd = buffer.indexOf("\r\n\r\n");
        if (headerEnd === -1) return;
        const headers = buffer.slice(0, headerEnd).toString("utf8");
        if (!headers.includes(" 101 ") || !headers.toLowerCase().includes(`sec-websocket-accept: ${expectedAccept.toLowerCase()}`)) {
          rejectOpen(new Error("Chrome DevTools WebSocket handshake failed."));
          return;
        }
        handshaken = true;
        buffer = buffer.slice(headerEnd + 4);
        resolveOpen();
      }

      parseFrames();
    });

    socket.once("error", rejectOpen);
  });

  function parseFrames() {
    while (buffer.length >= 2) {
      const first = buffer[0];
      const opcode = first & 0x0f;
      let length = buffer[1] & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (buffer.length < offset + 2) return;
        length = buffer.readUInt16BE(offset);
        offset += 2;
      } else if (length === 127) {
        if (buffer.length < offset + 8) return;
        const high = buffer.readUInt32BE(offset);
        const low = buffer.readUInt32BE(offset + 4);
        length = high * 2 ** 32 + low;
        offset += 8;
      }

      if (buffer.length < offset + length) return;
      const payload = buffer.slice(offset, offset + length);
      buffer = buffer.slice(offset + length);

      if (opcode === 1) {
        const message = payload.toString("utf8");
        listeners.forEach((listener) => listener(message));
      } else if (opcode === 8) {
        socket.end();
      }
    }
  }

  return {
    send(message) {
      const payload = Buffer.from(message);
      const mask = randomBytes(4);
      let header;
      if (payload.length < 126) {
        header = Buffer.from([0x81, 0x80 | payload.length]);
      } else if (payload.length < 65536) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 0x80 | 126;
        header.writeUInt16BE(payload.length, 2);
      } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 0x80 | 127;
        header.writeUInt32BE(0, 2);
        header.writeUInt32BE(payload.length, 6);
      }
      const masked = Buffer.alloc(payload.length);
      for (let index = 0; index < payload.length; index += 1) {
        masked[index] = payload[index] ^ mask[index % 4];
      }
      socket.write(Buffer.concat([header, mask, masked]));
    },
    onMessage(listener) {
      listeners.add(listener);
    },
    close() {
      socket.end();
    }
  };
}

async function waitForChrome(port) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error("Chrome DevTools Protocol did not become available.");
}

async function removeWithRetry(path) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(path, { recursive: true, force: true });
      return;
    } catch (error) {
      if (error?.code !== "ENOTEMPTY" && error?.code !== "EBUSY") throw error;
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }
  }
  await rm(path, { recursive: true, force: true });
}

async function captureRoute(client, route, profile, viewport) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 768
  });

  await client.send("Page.navigate", { url: `${baseUrl}${route}` });
  await new Promise((resolveWait) => setTimeout(resolveWait, 1400));

  const metrics = await client.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const doc = document.documentElement;
      const body = document.body;
      const overflow = Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
      const offenders = Array.from(document.querySelectorAll("body *"))
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && (rect.right > window.innerWidth + 1 || rect.left < -1);
        })
        .slice(0, 5)
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          className: String(element.className || "").slice(0, 120),
          text: String(element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 80)
        }));
      return { path: location.pathname, title: document.title, width: window.innerWidth, scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth), overflow, offenders };
    })()`
  });

  const safeRoute = route.replaceAll("/", "_").replace(/^_/, "");
  const screenshot = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true });
  const outputPath = join(screenshotsDir, `${profile}-${safeRoute}-${viewport.name}.png`);
  await import("node:fs/promises").then(({ writeFile }) => writeFile(outputPath, Buffer.from(screenshot.data, "base64")));

  return {
    profile,
    route,
    viewport: viewport.name,
    screenshot: outputPath,
    ...metrics.result.value
  };
}

async function main() {
  await mkdir(screenshotsDir, { recursive: true });

  const envPath = resolve(process.cwd(), ".env");
  try {
    const env = await readFile(envPath, "utf8");
    for (const line of env.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) process.env[match[1]] ??= match[2].trim().replace(/^"|"$/g, "");
    }
  } catch {
    // DATABASE_URL can be provided by the shell.
  }

  const secret = process.env.AUTH_SECRET ?? "dev-only-delson-ps-change-me";
  const prisma = new PrismaClient();
  const users = {};
  for (const [profile, config] of Object.entries(accounts)) {
    const user = await prisma.user.findUnique({ where: { email: config.email } });
    if (!user) throw new Error(`Missing seed user: ${config.email}`);
    users[profile] = user;
  }
  await prisma.$disconnect();

  const port = Number(process.env.QA_CHROME_PORT ?? 9222);
  const userDataDir = await mkdtemp(join(tmpdir(), "delson-qa-chrome-"));
  const chrome = spawn(chromeBin, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank"
  ], { stdio: "ignore" });

  try {
    await waitForChrome(port);
    const client = await connectToChrome(port);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Network.enable");

    const results = [];
    for (const [profile, config] of Object.entries(accounts)) {
      await client.send("Network.clearBrowserCookies");
      await client.send("Network.setCookie", {
        name: "delson_ps_session",
        value: createToken(users[profile], secret),
        domain: "127.0.0.1",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
        expires: Math.floor(Date.now() / 1000) + 60 * 60
      });

      for (const route of config.routes) {
        for (const viewport of viewports) {
          results.push(await captureRoute(client, route, profile, viewport));
        }
      }
    }

    client.close();

    const overflowResults = results.filter((result) => result.overflow > 1);
    console.log(JSON.stringify({ checked: results.length, overflowResults }, null, 2));
    if (overflowResults.length > 0) process.exitCode = 1;
  } finally {
    if (!chrome.killed) {
      chrome.kill();
      await new Promise((resolveClose) => chrome.once("close", resolveClose));
    }
    await removeWithRetry(userDataDir);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
