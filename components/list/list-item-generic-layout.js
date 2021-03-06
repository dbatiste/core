import { css, html, LitElement } from 'lit-element/lit-element.js';
import { findComposedAncestor, getNextAncestorSibling, getPreviousAncestorSibling, isComposedAncestor } from '../../helpers/dom.js';
import {
	getComposedActiveElement,
	getFirstFocusableDescendant,
	getLastFocusableDescendant,
	isFocusable } from '../../helpers/focus.js';
import { RtlMixin } from '../../mixins/rtl-mixin.js';

const keyCodes = {
	DOWN: 40,
	END: 35,
	ENTER: 13,
	HOME: 36,
	LEFT: 37,
	PAGEUP: 33,
	PAGEDOWN: 34,
	RIGHT: 39,
	SPACE: 32,
	UP: 38
};

/**
 * A component for generating a list item's layout with forced focus ordering and grid support.
 * Focusable items placed in the "content" slot will have their focus removed; use the content-action
 * slot for such items.
 * @slot outside-control - Control associated on the far left, e.g., a drag-n-drop handle
 * @slot outside-control-action - An action area associated with the outside control
 * @slot control - Main control beside the outside control, e.g., a checkbox
 * @slot control-action - Action area associated with the main control
 * @slot content - Content of the list item, such as that in a list-item-content component.
 * @slot content-action - Action associated with the content, such as a navigation link
 * @slot actions - Other actions for the list item on the far right, such as a context menu
 */
class ListItemGenericLayout extends RtlMixin(LitElement) {

	static get properties() {
		return {
			/**
			 * @ignore
			 */
			role: { type: String, reflect: true },
			/**
			 * Specifies whether the grid is active or not
			 */
			gridActive: { type: Boolean, attribute: 'grid-active' }
		};
	}

	static get styles() {
		return css`
			:host {
				display: grid;
				grid-template-columns:
					[start outside-control-start] minmax(0, min-content)
					[control-start outside-control-end] minmax(0, min-content)
					[control-end content-start] minmax(0, auto)
					[content-end actions-start] minmax(0, max-content)
					[end actions-end];
				position: relative;
			}

			::slotted([slot="outside-control"]),
			::slotted([slot="control"]),
			::slotted([slot="content"]),
			::slotted([slot="actions"]) {
				grid-row: 1 / 2;
			}
			::slotted([slot="outside-control"]) {
				grid-column: outside-control-start / outside-control-end;
				width: 2.1rem;
			}

			::slotted([slot="control"]) {
				grid-column: control-start / control-end;
				width: 2.1rem;
			}

			::slotted([slot="content"]) {
				grid-column: content-start / content-end;
			}

			::slotted([slot="actions"]) {
				grid-column: actions-start / actions-end;
				justify-self: end;
				z-index: 4;
			}

			::slotted([slot="outside-control-action"]),
			::slotted([slot="control-action"]),
			::slotted([slot="content-action"]) {
				grid-row: 1 / 2;
			}
			::slotted([slot="outside-control-action"]) {
				grid-column: start / end;
				z-index: 1;
			}
			::slotted([slot="control-action"]) {
				grid-column: control-start / end;
				z-index: 2;
			}
			::slotted([slot="content-action"]) {
				grid-column: content-start / end;
				z-index: 3;
			}

		`;
	}

	constructor() {
		super();

		this._preventFocus = {
			handleEvent(event) {
				// target content slot only for now - can add others later
				const slot = (event.path || event.composedPath()).find((node) =>
					node.nodeName === 'SLOT' && ['content'].includes(node.name)
				);
				// eslint-disable-next-line no-console
				console.warn(`${slot.name} area should not have focusable items in it. Consider using href or creating a custom list-item.`);
			},
			capture: true
		};
	}

	connectedCallback() {
		super.connectedCallback();
		this.role = this.gridActive ? 'gridrow' : undefined;
	}

	firstUpdated() {
		this.addEventListener('keydown', this._onKeydown.bind(this));
		this.addEventListener('keyup', this._onKeyup.bind(this));
		this.addEventListener('focusin', this._setFocusInfo.bind(this));
	}

	render() {
		return html`
			<slot name="content-action" class="d2l-cell" data-cell-num="5"></slot>
			<slot name="outside-control-action" class="d2l-cell" data-cell-num="1"></slot>
			<slot name="outside-control" class="d2l-cell" data-cell-num="2"></slot>
			<slot name="control-action" class="d2l-cell" data-cell-num="3"></slot>
			<slot name="control" class="d2l-cell" data-cell-num="4"></slot>
			<slot name="actions" class="d2l-cell" data-cell-num="6"></slot>

			<slot name="content" @focus="${this._preventFocus}"></slot>
		`;
	}

	_focusCellItem(num, itemNum) {
		const cell = this.shadowRoot.querySelector(`[data-cell-num="${num}"]`);
		if (!cell) return;

		const firstFocusable = getFirstFocusableDescendant(cell);
		if (!firstFocusable) return;

		if (itemNum === 1 || !this._focusNextWithinCell(firstFocusable, itemNum)) {
			firstFocusable.focus();
		}
	}

	_focusFirstRow() {
		const list = findComposedAncestor(this, (node) => node.tagName === 'D2L-LIST');
		const row = list.firstElementChild.shadowRoot.querySelector('[role="gridrow"]');
		if (this.dir === 'rtl') {
			row._focusLastItem();
		} else {
			row._focusNextCell(1);
		}
	}

	_focusLastItem() {
		let cell = null;
		let focusable = null;
		let num = 1;
		do {
			cell = this.shadowRoot.querySelector(`[data-cell-num="${num++}"]`);
			if (cell) {
				focusable = getLastFocusableDescendant(cell) || focusable;
			}
		} while (cell);
		focusable.focus();
	}

	_focusLastRow() {
		const list = findComposedAncestor(this, (node) => node.tagName === 'D2L-LIST');
		const row = list.lastElementChild.shadowRoot.querySelector('[role="gridrow"]');
		if (this.dir === 'rtl') {
			row._focusNextCell(1);
		} else {
			row._focusLastItem();
		}
	}

	_focusNextCell(num, forward = true) {
		let cell = null;
		let focusable = null;
		do {
			cell = this.shadowRoot.querySelector(`[data-cell-num="${num}"]`);
			if (cell) {
				focusable = forward ? getFirstFocusableDescendant(cell) : getLastFocusableDescendant(cell);
			}
			if (focusable) focusable.focus();
			forward ? ++num : --num;
		} while (cell && !focusable);
		return focusable;
	}

	_focusNextRow(previous = false, num = 1) {
		let listItem = previous ?
			getPreviousAncestorSibling(this, (node) => node.role === 'rowgroup') :
			getNextAncestorSibling(this, (node) => node.role === 'rowgroup');
		if (!listItem || !listItem.shadowRoot) return;
		while (num > 1) {
			const nextItem = previous ? listItem.previousElementSibling : listItem.nextElementSibling;
			if (!nextItem) {
				break; //we ran out of items
			}
			listItem = nextItem;
			--num;
		}
		const row = listItem.shadowRoot.querySelector('[role="gridrow"]');
		if (!row) return;

		row._focusCellItem(this._cellNum, this._cellFocusedItem);
	}

	_focusNextWithinCell(node, num = 1) {
		if (!node || (node.assignedSlot && node.assignedSlot === this._getThisCell())) return null;
		let focusable = null;
		let siblingNum = 1;
		while (!focusable || siblingNum < num) {
			node = this._getNextSiblingInCell(node);
			if (!node) break;
			++siblingNum;
			focusable = isFocusable(node, true) ? node : getFirstFocusableDescendant(node);
		}

		if (focusable) focusable.focus();
		return focusable;
	}

	_focusPreviousWithinCell(node) {
		if (!node || (node.assignedSlot && node.assignedSlot === this._getThisCell())) return null;
		let focusable = null;
		while (!focusable) {
			node = this._getPrevSiblingInCell(node);
			if (!node) break;
			focusable = isFocusable(node, true) ? node : getLastFocusableDescendant(node);
		}
		if (focusable) focusable.focus();
		return focusable;
	}

	_getFocusedItemPosition(node) {
		let position = 1;
		// walk the tree backwards until we hit the cell
		do {
			node = this._getPrevSiblingInCell(node);
			if (node) {
				const focusable = isFocusable(node, true) ? node : getLastFocusableDescendant(node);
				if (focusable) {
					++position;
					node = focusable;
				}
			}
		} while (node);
		return position;
	}

	_getNextSiblingInCell(node) {
		const cell = findComposedAncestor(node, (parent) => parent.classList && parent.classList.contains('d2l-cell'));
		if (!cell || cell.name === node.slot) return null;
		if (node.nextElementSibling) return node.nextElementSibling;

		const sibling = getNextAncestorSibling(node);
		return isComposedAncestor(cell, sibling) ? sibling : null;
	}

	_getPrevSiblingInCell(node) {
		const cell = findComposedAncestor(node, (parent) => parent.classList && parent.classList.contains('d2l-cell'));
		if (!cell || cell.name === node.slot) return null;
		if (node.previousElementSibling) return node.previousElementSibling;

		const sibling = getPreviousAncestorSibling(node);
		return isComposedAncestor(cell, sibling) ? sibling : null;
	}

	_getThisCell() {
		return this.shadowRoot.querySelector(`.d2l-cell[data-cell-num="${this._cellNum}"]`);
	}

	_onKeydown(event) {
		if (!this.gridActive) return;
		let preventDefault = true;
		switch (event.keyCode) {
			case keyCodes.ENTER:
			case keyCodes.SPACE:
			case keyCodes.RIGHT:
			case keyCodes.LEFT:
			case keyCodes.UP:
			case keyCodes.DOWN:
			case keyCodes.HOME:
			case keyCodes.END:
			case keyCodes.PAGEUP:
			case keyCodes.PAGEDOWN:
				break;
			default:
				preventDefault = false;
		}
		if (preventDefault) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	_onKeyup(event) {
		if (!this.gridActive) return;
		let node = null;
		let preventDefault = true;
		switch (event.keyCode) {
			case keyCodes.ENTER:
			case keyCodes.SPACE:
				node = getComposedActiveElement();
				node.click();
				break;
			case keyCodes.RIGHT:
				node = getComposedActiveElement();
				if (this.dir === 'rtl') {
					if (!this._focusPreviousWithinCell(node)) {
						this._focusNextCell(this._cellNum - 1, false);
					}
				} else {
					if (!this._focusNextWithinCell(node)) {
						this._focusNextCell(this._cellNum + 1);
					}
				}
				break;
			case keyCodes.LEFT:
				node = getComposedActiveElement();
				if (this.dir === 'rtl') {
					if (!this._focusNextWithinCell(node)) {
						this._focusNextCell(this._cellNum + 1);
					}
				} else {
					if (!this._focusPreviousWithinCell(node)) {
						this._focusNextCell(this._cellNum - 1, false);
					}
				}
				break;
			case keyCodes.UP:
				// move to above row, focus same item within the cell
				this._focusNextRow(true);
				break;
			case keyCodes.DOWN:
				// move to below row, focus same item within the cell
				this._focusNextRow();
				break;
			case keyCodes.HOME:
				if (this.dir === 'rtl') {
					if (event.ctrlKey) {
						this._focusFirstRow();
					} else {
						// focus last item
						this._focusLastItem();
					}
				} else {
					if (event.ctrlKey) {
						// focus first item of first row
						this._focusFirstRow();
					} else {
						// focus first item
						this._focusNextCell(1);
					}
				}
				break;
			case keyCodes.END:
				if (this.dir === 'rtl') {
					if (event.ctrlKey) {
						// focus first item of last row
						this._focusLastRow();
					} else {
						// focus first item
						this._focusNextCell(1);
					}
				} else {
					if (event.ctrlKey) {
						// focus last item of last row
						this._focusLastRow();
					} else {
						// focus last item
						this._focusLastItem();
					}
				}
				break;
			case keyCodes.PAGEUP:
				// focus five rows up
				this._focusNextRow(true, 5);
				break;
			case keyCodes.PAGEDOWN:
				// focus five rows down
				this._focusNextRow(false, 5);
				break;
			default:
				preventDefault = false;
		}
		if (preventDefault) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	_setFocusInfo(event) {
		if (!this.gridActive) return;
		const slot = (event.path || event.composedPath()).find(node =>
			node.nodeName === 'SLOT' && node.classList.contains('d2l-cell'));
		this._cellNum = parseInt(slot.getAttribute('data-cell-num'));
		this._cellFocusedItem = this._getFocusedItemPosition(event.target);
	}
}

customElements.define('d2l-list-item-generic-layout', ListItemGenericLayout);
