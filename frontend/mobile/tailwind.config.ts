import type { Config } from "tailwindcss";
import preset from "@fieldos/shared/tailwind.preset";

const config: Config = {
  presets: [preset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
