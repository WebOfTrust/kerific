# How to for developers

The Kerific extension is build in Vue.js. Vue.js is used for packing, compressing etc.

The files for the extension are to be found in:
`/src`
`/public`

# Description of the files and their function

## External libraries, frameworks etc

### turndown.js

“Convert HTML into Markdown with JavaScript.”

<https://github.com/mixmark-io/turndown>

### Bootstrap

“Bootstrap is a powerful, feature-packed frontend toolkit. Build anything—from prototype to production—in minutes.”

<https://getbootstrap.com/docs/5.3/getting-started/introduction/>

### DOMPurify

“DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG.”

<https://github.com/cure53/DOMPurify>

## Internal scripts

### main.js

`/src/main.js

JavaScript that handles the main functionality: fetching external libraries and show them in a modal in the target page.

### collection.js

`/public/js/collection.js`

JavaScript that handles the collection page (collection.html).

### options.js

`/public/js/options.js`

JavaScript that handles the options page (options.html).

## How to

`/dist` is the build that is the source for the extension. This directory should be zipped and uploaded to the developers section of the [Chrome Web Store Developer Dashboard](https://chrome.google.com/u/1/webstore/devconsole/)

The references in manifest.json point to files in this final distribution.

`/dist` is generated from source via `npm run build`.
