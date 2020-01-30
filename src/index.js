/**
 * 图片压缩工具
 */
import 'babel-polyfill';
// import exif from './v-exif';
import getOrientation from './v-image-orientation';

/**
 * 压缩api
 * @param {any} [{
 * 	imageList = [], //需要压缩的图片文件数组，每个元素为File对象或者Image标签对象
 * 	ratio = 0.8 //压缩质量比率
 * }={}]
 * @return {promise}
 */
function compress({
	imageList = [],
	ratio = 0.8,
	disableFixOrientation = false
} = {}) {
	let compressors = Array.from(imageList).map(elem => (new Compressor(elem, ratio, disableFixOrientation)).handle());
	return Promise.all(compressors);
}

const windowWidth = 1024;
const windowHeight = 1024;

const private_image = Symbol('image');
const private_ratio = Symbol('ratio');
const private_blob = Symbol('blob');
const private_disableFixOrientation = Symbol('disableFixOrientation');
const private_readImagePromise = Symbol('readImagePromise');
const private_readExifInfoPromise = Symbol('readExifInfoPromise');
const private_canvasTransformPromise = Symbol('canvasTransformPromise');

class Compressor {
	constructor(img, ratio, disableFixOrientation) {
		this[private_image] = img;
		this[private_blob] = null;
		this[private_ratio] = ratio;
		this[private_disableFixOrientation] = disableFixOrientation;
	}

	async handle() {
		await this[private_readImagePromise]();
		let scaleInfo = await this[private_readExifInfoPromise]();
		let transformedData = await this[private_canvasTransformPromise](scaleInfo);
		return transformedData;
	}

	[private_readImagePromise]() {
		return new Promise((resolve, reject) => {
			if (this[private_image] instanceof File) {
				this[private_blob] = this[private_image];

				let reader = new FileReader();
				reader.onload = e => {
					let img = document.createElement('img');
					img.onload = () => {
						this[private_image] = img;
						resolve();
					};
					img.src = e.target.result;
				};
				reader.readAsDataURL(this[private_image]);
			}
			else if (this[private_image] instanceof HTMLImageElement) {
				image2blob(this[private_image]).then(data => {
					this[private_blob] = data;
					resolve();
				}).catch(error => {
					resolve();
					// reject(error);
				});
			}
			else {
				reject(new Error('image which to be compressed is error type!'));
			}
		});
	}

	[private_readExifInfoPromise]() {
		return new Promise((resolve, reject) => {
			let fixOrientation = o => {
				if (o < 1) {
					o = 1;
				}
				let w = this[private_image].width;
				let h = this[private_image].height;
				let scaledWidth = 0, scaledHeight = 0, scaledRatio = 1;
				if (o === 5 || o === 6 || o === 7 || o === 8) {
					({ width: scaledWidth, height: scaledHeight } = Compressor.getScaledSize(h, w));
					scaledRatio = scaledHeight / w;
				}
				else {
					({ width: scaledWidth, height: scaledHeight } = Compressor.getScaledSize(w, h));
					scaledRatio = scaledWidth / w;
				}
				resolve({
					originalWidth: w,
					originalHeight: h,
					scaledWidth,
					scaledHeight,
					scaledRatio,
					orientation: o
				});
			};
			if (!this[private_disableFixOrientation] && this[private_blob]) {
				getOrientation(this[private_blob], fixOrientation);
			}
			else {
				fixOrientation(1);
			}
		});
	}

	[private_canvasTransformPromise]({ originalWidth, originalHeight, scaledWidth, scaledHeight, scaledRatio, orientation }) {
		return new Promise((resolve) => {
			let canvas = document.createElement('canvas');
			canvas.width = scaledWidth;
			canvas.height = scaledHeight;
			let ctx = canvas.getContext('2d');

			ctx.scale(scaledRatio, scaledRatio);
			if (orientation === 3 || orientation === 4) {
				ctx.rotate(Math.PI);
				ctx.translate(0 - originalWidth, 0 - originalHeight);
			}
			else if (orientation === 5 || orientation === 6) {
				ctx.rotate(Math.PI / 2);
				ctx.translate(0, 0 - originalHeight);
			}
			else if (orientation === 7 || orientation === 8) {
				ctx.rotate(0 - Math.PI / 2);
				ctx.translate(0 - originalWidth, 0);
			}
			ctx.drawImage(this[private_image], 0, 0);
			let imgData = canvas.toDataURL('image/jpeg', this[private_ratio]);
			resolve({ resultImageData: imgData });
		});
	}

	static getScaledSize(w, h) {
		if (w > windowWidth) {
			let mh = Math.round(windowWidth / w * h);
			if (mh > windowHeight) {
				let mw = Math.round(windowHeight / h * w);
				return {
					width: mw,
					height: windowHeight
				};
			}
			else {
				return {
					width: windowWidth,
					height: mh
				};
			}
		}
		else if (h > windowHeight) {
			let mw = Math.round(windowHeight / h * w);
			if (mw > windowWidth) {
				let mh = Math.round(windowWidth / w * h);
				return {
					width: windowWidth,
					height: mh
				};
			}
			else {
				return {
					width: mw,
					height: windowHeight
				};
			}
		}
		else {
			return {
				width: w,
				height: h
			};
		}
	}
}


function image2blob(img) {
	return new Promise((resolve, reject) => {
		if (img.src) {
			if (/^data\:/i.test(img.src)) { // Data URI
				var arrayBuffer = base64ToArrayBuffer(img.src);
				resolve(arrayBuffer);
			} else if (/^blob\:/i.test(img.src)) { // Object URL
				var fileReader = new FileReader();
				fileReader.onload = function (e) {
					resolve(e.target.result);
				};
				objectURLToBlob(img.src, function (blob) {
					fileReader.readAsArrayBuffer(blob);
				});
			} else {
				var http = new XMLHttpRequest();
				http.onload = function () {
					if (this.status == 200 || this.status === 0) {
						resolve(http.response);
					} else {
						reject(new Error('Could not load image!'));
					}
					http = null;
				};
				http.onerror = function (error) {
					reject(new Error('Load image error!'));
				};
				http.open("GET", img.src, true);
				http.responseType = "arraybuffer";
				http.send(null);
			}
		}
		else {
			reject(new Error('image src is null!'));
		}
	});
}

function base64ToArrayBuffer(base64, contentType) {
	contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
	base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
	var binary = atob(base64);
	var len = binary.length;
	var buffer = new ArrayBuffer(len);
	var view = new Uint8Array(buffer);
	for (var i = 0; i < len; i++) {
		view[i] = binary.charCodeAt(i);
	}
	return buffer;
}

function objectURLToBlob(url, callback) {
	var http = new XMLHttpRequest();
	http.open("GET", url, true);
	http.responseType = "blob";
	http.onload = function (e) {
		if (this.status == 200 || this.status === 0) {
			callback(this.response);
		}
	};
	http.send();
}

export default {
	compress
};
