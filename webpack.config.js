module.exports = {
	 mode: 'development',
	 //mode: 'production',
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
	 stats: {
		  warningsFilter: /String of some kind of specific error somewhere/
	 },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["d.ts", ".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "ts-loader",/*"awesome-typescript-loader"*/
					exclude: [  /node_modules/] },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader",
					exclude: [  /node_modules/] }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
		//	"tinymce":"tinymce"
        //"react": "React",
        //"react-dom": "ReactDOM"
    },
};