import Logger, { LogLevel } from "bunyan";

export default Logger.createLogger({
  name: process.env.INTEGRATION_NAME || "graph-hackerone",
  level: (process.env.LOG_LEVEL || "info") as LogLevel,
  serializers: {
    err: errorSerializer,
  },
});

function errorSerializer(err: any) {
  if (err && err.stack) {
    return {
      ...Logger.stdSerializers.err(err),
    };
  } else {
    return err;
  }
}
