import { type IncomingMessage } from "http";
import { Configuration } from "./configuration";

export type QueueItem =
    | {
          type: "update";
          key: string;
          value: string;
      }
    | {
          type: "create";
          key: string;
      }
    | {
          type: "delete";
          key: string;
      };

export type Item = { [key: string]: Item } | string | undefined | null;

export type DataValues = { [key: string]: string | null | undefined };

export type Process = { target: Promise<void> | null; queue: QueueItem[] };

export type Processes = { [fileKey: string]: Process };

export type SegmentItem = {
    name: string;
    isDir: boolean;
    path: string;
    key: string;
    staticPart: string;
};

export type File = { path: string; key: string; staticPart: string };
export type Files = File[];

export type IndentRule = {
    type: "space" | "tab";
    size: number;
};

export type ConfigurationOptions = {
    pattern: string | string[];
    indentSize: IndentRule["size"];
    indentType: IndentRule["type"];
    ignore?: string[];
    experimental?: unknown;
};

export type UpdateFileOpts = {
    filePath: string;
    indent: string;
};

export type InioRequest = IncomingMessage & { url: URL; config: Configuration };

export type CollectedData = { [pattern: string]: { [key: string]: DataValues } };

export type ResultData = {
    key: string;
    staticPart: string;
    values: DataValues;
}[];
