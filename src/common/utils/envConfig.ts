import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  /* logger.level: info (30), warn (40), error (50),
 and fatal (60) log methods will be enabled but the trace (10)
 and debug (20) methods, being less than 30, will not. */
  LOGGER_LEVEL: str({
    devDefault: testOnly("trace"),
    choices: ["trace", "info", "ward", "error", "fatal"],
  }),
  TELEGRAF_TOKEN: str(),
});
