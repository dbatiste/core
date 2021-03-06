# TextAreas

The `<d2l-input-textarea>` is a wrapper around the native `<textarea>` element that provides auto-grow and validation behaviours. It's intended for inputting unformatted multi-line text.

![example screenshot of text input](../screenshots/textarea.gif?raw=true)

```html
<script type="module">
  import '@brightspace-ui/core/components/inputs/input-textarea.js';
</script>
<d2l-input-textarea
  label="Description"
  placeholder="Description of your topic."
  value="Some description..."></d2l-input-textarea>
```

**Properties:**

| Property | Type | Description |
|--|--|--|
| `aria-invalid` | String | Indicates that the `textarea` value is invalid |
| `description` | String | A description to be added to the `textarea` for accessibility |
| `disabled` | Boolean | Disables the `textarea` |
| `label` | String, required | Label for the `textarea` |
| `label-hidden` | Boolean | Hides the label visually (moves it to the `textarea`'s `aria-label` attribute) |
| `max-rows` | Number, default: 11 | Maximum number of rows before scrolling. Less than 1 allows `textarea` to grow infinitely. |
| `maxlength` | Number | Imposes an upper character limit |
| `minlength` | Number | Imposes a lower character limit |
| `no-border` | Boolean | Hides the border |
| `no-padding` | Boolean | Removes left/right padding |
| `placeholder` | String | Placeholder text |
| `required` | Boolean | Indicates that a value is required |
| `rows` | Number, default: 5 | Minimum number of rows. If `rows` and `max-rows` are equal then auto-grow will be disabled. |
| `value` | String, default: `''` | Value of the `textarea` |

**Accessibility:**

To make your usage of `d2l-input-textarea` accessible, use the following properties when applicable:

| Attribute | Description |
|--|--|
| `aria-invalid` | [Indicate that the `textarea` value is invalid](https://www.w3.org/WAI/PF/aria/states_and_properties#aria-invalid) |
| `description` | Use when label on `textarea` does not provide enough context. |
| `label` | **REQUIRED**  [Acts as a primary label on the `textarea`](https://www.w3.org/WAI/tutorials/forms/labels/). Visible unless `label-hidden` is also used. |
| `label-hidden` | Use if label should be visually hidden but available for screen reader users |

**Methods:**

| Method | Returns | Description |
|--|--|--|
| `focus()` | | Places focus in the `textarea` |
| `select()` | | Selects the contents of the `textarea` |

**Events:**

The `d2l-input-textarea` dispatches the `change` event when an alteration to the value is committed (typically after focus is lost) by the user. To be notified immediately of changes made by the user, use the `input` event.

```javascript
// dispatched when value changes are committed
textarea.addEventListener('change', (e) => {
  console.log(textarea.value);
});

// dispatched whenever value changes occur
textarea.addEventListener('input', (e) => {
  console.log(textarea.value);
});
```

## Applying styles to native textarea

Native `<textarea>` elements can be styled by importing `input-styles.js` into your LitElement and applying the `d2l-input` CSS class.

![example screenshot of textarea inputs](../screenshots/textarea-styles.gif?raw=true)

```javascript
import { inputStyles } from '@brightspace-ui/core/components/inputs/input-styles.js';
class MyElem extends LitElement {
  static get styles() {
    return inputStyles;
  }
  render() {
    return html`
      <textarea class="d2l-input">
      </textarea>
      `;
  }
}
```
