/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2017 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file webpack.config.mjs
 * @command node webpack.config.mjs -p ["name"]
 */

import * as path from "node:path";
import webpack from "webpack";
import * as progress from "./scripts/lib/wp-progress.mjs";
// import getArgs from "tin-args";
import { fileURLToPath } from "node:url";

// Get the file URL of the current module
const __filename = fileURLToPath(import.meta.url);
// Derive the directory name
const __dirname = path.dirname(__filename);


/**
 * @typedef {(originId: string, module: webpack.Module) => string | number} TModuleIdMaker
 */
/**
 * __reduce webpack size by shorten modId__
 * 
 * @param {TModuleIdMaker} maker 
 * @returns 
 */
const mapModuleIds = maker => (/** @type {webpack.Compiler} */compiler) => {
  const context = /** @type {string} */(compiler.options.context);
  compiler.hooks.compilation.tap("ChangeModuleIdsPlugin", compilation => {
    compilation.hooks.beforeModuleIds.tap("ChangeModuleIdsPlugin", modules => {
      const chunkGraph = compilation.chunkGraph;
      for (const module of modules) {
        if (module.libIdent) {
          const origId = module.libIdent({ context });
          if (!origId) continue;
          chunkGraph.setModuleId(module, maker(origId, module));
        }
      }
    });
  });
};
/** @type {TModuleIdMaker} */
const numberMaker = ((cache) => {
  let idx = 0;
  return (oid, mod) => {
    let nid = cache.get(oid);
    if (typeof nid !== "number") {
      cache.set(oid, (nid = idx++));
    }
    return nid;
  };
})(/** @type {Map<string, number>} */(new Map()));

/** @type {import("typescript").CompilerOptions} */
const tsCompilerOptions = {
  removeComments: true
};

/**
 * @typedef {webpack.Configuration} WebpackConfigration
 * @typedef {Required<WebpackConfigration>} FixWebpackConfigration
 * @typedef {{
 *   beautify?: true;
 *   forceSourceMap?: true;
* }} TExtraOptions
 */
/**
 * @param {FixWebpackConfigration["target"]} target 
 * @param {FixWebpackConfigration["output"]} output
 * @param {FixWebpackConfigration["mode"]} [mode] 
 * @param {TExtraOptions} [extraOpt] see {@link TExtraOptions}
 * @return {WebpackConfigration}
 * @version 2.0
 * @date 2022/3/20 - update jsdoc, added new parameter `extraOpt`
 */
const createWebpackConfig = (target, output, mode = "production", extraOpt = {}) => {

  const {
    forceSourceMap,
  } = extraOpt;

  /**
   * @type {WebpackConfigration["module"]}
   */
  const module = {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: `${__dirname}/tsconfig.json`,
          compilerOptions: tsCompilerOptions,
          // DEVNOTE: cannot use `transpileOnly` option because some problem of typescript enum
          // transpileOnly: true
        }
      }
    ]
  };
  /**
   * @type {WebpackConfigration["entry"]}
   */
  const entry = {
    index: "./src/index.ts"
  };
  /**
   * @type {WebpackConfigration["externals"]}
   */
  const externals = [
    "../",
    "stream",
    "readline",
    "perf_hooks",
  ];
  if (target === "node") {
    entry["gulp/index"] = "./src/gulp/index.ts";
  }
  const mainName = `${target}@${/** @type {webpack.LibraryOptions} */(output.library).type}`;

  return {
    name: `${mainName}-${mode}`,
    // "none" | "development" | "production"
    mode,
    // "web", "node"
    target,
    // entry point
    entry,
    // output config.
    output,
    module,
    externals,
    resolve: {
      extensions: [".ts", ".js"]
    },
    devtool: (forceSourceMap || mode === "development") ? "source-map" : false, // "source-map" -> need this for complete sourcemap.

    plugins: [
      new webpack.ProgressPlugin(
        progress.getWebpackProgressPluginHandler(mainName)
      )
    ],
    optimization: {
      // minimizer: [
      //     new TerserPlugin(terserOpt),
      // ]
    },
    profile: !!0,
    // cache: true,
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    },
    recordsPath: `${__dirname}/logs/webpack-module-ids_${mainName}.json`
  };
};


/**
 * @typedef {Parameters<typeof createWebpackConfig>} TConfigParameters
 * @typedef {[TConfigParameters[0], TConfigParameters[1]]} TPrimaryParameters
 */
/**
 * @type {(TPrimaryParameters)[]}
 */
const configParameters = [
  [
    "web", /* target, can be omitted as default is 'web' */
    {      /* output */
      path: "dist/umd/",
      library: {
        name: "Rmc",
        type: "umd"
      },
      globalObject: "globalThis"
    }
  ], [
    "node", /* target */
    {       /* output */
      path: "dist/webpack/",
      library: {
        type: "commonjs2"
      },
    }
  ]
];

const debug = false;
/** @type {WebpackConfigration["mode"]} */
const mode = debug && "development" || void 0;
/** @type {TExtraOptions} */
const extraOpt = {
  beautify: debug || void 0,
  // forceSourceMap: true
};

const wpConfigs = configParameters.map(config => {
  const [
    target, output = {},
    // altEntry, tsconfig
  ] = config;
  // const isCJS = /** @type {webpack.LibraryOptions} */(output.library).type === "commonjs2";
  if (!output.filename) {
    output.filename = "[name].js";
  }
  output.path = `${__dirname}/${output.path}`;
  return createWebpackConfig(target, output, mode, extraOpt);
});

// export WP_REFINE_MODID=1
if (process.env.WP_REFINE_MODID) {
  wpConfigs.forEach(
    config => /** @type {NonNullable<typeof config.plugins>} */(config.plugins).push(
      mapModuleIds(numberMaker)
    )
  );
}

export default wpConfigs;
