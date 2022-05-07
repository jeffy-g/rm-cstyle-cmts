// @ts-check
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const progress = require("./scripts/tiny/progress/");


/** @type {import("terser").MinifyOptions} */
const terserOptions = {
    sourceMap: true,
    mangle: true,
    format: {
        comments: false,
        beautify: true,
        indent_level: 1,
        // ecma: 9,
        max_line_len: 800,
        quote_style: 3
    }
};
/** @type {ConstructorParameters<typeof TerserPlugin>[0]} */
const terserOpt = {
    // Enable parallelization. Default number of concurrent runs: os.cpus().length - 1.
    parallel: true,
    terserOptions,
};
/** @type {import("typescript").CompilerOptions} */
const tsCompilerOptions = {
    removeComments: true
};

/**
 * @typedef {import("webpack").Configuration} WebpackConfigration
 * @typedef {{ beautify?: true; forceSourceMap?: true }} TExtraOptions
 */
/**
 * @param {WebpackConfigration["target"]} target 
 * @param {WebpackConfigration["output"]} output
 * @param {WebpackConfigration["mode"]} [mode] 
 * @param {TExtraOptions} [extraOpt] see {@link TExtraOptions}
 * @return {WebpackConfigration}
 * @version 2.0
 * @date 2022/3/20 - update jsdoc, added new parameter `extraOpt`
 */
const createWebpackConfig = (target, output, mode = "production", extraOpt = {}) =>  {

    const {
        beautify,
        forceSourceMap,
    } = extraOpt;

    const isNode = target === "node";
    terserOptions.format.beautify = beautify;
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
    if (isNode) {
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
        devtool: (forceSourceMap || mode === "development")? "source-map": false, // "source-map" -> need this for complete sourcemap.

        plugins: [
            new webpack.ProgressPlugin(
                progress.createWebpackProgressPluginHandler(/*`./logs/${utils.dateStringForFile()}-webpack.log`*/)
            )
        ],
        optimization: {
            minimizer: [
                new TerserPlugin(terserOpt),
            ]
        },
        profile: !!0,
        cache: true,
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
module.exports = configParameters.map(config => {
    const [
        target, output
    ] = config;
    if (!output.filename) {
        output.filename = "[name].js";
    }
    output.path = `${__dirname}/${output.path}`;
    return createWebpackConfig(target, output, mode, extraOpt);
});
