import restart from "vite-plugin-restart";

export default {
  root: "src/",
  publicDir: "../static/",
  server: {
    host: true, // Default development server port
    open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env),
  },
  build: {
    outDir: "../dist", // Default output directory
    emptyOutDir: true, // Clear the output directory before building
    sourcemap: true,
  },
  plugins: [restart({ restart: ["../static/**"] })],
};
