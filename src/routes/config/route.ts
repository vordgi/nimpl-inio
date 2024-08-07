import { type ServerResponse } from "http";
import { type InioRequest } from "../../lib/types";

export const GET = async (req: InioRequest, res: ServerResponse) => {
    return res.end(
        JSON.stringify({
            version: req.config.version,
            pattern: req.config.pattern,
            ignore: req.config.ignore,
            filters: req.config.filters,
            files: req.config.files,
            experimental: req.config.experimental,
        }),
    );
};

export const PUT = async (req: InioRequest, res: ServerResponse) => {
    const text = await new Promise<string>((resolve) => {
        let body = "";
        req.on("data", function (chunk) {
            body += chunk;
        });
        req.on("end", function () {
            resolve(body);
        });
    });
    const json = JSON.parse(text);
    if (json.pattern) {
        await req.config.updatePattern(json.pattern);
    }
    if (json.ignore) {
        await req.config.updateIgnore(json.ignore);
    }
    if (json.filters) {
        await req.config.updateFilters(json.filters);
    }

    return res.end(JSON.stringify(req.config));
};
