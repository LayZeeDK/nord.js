// DO NOT EDIT. This file is generated by Nord.js.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `nord build`.
import { NordManifest } from "@nordjs/types";

/** Autogenerated Nord.js manifest file */
export const nordManifest = async (): Promise<NordManifest> =>
  ({
    schemaVersion: "0.0.0",
    routes: {
      "GET /": (await import("./routes/")).get,
      "GET /users": (await import("./routes/users")).get,
    },
  } as const);
