import '../input-time-range.js';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';

describe('d2l-input-time-range', () => {

	it('focused', async() => {
		const elem = await fixture(html`<d2l-input-time-range label="label text"></d2l-input-time-range>`);
		setTimeout(() => elem.focus());
		await oneEvent(elem, 'focus');
		await expect(elem).to.be.accessible({ ignoredRules: ['color-contrast'] }); // color-contrast takes a while and should be covered by axe tests in the individual components
	});

});
