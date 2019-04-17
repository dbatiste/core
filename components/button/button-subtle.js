import 'd2l-icons/d2l-icon.js';
import 'd2l-icons/tier1-icons.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { ButtonMixin } from './button-mixin.js';
import { buttonSharedStyles } from './button-shared-styles.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { labelStyles } from '../typography/styles.js';
import { RtlMixin } from '../../mixins/rtl-mixin.js';

class ButtonSubtle extends ButtonMixin(RtlMixin(LitElement)) {

	static get properties() {
		return {
			hAlign: { type: String, reflect: true, attribute: 'h-align' },
			icon: { type: String, reflect: true },
			iconRight: { type: Boolean, reflect: true, attribute: 'icon-right' },
			text: { type: String, reflect: true }
		};
	}

	static get styles() {
		return [ labelStyles, buttonSharedStyles,
			css`
				:host {
					display: inline-block;
				}
				:host([hidden]) {
					display: none;
				}

				button {
					background-color: transparent;
					border-color: transparent;
					font-family: inherit;
					padding: 0.5rem 0.6rem;
					position: relative;
				}

				:host([h-align="text"]) button {
					left: -0.6rem;
				}
				:host([dir="rtl"][h-align="text"]) button {
					left: 0;
					right: -0.6rem;
				}

				/* Firefox includes a hidden border which messes up button dimensions */
				button::-moz-focus-inner {
					border: 0;
				}
				button[disabled]:hover,
				button[disabled]:focus,
				:host([active]) button[disabled] {
					background-color: transparent;
				}
				button:hover,
				button:focus,
				:host([active]) button {
					background-color: var(--d2l-color-gypsum);
				}

				.d2l-button-subtle-content {
					color: var(--d2l-color-celestine);
					vertical-align: middle;
				}
				:host([icon]) .d2l-button-subtle-content {
					padding-left: 1.2rem;
				}
				:host([icon][icon-right]) .d2l-button-subtle-content {
					padding-left: 0;
					padding-right: 1.2rem;
				}

				:host([dir="rtl"][icon]) .d2l-button-subtle-content {
					padding-left: 0;
					padding-right: 1.2rem;
				}

				:host([dir="rtl"][icon][icon-right]) .d2l-button-subtle-content {
					padding-left: 1.2rem;
					padding-right: 0;
				}

				d2l-icon.d2l-button-subtle-icon {
					color: var(--d2l-color-celestine);
					display: none;
					height: 0.9rem;
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					width: 0.9rem;
				}
				:host([icon]) d2l-icon.d2l-button-subtle-icon {
					display: inline-block;
				}
				:host([icon][icon-right]) d2l-icon.d2l-button-subtle-icon {
					right: 0.6rem;
				}
				:host([dir="rtl"][icon][icon-right]) d2l-icon.d2l-button-subtle-icon {
					left: 0.6rem;
					right: auto;
				}

				button[disabled] {
					cursor: default;
					opacity: 0.5;
				}
			`
		];
	}

	render() {
		return html`
			<button
				aria-expanded="${ifDefined(this.ariaExpanded)}"
				aria-haspopup="${ifDefined(this.ariaHaspopup)}"
				aria-label="${ifDefined(this.ariaLabel)}"
				?autofocus="${ifDefined(this.autofocus)}"
				class="d2l-label-text"
				?disabled="${this.disabled}"
				form="${ifDefined(this.form)}"
				formaction="${ifDefined(this.formaction)}"
				formenctype="${ifDefined(this.formenctype)}"
				formmethod="${ifDefined(this.formmethod)}"
				formnovalidate="${ifDefined(this.formnovalidate)}"
				formtarget="${ifDefined(this.formtarget)}"
				name="${ifDefined(this.name)}"
				type="${this.type}">
				<d2l-icon icon="${ifDefined(this.icon)}" class="d2l-button-subtle-icon"></d2l-icon>
				<span class="d2l-button-subtle-content">${this.text}</span>
				<slot></slot>
		</button>
		`;
	}

}

customElements.define('d2l-button-subtle', ButtonSubtle);
