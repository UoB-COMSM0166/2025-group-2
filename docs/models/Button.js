/**
 * A reusable UI button component using p5.js DOM.
 * Automatically scales and aligns with canvas position and supports styling and hover effects.
 */

export class Button {
	/**
	 * @param {string} label - The text displayed on the button.
	 * @param {Function} onClick - Callback function executed when the button is clicked.
	 * @param {Object} [options={}] - Optional settings for styling and position.
	 * @param {number} [options.x] - X position of the button (default: canvas center).
	 * @param {number} [options.y] - Y position of the button (default: canvas center).
	 * @param {Function} [options.getScaleVal] - A function returning the current scale value.
	 * @param {string} [options.bgColor='#E5C3A6'] - Background color of the button.
	 * @param {string} [options.textColor='#6B4F3F'] - Text color of the button.
	 * @param {string} [options.hoverBg='#F4D8C6'] - Background color on hover.
	 * @param {string} [options.hoverText='#A3785F'] - Text color on hover.
	 */

	constructor(label, onClick, options = {}) {
		this.label = label;
		this.onClick = onClick;
		this.options = options;

		this.margin = options.margin || 10;
		this.x = options.x ?? width / 2;
		this.y = options.y ?? height / 2;

		this.button = createButton(this.label);
		this.applyDefaultStyle();
		this.setupEvents();
		this.updatePosition();

		window.addEventListener('resize', () => this.updatePosition());
	}

	/** Apply initial styles to the button element */
	applyDefaultStyle() {
		const s = this.options;
		this.button.style('background-color', s.bgColor || '#E5C3A6');
		this.button.style('color', s.textColor || '#6B4F3F');
		this.button.style('border', 'none');
		this.button.style('border-radius', '5px');
		this.button.style('font-size', '16px');
		this.button.style('padding', '8px 12px');
		this.button.style('cursor', 'pointer');
		this.button.style('font-family', 'Arial, sans-serif');
		this.button.style('box-shadow', '0px 2px 4px rgba(0,0,0,0.2)');
		this.button.style('position', 'absolute');
		this.button.style('transform-origin', 'top left');
		this.button.style('z-index', '1000');
		this.button.style('pointer-events', 'auto');
	}

	/** Setup hover and click events for the button */
	setupEvents() {
		this.button.mouseOver(() => {
			this.button.style('background-color', this.options.hoverBg || '#F4D8C6');
			this.button.style('color', this.options.hoverText || '#A3785F');
		});
		this.button.mouseOut(() => {
			this.button.style('background-color', this.options.bgColor || '#E5C3A6');
			this.button.style('color', this.options.textColor || '#6B4F3F');
		});

		this.button.elt.addEventListener('click', e => {
			e.preventDefault();
			e.stopPropagation();
			if (typeof this.onClick === 'function') this.onClick();
			return false;
		});
	}

	/** Update button's screen position according to canvas and scale */
	updatePosition() {
		const canvas = document.querySelector('canvas');
		if (!canvas) return;
		const canvasRect = canvas.getBoundingClientRect();

		const scale =
			typeof this.options.getScaleVal === 'function'
				? this.options.getScaleVal()
				: window.scaleVal || 1;

		this.button.style('transform', `scale(${scale})`);
		this.button.position(canvasRect.left + this.x * scale, canvasRect.top + this.y * scale);
	}

	/**
	 * Manually set a new position for the button
	 * @param {number} x
	 * @param {number} y
	 */
	setPosition(x, y) {
		this.x = x;
		this.y = y;
		this.updatePosition();
	}

	/**
	 * Dynamically change the button's style
	 * You can add more custom styles here (e.g., fontSize, border, borderRadius)
	 *
	 * @param {Object} styles
	 * @param {string} [styles.bgColor]
	 * @param {string} [styles.textColor]
	 * @param {string} [styles.hoverBg]
	 * @param {string} [styles.hoverText]
	 */
	setStyle(styles = {}) {
		if (styles.bgColor) {
			this.options.bgColor = styles.bgColor;
			this.button.style('background-color', styles.bgColor);
		}
		if (styles.textColor) {
			this.options.textColor = styles.textColor;
			this.button.style('color', styles.textColor);
		}
		if (styles.hoverBg) this.options.hoverBg = styles.hoverBg;
		if (styles.hoverText) this.options.hoverText = styles.hoverText;
	}

	/** Show the button */
	show() {
		this.button.show();
	}

	/** Hide the button */
	hide() {
		this.button.hide();
	}

	/** Remove the button from DOM */
	remove() {
		this.button.remove();
	}
}
