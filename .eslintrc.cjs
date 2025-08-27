module.exports = {
  // ...твоя базова конфігурація (extends, rules, plugins)
  overrides: [
    // ESM-файли бекенду
    {
      files: ["server/**/*.{js,mjs}"],
      env: { node: true, es2022: true },
      parserOptions: { sourceType: "module" },
      globals: { process: "readonly" } // підстраховка
    },
    // CommonJS-файли бекенду (.cjs, наприклад sequelize/config.cjs)
    {
      files: ["server/**/*.cjs"],
      env: { node: true, es2022: true },
      parserOptions: { sourceType: "script" },
      globals: {
        process: "readonly",
        __dirname: "readonly",
        require: "readonly",
        module: "readonly"
      }
    },
    // (опційно) фронтенд
    {
      files: ["client/**/*.{js,jsx,ts,tsx}"],
      env: { browser: true, es2022: true }
    }
  ]
};
