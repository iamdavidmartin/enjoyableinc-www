/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "enjoyableinc-www",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          profile: "happygo-www",
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    new sst.aws.StaticSite("Site", {
      path: "dist",
      build: {
        command: "bun run build",
        output: "dist",
      },
    });
  },
});
