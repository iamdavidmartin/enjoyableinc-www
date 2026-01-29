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
          profile: process.env.CI ? undefined : "happygo-www",
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    new sst.aws.StaticSite("Site", {
      domain: {
        name: "enjoyableinc.com",
        dns: sst.aws.dns({
          zone: "Z01142512QWSC6RZC1RN4",
        }),
        cert: "arn:aws:acm:us-east-1:676323537126:certificate/447efc2a-a24b-4305-b652-c72da79275f6",
      },
      build: {
        command: "bun run build",
        output: "dist",
      },
    });
  },
});
