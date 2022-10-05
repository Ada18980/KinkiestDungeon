"use strict";

// Loading bar
const PROGRESS_ROOT = document.getElementById('load-progress-root');
const PROGRESS_BAR = document.getElementById('load-progress-bar');
const PROGRESS_TEXT = document.getElementById('load-progress-text');

function updateProgress(text, num, div) {
	const pct = 50 * num / div;
	PROGRESS_BAR.style.width = `${pct}%`;
	PROGRESS_TEXT.innerText = `${text} ${num} / ${div}`;
}

updateProgress('Loading...', 0., 1);