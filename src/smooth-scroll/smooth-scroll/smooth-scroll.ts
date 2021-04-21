import {ISmoothScrollOptions} from "../smooth-scroll-options/i-smooth-scroll-options";
import {ease} from "../../util/easing";
import {disableScrollSnap, DisableScrollSnapResult} from "../../util/disable-scroll-snap";

/**
 * The duration of a smooth scroll in ms
 * @type {number}
 */
const SCROLL_TIME = (window as any).__SMOOTH_SCROLL_TIME__ || 250;

/**
 * Performs a smooth repositioning of the scroll
 * @param {ISmoothScrollOptions} options
 */
export function smoothScroll(options: ISmoothScrollOptions): void {
	const {startTime, startX, startY, endX, endY, method, scroller} = options;

	let timeLapsed = 0;
	let start: number | undefined;

	const distanceX = endX - startX;
	const distanceY = endY - startY;

	// Temporarily disables any scroll snapping that may be active since it fights for control over the scroller with this polyfill
	let scrollSnapFix: DisableScrollSnapResult | undefined = disableScrollSnap(scroller);

	requestAnimationFrame(function animate(timestamp: number) {
		if (start == null) {
			start = timestamp;
		}
		timeLapsed += timestamp - startTime;
		const percentage = Math.max(0, Math.min(1, timeLapsed / SCROLL_TIME));
		const positionX = Math.floor(startX + distanceX * ease(percentage));
		const positionY = Math.floor(startY + distanceY * ease(percentage));

		method(positionX, positionY);

		if (positionX !== endX || positionY !== endY) {
			requestAnimationFrame(animate);
			start = timestamp;
		} else {
			if (scrollSnapFix != null) {
				scrollSnapFix.reset();
				scrollSnapFix = undefined;
			}
		}
	});
}
