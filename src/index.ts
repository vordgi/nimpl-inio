#! /usr/bin/env node
import { createServer as createHttpServer } from "http";
import { getConfig } from "./lib/get-config";
import { isObjectKey } from "./lib/tools";
import { routes } from "./routes";
import { editorHandlers } from "./sockets/editor/handlers";
import { Server, Socket } from "socket.io";
import { HELP } from "./data/messages";

if (process.argv.includes("help")) {
    console.log(HELP);
    process.exit();
}

const CLIENT_ORIGIN = process.env.NODE_ENV === "development" ? "*" : "https://k-v.co";

const kvco = async () => {
    const config = await getConfig();

    const io = new Server();

    const server = createHttpServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGIN);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        res.setHeader("Access-Control-Allow-Private-Network", "true");

        if (!req.url || !req.method) return res.end();

        const url = new URL(req.url, "http://n");
        const pathname = url.pathname;
        const method = req.method.toUpperCase();

        if (process.env.DEBUG) {
            console.log(`${method} ${url.toString().replace("http://n", "")}`);
        }

        if (method === "OPTIONS") return res.end();

        if (!isObjectKey(pathname, routes)) {
            res.statusCode = 404;
            return res.end();
        }

        const route = routes[pathname];
        if (!isObjectKey(method, route)) {
            res.statusCode = 404;
            return res.end();
        }

        return route[method](Object.assign(req, { url, config }), res);
    });
    io.attach(server);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    io.engine.use((req: any, res: any, next: any) => {
        if (!res.headersSent) {
            res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGIN);
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
            res.setHeader("Access-Control-Allow-Private-Network", "true");
            if (req.method === "OPTIONS") {
                req.res.statusCode = 204;
                req.res.setHeader("Content-Length", "0");
                req.res.end();
            } else {
                next();
            }
        } else {
            next();
        }
    });
    const onConnection = (socket: Socket) => {
        editorHandlers(io, socket, config);
    };

    io.on("connection", onConnection);

    server.listen(8000, () => {
        console.log("kvco: Server runned, visit https://k-v.co/edit to continue");
    });
};

kvco();
