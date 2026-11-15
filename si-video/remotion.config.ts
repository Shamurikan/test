import { Config } from "@remotion/cli/config";

Config.setEntryPoint("remotion/src/index.ts");
Config.setPublicDir("remotion/public");
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer("swangle");
