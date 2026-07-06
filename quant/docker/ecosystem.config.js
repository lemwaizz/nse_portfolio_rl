module.exports = {
  apps: [
    {
      name: "backend core",
      script: "./apps/coordinator/server",
      interpreter: "none",
      out_file: "/dev/null",
      error_file: "/dev/null",
      env: {
        PORT: "3010",
        HOSTNAME: "0.0.0.0",
      },
    },
    {
      name: "frontend core",
      script: "./apps/frontend/server.js",
      out_file: "/dev/null",
      error_file: "/dev/null",
      interpreter: "bun",
      env: {
        PORT: "3020",
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};