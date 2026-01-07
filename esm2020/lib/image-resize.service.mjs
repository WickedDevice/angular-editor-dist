import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class ImageResizeService {
    constructor() {
        this.hasBlobConstructor = typeof (Blob) !== 'undefined' && (function () {
            try {
                return Boolean(new Blob());
            }
            catch (e) {
                return false;
            }
        }());
        this.hasArrayBufferViewSupport = this.hasBlobConstructor && typeof (Uint8Array) !== 'undefined' && (function () {
            try {
                return new Blob([new Uint8Array(100)]).size === 100;
            }
            catch (e) {
                return false;
            }
        }());
        this.hasToBlobSupport = (typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.toBlob : false);
        this.hasBlobSupport = (this.hasToBlobSupport ||
            (typeof Uint8Array !== 'undefined' && typeof ArrayBuffer !== 'undefined' && typeof atob !== 'undefined'));
        this.hasReaderSupport = (typeof FileReader !== 'undefined' || typeof URL !== 'undefined');
    }
    resize(file, maxDimensions, callback) {
        if (typeof maxDimensions === 'function') {
            callback = maxDimensions;
            maxDimensions = {
                width: 640,
                height: 480
            };
        }
        if (!this.isSupported() || !file.type.match(/image.*/)) {
            callback(file, false);
            return false;
        }
        if (file.type.match(/image\/gif/)) {
            // Not attempting, could be an animated gif
            callback(file, false);
            // TODO: use https://github.com/antimatter15/whammy to convert gif to webm
            return false;
        }
        const image = document.createElement('img');
        image.onload = (imgEvt) => {
            let width = image.width;
            let height = image.height;
            let isTooLarge = false;
            if (width >= height && width > maxDimensions.width) {
                isTooLarge = true;
            }
            else if (height > maxDimensions.height) {
                isTooLarge = true;
            }
            if (!isTooLarge) {
                // early exit; no need to resize
                callback(file, false);
                return;
            }
            const scaleRatio = maxDimensions.width / width;
            // TODO number of resampling steps
            // const steps = Math.ceil(Math.log(width / (width * scaleRatio)) / Math.log(2));
            width *= scaleRatio;
            height *= scaleRatio;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(image, 0, 0, width, height);
            if (this.hasToBlobSupport) {
                canvas.toBlob((blob) => {
                    callback(blob, true);
                }, file.type);
            }
            else {
                const blob = this._toBlob(canvas, file.type);
                callback(blob, true);
            }
        };
        this._loadImage(image, file);
        return true;
    }
    isSupported() {
        return ((typeof (HTMLCanvasElement) !== 'undefined')
            && this.hasBlobSupport
            && this.hasReaderSupport);
    }
    _toBlob(canvas, type) {
        const dataURI = canvas.toDataURL(type);
        const dataURIParts = dataURI.split(',');
        let byteString;
        if (dataURIParts[0].indexOf('base64') >= 0) {
            // Convert base64 to raw binary data held in a string:
            byteString = atob(dataURIParts[1]);
        }
        else {
            // Convert base64/URLEncoded data component to raw binary data:
            byteString = decodeURIComponent(dataURIParts[1]);
        }
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const intArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i += 1) {
            intArray[i] = byteString.charCodeAt(i);
        }
        const mimeString = dataURIParts[0].split(':')[1].split(';')[0];
        let blob = null;
        if (this.hasBlobConstructor) {
            blob = new Blob([this.hasArrayBufferViewSupport ? intArray : arrayBuffer], { type: mimeString });
        }
        else {
            blob = new Blob([arrayBuffer]);
        }
        return blob;
    }
    _loadImage(image, file, callback) {
        if (typeof (URL) === 'undefined') {
            const reader = new FileReader();
            reader.onload = function (evt) {
                image.src = evt.target.result;
                if (callback) {
                    callback();
                }
            };
            reader.readAsDataURL(file);
        }
        else {
            image.src = URL.createObjectURL(file);
            if (callback) {
                callback();
            }
        }
    }
    _toFile(theBlob, fileName) {
        const b = theBlob;
        b.lastModifiedDate = new Date();
        b.name = fileName;
        return theBlob;
    }
}
ImageResizeService.ɵfac = function ImageResizeService_Factory(t) { return new (t || ImageResizeService)(); };
ImageResizeService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ImageResizeService, factory: ImageResizeService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ImageResizeService, [{
        type: Injectable
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UtcmVzaXplLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWVkaXRvci9zcmMvbGliL2ltYWdlLXJlc2l6ZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBSW5ELE1BQU0sT0FBTyxrQkFBa0I7SUF3QjdCO1FBdkJBLHVCQUFrQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUksQ0FBQztZQUNyRCxJQUFJO2dCQUNGLE9BQU8sT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQzthQUM1QjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7UUFDSCxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRUwsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxXQUFXLElBQUksQ0FBQztZQUM3RixJQUFJO2dCQUNGLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQzthQUNyRDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7UUFDSCxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRUwscUJBQWdCLEdBQUcsQ0FBQyxPQUFPLGlCQUFpQixLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0csbUJBQWMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0I7WUFDckMsQ0FBQyxPQUFPLFVBQVUsS0FBSyxXQUFXLElBQUksT0FBTyxXQUFXLEtBQUssV0FBVyxJ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LEVBQUUsQ0FBQzthQUNaO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLE9BQWEsRUFBRSxRQUFnQjtRQUNyQyxNQUFNLENBQUMsR0FBUSxPQUFPLENBQUM7UUFDdkIsQ0FBQyxDQUFDLGdCQUFnQixHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDaEMsQ0FBQyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7UUFDbEIsT0FBYSxPQUFPLENBQUM7SUFDdkIsQ0FBQzs7b0ZBL0pVLGtCQUFrQjt3RUFBbEIsa0JBQWtCLFdBQWxCLGtCQUFrQjt1RkFBbEIsa0JBQWtCO2NBRDlCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEltYWdlUmVzaXplU2VydmljZSB7XG4gIGhhc0Jsb2JDb25zdHJ1Y3RvciA9IHR5cGVvZiAoQmxvYikgIT09ICd1bmRlZmluZWQnICYmIChmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBCb29sZWFuKG5ldyBCbG9iKCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0oKSk7XG5cbiAgaGFzQXJyYXlCdWZmZXJWaWV3U3VwcG9ydCA9IHRoaXMuaGFzQmxvYkNvbnN0cnVjdG9yICYmIHR5cGVvZiAoVWludDhBcnJheSkgIT09ICd1bmRlZmluZWQnICYmIChmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoMTAwKV0pLnNpemUgPT09IDEwMDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KCkpO1xuXG4gIGhhc1RvQmxvYlN1cHBvcnQgPSAodHlwZW9mIEhUTUxDYW52YXNFbGVtZW50ICE9PSAndW5kZWZpbmVkJyA/IEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS50b0Jsb2IgOiBmYWxzZSk7XG5cbiAgaGFzQmxvYlN1cHBvcnQgPSAodGhpcy5oYXNUb0Jsb2JTdXBwb3J0IHx8XG4gICAgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBhdG9iICE9PSAndW5kZWZpbmVkJykpO1xuXG4gIGhhc1JlYWRlclN1cHBvcnQgPSAodHlwZW9mIEZpbGVSZWFkZXIgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBVUkwgIT09ICd1bmRlZmluZWQnKTtcblxuICBjb25zdHJ1Y3RvcigpIHsgfVxuXG4gIHJlc2l6ZShmaWxlOiBGaWxlLCBtYXhEaW1lbnNpb25zOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH0sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHR5cGVvZiBtYXhEaW1lbnNpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG1heERpbWVuc2lvbnM7XG4gICAgICBtYXhEaW1lbnNpb25zID0ge1xuICAgICAgICB3aWR0aDogNjQwLFxuICAgICAgICBoZWlnaHQ6IDQ4MFxuICAgICAgfTtcbiAgICB9XG5cblxuICAgIGlmICghdGhpcy5pc1N1cHBvcnRlZCgpIHx8ICFmaWxlLnR5cGUubWF0Y2goL2ltYWdlLiovKSkge1xuICAgICAgY2FsbGJhY2soZmlsZSwgZmFsc2UpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChmaWxlLnR5cGUubWF0Y2goL2ltYWdlXFwvZ2lmLykpIHtcbiAgICAgIC8vIE5vdCBhdHRlbXB0aW5nLCBjb3VsZCBiZSBhbiBhbmltYXRlZCBnaWZcbiAgICAgIGNhbGxiYWNrKGZpbGUsIGZhbHNlKTtcbiAgICAgIC8vIFRPRE86IHVzZSBodHRwczovL2dpdGh1Yi5jb20vYW50aW1hdHRlcjE1L3doYW1teSB0byBjb252ZXJ0IGdpZiB0byB3ZWJtXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgIGltYWdlLm9ubG9hZCA9IChpbWdFdnQpID0+IHtcbiAgICAgIGxldCB3aWR0aCA9IGltYWdlLndpZHRoO1xuICAgICAgbGV0IGhlaWdodCA9IGltYWdlLmhlaWdodDtcbiAgICAgIGxldCBpc1Rvb0xhcmdlID0gZmFsc2U7XG5cbiAgICAgIGlmICh3aWR0aCA+PSBoZWlnaHQgJiYgd2lkdGggPiBtYXhEaW1lbnNpb25zLndpZHRoKSB7XG4gICAgICAgIGlzVG9vTGFyZ2UgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChoZWlnaHQgPiBtYXhEaW1lbnNpb25zLmhlaWdodCkge1xuICAgICAgICBpc1Rvb0xhcmdlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc1Rvb0xhcmdlKSB7XG4gICAgICAgIC8vIGVhcmx5IGV4aXQ7IG5vIG5lZWQgdG8gcmVzaXplXG4gICAgICAgIGNhbGxiYWNrKGZpbGUsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzY2FsZVJhdGlvID0gbWF4RGltZW5zaW9ucy53aWR0aCAvIHdpZHRoO1xuXG4gICAgICAvLyBUT0RPIG51bWJlciBvZiByZXNhbXBsaW5nIHN0ZXBzXG4gICAgICAvLyBjb25zdCBzdGVwcyA9IE1hdGguY2VpbChNYXRoLmxvZyh3aWR0aCAvICh3aWR0aCAqIHNjYWxlUmF0aW8pKSAvIE1hdGgubG9nKDIpKTtcblxuICAgICAgd2lkdGggKj0gc2NhbGVSYXRpbztcbiAgICAgIGhlaWdodCAqPSBzY2FsZVJhdGlvO1xuXG4gICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gdHJ1ZTtcbiAgICAgIChjdHggYXMgYW55KS5pbWFnZVNtb290aGluZ1F1YWxpdHkgPSAnaGlnaCc7XG4gICAgICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgaWYgKHRoaXMuaGFzVG9CbG9iU3VwcG9ydCkge1xuICAgICAgICBjYW52YXMudG9CbG9iKChibG9iKSA9PiB7XG4gICAgICAgICAgY2FsbGJhY2soYmxvYiwgdHJ1ZSk7XG4gICAgICAgIH0sIGZpbGUudHlwZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBibG9iID0gdGhpcy5fdG9CbG9iKGNhbnZhcywgZmlsZS50eXBlKTtcbiAgICAgICAgY2FsbGJhY2soYmxvYiwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLl9sb2FkSW1hZ2UoaW1hZ2UsIGZpbGUpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpc1N1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgKHR5cGVvZiAoSFRNTENhbnZhc0VsZW1lbnQpICE9PSAndW5kZWZpbmVkJylcbiAgICAgICYmIHRoaXMuaGFzQmxvYlN1cHBvcnRcbiAgICAgICYmIHRoaXMuaGFzUmVhZGVyU3VwcG9ydFxuICAgICk7XG4gIH1cblxuICBfdG9CbG9iKGNhbnZhcywgdHlwZSkge1xuICAgIGNvbnN0IGRhdGFVUkkgPSBjYW52YXMudG9EYXRhVVJMKHR5cGUpO1xuICAgIGNvbnN0IGRhdGFVUklQYXJ0cyA9IGRhdGFVUkkuc3BsaXQoJywnKTtcbiAgICBsZXQgYnl0ZVN0cmluZztcbiAgICBpZiAoZGF0YVVSSVBhcnRzWzBdLmluZGV4T2YoJ2Jhc2U2NCcpID49IDApIHtcbiAgICAgIC8vIENvbnZlcnQgYmFzZTY0IHRvIHJhdyBiaW5hcnkgZGF0YSBoZWxkIGluIGEgc3RyaW5nOlxuICAgICAgYnl0ZVN0cmluZyA9IGF0b2IoZGF0YVVSSVBhcnRzWzFdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ29udmVydCBiYXNlNjQvVVJMRW5jb2RlZCBkYXRhIGNvbXBvbmVudCB0byByYXcgYmluYXJ5IGRhdGE6XG4gICAgICBieXRlU3RyaW5nID0gZGVjb2RlVVJJQ29tcG9uZW50KGRhdGFVUklQYXJ0c1sxXSk7XG4gICAgfVxuICAgIGNvbnN0IGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVTdHJpbmcubGVuZ3RoKTtcbiAgICBjb25zdCBpbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZVN0cmluZy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgaW50QXJyYXlbaV0gPSBieXRlU3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuXG4gICAgY29uc3QgbWltZVN0cmluZyA9IGRhdGFVUklQYXJ0c1swXS5zcGxpdCgnOicpWzFdLnNwbGl0KCc7JylbMF07XG4gICAgbGV0IGJsb2IgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuaGFzQmxvYkNvbnN0cnVjdG9yKSB7XG4gICAgICBibG9iID0gbmV3IEJsb2IoXG4gICAgICAgIFt0aGlzLmhhc0FycmF5QnVmZmVyVmlld1N1cHBvcnQgPyBpbnRBcnJheSA6IGFycmF5QnVmZmVyXSxcbiAgICAgICAgeyB0eXBlOiBtaW1lU3RyaW5nIH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJsb2IgPSBuZXcgQmxvYihbYXJyYXlCdWZmZXJdKTtcbiAgICB9XG4gICAgcmV0dXJuIGJsb2I7XG4gIH1cblxuICBfbG9hZEltYWdlKGltYWdlLCBmaWxlLCBjYWxsYmFjaz86IGFueSkge1xuICAgIGlmICh0eXBlb2YgKFVSTCkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgaW1hZ2Uuc3JjID0gKGV2dC50YXJnZXQgYXMgYW55KS5yZXN1bHQ7XG4gICAgICAgIGlmIChjYWxsYmFjaykgeyBjYWxsYmFjaygpOyB9XG4gICAgICB9O1xuICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGltYWdlLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdG9GaWxlKHRoZUJsb2I6IEJsb2IsIGZpbGVOYW1lOiBzdHJpbmcpOiBGaWxlIHtcbiAgICBjb25zdCBiOiBhbnkgPSB0aGVCbG9iO1xuICAgIGIubGFzdE1vZGlmaWVkRGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgYi5uYW1lID0gZmlsZU5hbWU7XG4gICAgcmV0dXJuIDxGaWxlPnRoZUJsb2I7XG4gIH1cbn1cbiJdfQ==