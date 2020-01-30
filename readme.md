# v-image-compressor

> image compressor running in browser

## Build Setup

``` bash
# install dependencies
npm install

# serve development program
npm run dev

# build for production
npm run prod
```

## How to setup?

``` bash
npm install --save v-image-compressor
```

## How to use?

``` javascript
// ES6
import imageCompressor from 'v-image-compressor';

// CommonJS
var imageCompressor = require('v-image-compressor');

// Call compress
imageCompressor.compress(option).then(results => {
	// results is a array that contains base64 format image
	let convertedImage64 = results[0].resultImageData;
});
```
## option
| option        | Type   | Default  | Description
| --------------|------- | -------- | ---------------
| imageList     | Array  | []       | image list that will be compressed. The type of every element is File or Image.
| ratio         | Number | 0.8      | Quality compression ratio of image
