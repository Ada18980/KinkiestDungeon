"use strict";

const path = require("path");
const log = require("fancy-log");
const c = require("ansi-colors");
const gulp = require("gulp");
const gulpCount = require("gulp-count");
const gulpIf = require("gulp-if");
const size = require("gulp-size");
const filter = require("gulp-filter");
const imagemin = require("gulp-imagemin");
const jpegtran = require("imagemin-jpegtran");
const cache = require("gulp-cache");
const through = require("through2");
const rimraf = require("rimraf");
const { table } = require("table");
const prettyBytes = require("pretty-bytes");
const StreamCounter = require("stream-counter");

const BASE_DIR = path.resolve(__dirname, "..", "..");
const CACHE_DIR = path.resolve(__dirname, ".imagemin-cache");
const BATCH_SIZE = 500;
const SIZE_CONFIG = { showTotal: false };

exports.assetMinify = gulp.series(logIntro, analyzeBefore, generateBatches, minifyBatches, analyzeAfter, report);

exports.clean = function (cb) {
	rimraf(CACHE_DIR, cb);
};

let files = [];
let batches = [];
const sizes = {
	before: {
		png: size(SIZE_CONFIG),
		jpg: size(SIZE_CONFIG),
		svg: size(SIZE_CONFIG),
		total: size(SIZE_CONFIG),
	},
	after: {
		png: size(SIZE_CONFIG),
		jpg: size(SIZE_CONFIG),
		svg: size(SIZE_CONFIG),
		total: size(SIZE_CONFIG),
	},
};

function logIntro(cb) {
	log(c.cyan("Starting image minification. Please be patient, this can take a long time..."));
	cb();
}

function analyze(beforeOrAfter, sizePlugins, record = false) {
	if (record) {
		files = [];
	}
	return sourceFiles()
		.pipe(gulpIf(record, through.obj((file, env, cb) => {
			files.push(file.path);
			cb(null, file);
		})))
		.pipe(gulpLog(
			"",
			c.cyan(`File counts ${beforeOrAfter} minification`),
			"--------------------------------",
		))
		.pipe(gulpIf(/\.png$/, count("PNG:\t<%= files %> found")))
		.pipe(gulpIf(/\.png$/, sizePlugins.png))
		.pipe(gulpIf(/\.jpe?g$/, count("JPG:\t<%= files %> found")))
		.pipe(gulpIf(/\.jpe?g$/, sizePlugins.jpg))
		.pipe(gulpIf(/\.svg$/, count("SVG:\t<%= files %> found")))
		.pipe(gulpIf(/\.svg$/, sizePlugins.svg))
		.pipe(gulpLog("--------------------------------"))
		.pipe(count("Found <%= files %> in total for minification"))
		.pipe(sizePlugins.total)
		.pipe(gulpLog(
			"",
			c.cyan(`File sizes ${beforeOrAfter} minification`),
			"--------------------------------",
		))
		.pipe(gulpLog(
			() => `PNG: \t${c.magenta(sizePlugins.png.prettySize)}`,
			() => `JPG: \t${c.magenta(sizePlugins.jpg.prettySize)}`,
			() => `SVG: \t${c.magenta(sizePlugins.svg.prettySize)}`,
			"--------------------------------",
			() => `Total: \t${c.magenta(sizePlugins.total.prettySize)}`,
			"",
		));
}

function analyzeBefore() {
	return analyze("before", sizes.before, true);
}

function analyzeAfter() {
	return analyze("after", sizes.after);
}

function report(cb) {
	const { before, after } = sizes;
	log("");
	log(c.cyan("Image minification report"));
	log("--------------------------------");
	const tableData = [
		reportHeader(),
		reportRow("PNG", before.png, after.png),
		reportRow("JPG", before.jpg, after.jpg),
		reportRow("SVG", before.svg, after.svg),
		reportRow("Total", before.total, after.total),
	];
	const tableLines = table(tableData).split("\n");
	for (const line of tableLines) {
		log(line);
	}
	cb();
}

function reportHeader() {
	return [
		c.cyan("File Type"),
		c.cyan("Size before"),
		c.cyan("Size after"),
		c.cyan("Difference"),
		c.cyan("Percentage reduction"),
	];
}

function reportRow(fileType, before, after) {
	return [
		fileType,
		before.prettySize,
		after.prettySize,
		colorizeSizeDifference(before.size, after.size),
		colorizeSizePercentage(before.size, after.size),
	];
}

function getRAGColor(before, after) {
	return after < before ? c.green
		: after > before ? c.red
			: c.yellow;
}

function colorizeSizeDifference(before, after) {
	const color = getRAGColor(before, after);
	return color(prettyBytes(after - before, { signed: true }));
}

function colorizeSizePercentage(before, after) {
	const color = getRAGColor(before, after);
	const reduction = before - after;
	const percentage = before !== 0 ? 100 * reduction / before : 0;
	return color(`${percentage.toFixed(2)}%`);
}

function generateBatches(cb) {
	log(`Splitting ${c.magenta(files.length)} files into batches of size ${c.magenta(BATCH_SIZE)}...`);
	batches = [];
	for (let i = 0; i < files.length; i += BATCH_SIZE) {
		batches.push(files.slice(i, i + BATCH_SIZE));
	}
	log(`${c.magenta(batches.length)} batches generated.`);
	cb();
}

function minifyBatches(cb) {
	const tasks = batches.map((batch, i) => {
		function minifyTask() {
			log(`Minifying batch ${c.magenta(i + 1)} of ${c.magenta(batches.length)}`);
			return minifyBatch(batch);
		}

		minifyTask.displayName = `Minify batch ${i + 1} of ${batches.length}`;
		return minifyTask;
	});

	return gulp.series(...tasks, (seriesDone) => {
		seriesDone();
		cb();
	})();
}

function minifyBatch(batch) {
	const sizesBefore = fileSizes();
	const sizesAfter = fileSizes();
	return gulp.src(batch, { base: BASE_DIR })
		.pipe(sizesBefore)
		.pipe(cache(
			configureImagemin(),
			{
				name: "imagemin",
				fileCache: new cache.Cache({
					tmpDir: CACHE_DIR,
					cacheDirName: "imagemin-cache",
				}),
			},
		))
		.pipe(sizesAfter)
		.pipe(filter((file) => {
			const sizeBefore = sizesBefore.sizes.get(file.path);
			const sizeAfter = sizesAfter.sizes.get(file.path);
			if (sizeAfter > sizeBefore) {
				log(`Omitting file "${c.magenta(file.path)}": size after minification is greater than original size.`);
			}
			return sizeAfter <= sizeBefore;
		}))
		.pipe(gulp.dest(BASE_DIR));
}

function configureImagemin() {
	return imagemin([
		jpegtran(),
		imagemin.optipng({ optimizationLevel: 5 }),
		imagemin.svgo({
			plugins: [
				{
					name: "removeViewBox",
					active: true,
				},
				{
					name: "cleanupIDs",
					active: true,
				},
			],
		}),
	]);
}

function sourceFiles() {
	return gulp.src([
		`${BASE_DIR}/**/*.{jpg,jpeg,png,svg}`,
		`!${BASE_DIR}/**/Assets/Female3DCG/BodyUpper/3DCGPose/**/*`,
		`!${BASE_DIR}/Tools/**/*`,
	], { base: BASE_DIR });
}

function count(message) {
	return gulpCount({ message, logger: log });
}

function gulpLog(...messages) {
	return through.obj(
		(file, enc, cb) => cb(null, file),
		(cb) => {
			for (const message of messages) {
				if (typeof message === "function") {
					log(message());
				} else {
					log(message);
				}
			}
			cb();
		},
	);
}

function fileSizes() {
	const sizes = new Map();

	return through.obj(
		async function (file, enc, cb) {
			if (!this.sizes) {
				this.sizes = sizes;
			}

			if (file.isNull()) {
				cb(null, file);
				return;
			}

			let size = 0;

			if (file.isStream()) {
				size = await getStreamSize(file);
			} else if (file.isBuffer()) {
				size = file.contents.length;
			}

			sizes.set(file.path, size);

			cb(null, file);
		},
	);
}

function getStreamSize(file) {
	return new Promise((resolve, reject) => {
		const stream = file.contents.pipe(new StreamCounter());
		stream.on("finish", () => resolve(stream.bytes))
			.on("error", (error) => reject(error));
	});
}
