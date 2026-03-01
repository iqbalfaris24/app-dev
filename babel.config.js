module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Jangan taruh nativewind di sini untuk v4
      "react-native-reanimated/plugin", 
    ],
  };
};