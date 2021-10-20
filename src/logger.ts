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
      // The Hackerone client is not properly re-throwing errors, causing all original error properties to
      // become stringified into `err.message`. For example in https://github.com/securitybites/hackerone-client/blob/master/src/index.js#L98:
      //   .catch(function(err) {
      //     throw new Error(err);
      //   });
      // --> should be -->
      //  .catch(function(err) {
      //    throw err;
      //  });
      //  ...or just be removed as it accomplishes nothing (otherwise we would have access to `err`'s `{ errors: [ { status: 404 }] }`)
    };
  } else {
    return err;
  }
}
