export default {
  content: ["./src/**/*.{tsx,html}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "dark",
      "light",
      {
        mantine: {
          primary: "#e8590c",
          secondary: "#3b5bdb",
          accent: "#6741d9",
          neutral: "#343a40",
          "base-100": "#242424",
          info: "#1971c2",
          success: "#2f9e44",
          warning: "#f08c00",
          error: "#e03131",
        },
      },
    ],
  },
  safelist: [
    {
      pattern: /alert-(info|success|warning|error)/,
    },
  ],
};
