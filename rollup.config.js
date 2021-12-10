import livereload from "rollup-plugin-livereload";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import cssOnly from "rollup-plugin-css-only";
import {terser} from "rollup-plugin-terser";
import preprocess from "svelte-preprocess";

import markdown from "rollup-plugin-markdown";
import static from "rollup-svelte-static"; // not "rollup-plugin-svelte-static" as it may not be able to follow rollup's plugin conventions

let dev = !!process.env.ROLLUP_WATCH;
let prod = !dev;

export default (async function() {
	return [
		// other builds e.g. global css
		
		...await static.createBuildConfigs({
			input: "pages/**/*.md",
			template: "src/template.html",
			
			createConfig(inputFilename, outputFilename, cssFilename, createPage) {
				return {
					input: inputFilename,
					
					output: {
						sourcemap: dev,
						format: "iife",
						file: outputFilename,
					},
					
					plugins: [
						markdown({
							// ...
						}),
						
						svelte({
							preprocess: preprocess({
								scss: {
									includePaths: ["src/css"],
								},
							}),
							
							compilerOptions: {
								dev,
							},
						}),
						
						// possible way of outputting the CSS
						cssOnly({
							output: cssFilename,
						}),
						
						resolve({
							browser: true,
							dedupe: importee => importee === "svelte" || importee.startsWith("svelte/"),
						}),
						
						commonjs(),
						
						dev && livereload("build/dev"),
						
						prod && terser(),
						
						createPage(), // this is what outputs the final HTML
					],
					
					onwarn() {
						
					},
				};
			},
		}),
	];
})();
