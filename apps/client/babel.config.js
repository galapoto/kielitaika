const path = require("path");

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@core": path.resolve(__dirname, "../../packages/core"),
            "@ui": path.resolve(__dirname, "../../packages/ui"),
          },
        },
      ],
    ],
  };
};
