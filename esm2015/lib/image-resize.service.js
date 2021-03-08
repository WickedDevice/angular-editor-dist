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
ImageResizeService.ɵprov = i0.ɵɵdefineInjectable({ token: ImageResizeService, factory: ImageResizeService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(ImageResizeService, [{
        type: Injectable
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UtcmVzaXplLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiL2hvbWUvdmljL2Rldi9hbmd1bGFyLWVkaXRvci9wcm9qZWN0cy9hbmd1bGFyLWVkaXRvci9zcmMvIiwic291cmNlcyI6WyJsaWIvaW1hZ2UtcmVzaXplLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFJbkQsTUFBTSxPQUFPLGtCQUFrQjtJQXdCN0I7UUF2QkEsdUJBQWtCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxDQUFDO1lBQ3JELElBQUk7Z0JBQ0YsT0FBTyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzVCO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLENBQUM7YUFDZDtRQUNILENBQUMsRUFBRSxDQUFDLENBQUM7UUFFTCw4QkFBeUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLFdBQVcsSUFBSSxDQUFDO1lBQzdGLElBQUk7Z0JBQ0YsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDO2FBQ3JEO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLENBQUM7YUFDZDtRQUNILENBQUMsRUFBRSxDQUFDLENBQUM7UUFFTCxxQkFBZ0IsR0FBRyxDQUFDLE9BQU8saUJBQWlCLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUzRyxtQkFBYyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQjtZQUNyQyxDQUFDLE9BQU8sVUFBVSxLQUFLLFdBQVcsSUFBSSxPQUFP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USxFQUFFO2dCQUNaLFFBQVEsRUFBRSxDQUFDO2FBQ1o7U0FDRjtJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsT0FBYSxFQUFFLFFBQWdCO1FBQ3JDLE1BQU0sQ0FBQyxHQUFRLE9BQU8sQ0FBQztRQUN2QixDQUFDLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNoQyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUNsQixPQUFhLE9BQU8sQ0FBQztJQUN2QixDQUFDOztvRkEvSlUsa0JBQWtCOzBEQUFsQixrQkFBa0IsV0FBbEIsa0JBQWtCO2tEQUFsQixrQkFBa0I7Y0FEOUIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRE9DVU1FTlQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSW1hZ2VSZXNpemVTZXJ2aWNlIHtcbiAgaGFzQmxvYkNvbnN0cnVjdG9yID0gdHlwZW9mIChCbG9iKSAhPT0gJ3VuZGVmaW5lZCcgJiYgKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEJvb2xlYW4obmV3IEJsb2IoKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSgpKTtcblxuICBoYXNBcnJheUJ1ZmZlclZpZXdTdXBwb3J0ID0gdGhpcy5oYXNCbG9iQ29uc3RydWN0b3IgJiYgdHlwZW9mIChVaW50OEFycmF5KSAhPT0gJ3VuZGVmaW5lZCcgJiYgKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBCbG9iKFtuZXcgVWludDhBcnJheSgxMDApXSkuc2l6ZSA9PT0gMTAwO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0oKSk7XG5cbiAgaGFzVG9CbG9iU3VwcG9ydCA9ICh0eXBlb2YgSFRNTENhbnZhc0VsZW1lbnQgIT09ICd1bmRlZmluZWQnID8gSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLnRvQmxvYiA6IGZhbHNlKTtcblxuICBoYXNCbG9iU3VwcG9ydCA9ICh0aGlzLmhhc1RvQmxvYlN1cHBvcnQgfHxcbiAgICAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGF0b2IgIT09ICd1bmRlZmluZWQnKSk7XG5cbiAgaGFzUmVhZGVyU3VwcG9ydCA9ICh0eXBlb2YgRmlsZVJlYWRlciAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIFVSTCAhPT0gJ3VuZGVmaW5lZCcpO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyB9XG5cbiAgcmVzaXplKGZpbGU6IEZpbGUsIG1heERpbWVuc2lvbnM6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSwgY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIG1heERpbWVuc2lvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxiYWNrID0gbWF4RGltZW5zaW9ucztcbiAgICAgIG1heERpbWVuc2lvbnMgPSB7XG4gICAgICAgIHdpZHRoOiA2NDAsXG4gICAgICAgIGhlaWdodDogNDgwXG4gICAgICB9O1xuICAgIH1cblxuXG4gICAgaWYgKCF0aGlzLmlzU3VwcG9ydGVkKCkgfHwgIWZpbGUudHlwZS5tYXRjaCgvaW1hZ2UuKi8pKSB7XG4gICAgICBjYWxsYmFjayhmaWxlLCBmYWxzZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGZpbGUudHlwZS5tYXRjaCgvaW1hZ2VcXC9naWYvKSkge1xuICAgICAgLy8gTm90IGF0dGVtcHRpbmcsIGNvdWxkIGJlIGFuIGFuaW1hdGVkIGdpZlxuICAgICAgY2FsbGJhY2soZmlsZSwgZmFsc2UpO1xuICAgICAgLy8gVE9ETzogdXNlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRpbWF0dGVyMTUvd2hhbW15IHRvIGNvbnZlcnQgZ2lmIHRvIHdlYm1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgaW1hZ2Uub25sb2FkID0gKGltZ0V2dCkgPT4ge1xuICAgICAgbGV0IHdpZHRoID0gaW1hZ2Uud2lkdGg7XG4gICAgICBsZXQgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgICAgbGV0IGlzVG9vTGFyZ2UgPSBmYWxzZTtcblxuICAgICAgaWYgKHdpZHRoID49IGhlaWdodCAmJiB3aWR0aCA+IG1heERpbWVuc2lvbnMud2lkdGgpIHtcbiAgICAgICAgaXNUb29MYXJnZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGhlaWdodCA+IG1heERpbWVuc2lvbnMuaGVpZ2h0KSB7XG4gICAgICAgIGlzVG9vTGFyZ2UgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzVG9vTGFyZ2UpIHtcbiAgICAgICAgLy8gZWFybHkgZXhpdDsgbm8gbmVlZCB0byByZXNpemVcbiAgICAgICAgY2FsbGJhY2soZmlsZSwgZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNjYWxlUmF0aW8gPSBtYXhEaW1lbnNpb25zLndpZHRoIC8gd2lkdGg7XG5cbiAgICAgIC8vIFRPRE8gbnVtYmVyIG9mIHJlc2FtcGxpbmcgc3RlcHNcbiAgICAgIC8vIGNvbnN0IHN0ZXBzID0gTWF0aC5jZWlsKE1hdGgubG9nKHdpZHRoIC8gKHdpZHRoICogc2NhbGVSYXRpbykpIC8gTWF0aC5sb2coMikpO1xuXG4gICAgICB3aWR0aCAqPSBzY2FsZVJhdGlvO1xuICAgICAgaGVpZ2h0ICo9IHNjYWxlUmF0aW87XG5cbiAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSB0cnVlO1xuICAgICAgKGN0eCBhcyBhbnkpLmltYWdlU21vb3RoaW5nUXVhbGl0eSA9ICdoaWdoJztcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICBpZiAodGhpcy5oYXNUb0Jsb2JTdXBwb3J0KSB7XG4gICAgICAgIGNhbnZhcy50b0Jsb2IoKGJsb2IpID0+IHtcbiAgICAgICAgICBjYWxsYmFjayhibG9iLCB0cnVlKTtcbiAgICAgICAgfSwgZmlsZS50eXBlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGJsb2IgPSB0aGlzLl90b0Jsb2IoY2FudmFzLCBmaWxlLnR5cGUpO1xuICAgICAgICBjYWxsYmFjayhibG9iLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuX2xvYWRJbWFnZShpbWFnZSwgZmlsZSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlzU3VwcG9ydGVkKCkge1xuICAgIHJldHVybiAoXG4gICAgICAodHlwZW9mIChIVE1MQ2FudmFzRWxlbWVudCkgIT09ICd1bmRlZmluZWQnKVxuICAgICAgJiYgdGhpcy5oYXNCbG9iU3VwcG9ydFxuICAgICAgJiYgdGhpcy5oYXNSZWFkZXJTdXBwb3J0XG4gICAgKTtcbiAgfVxuXG4gIF90b0Jsb2IoY2FudmFzLCB0eXBlKSB7XG4gICAgY29uc3QgZGF0YVVSSSA9IGNhbnZhcy50b0RhdGFVUkwodHlwZSk7XG4gICAgY29uc3QgZGF0YVVSSVBhcnRzID0gZGF0YVVSSS5zcGxpdCgnLCcpO1xuICAgIGxldCBieXRlU3RyaW5nO1xuICAgIGlmIChkYXRhVVJJUGFydHNbMF0uaW5kZXhPZignYmFzZTY0JykgPj0gMCkge1xuICAgICAgLy8gQ29udmVydCBiYXNlNjQgdG8gcmF3IGJpbmFyeSBkYXRhIGhlbGQgaW4gYSBzdHJpbmc6XG4gICAgICBieXRlU3RyaW5nID0gYXRvYihkYXRhVVJJUGFydHNbMV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDb252ZXJ0IGJhc2U2NC9VUkxFbmNvZGVkIGRhdGEgY29tcG9uZW50IHRvIHJhdyBiaW5hcnkgZGF0YTpcbiAgICAgIGJ5dGVTdHJpbmcgPSBkZWNvZGVVUklDb21wb25lbnQoZGF0YVVSSVBhcnRzWzFdKTtcbiAgICB9XG4gICAgY29uc3QgYXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZVN0cmluZy5sZW5ndGgpO1xuICAgIGNvbnN0IGludEFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlU3RyaW5nLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpbnRBcnJheVtpXSA9IGJ5dGVTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG5cbiAgICBjb25zdCBtaW1lU3RyaW5nID0gZGF0YVVSSVBhcnRzWzBdLnNwbGl0KCc6JylbMV0uc3BsaXQoJzsnKVswXTtcbiAgICBsZXQgYmxvYiA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5oYXNCbG9iQ29uc3RydWN0b3IpIHtcbiAgICAgIGJsb2IgPSBuZXcgQmxvYihcbiAgICAgICAgW3RoaXMuaGFzQXJyYXlCdWZmZXJWaWV3U3VwcG9ydCA/IGludEFycmF5IDogYXJyYXlCdWZmZXJdLFxuICAgICAgICB7IHR5cGU6IG1pbWVTdHJpbmcgfVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYmxvYiA9IG5ldyBCbG9iKFthcnJheUJ1ZmZlcl0pO1xuICAgIH1cbiAgICByZXR1cm4gYmxvYjtcbiAgfVxuXG4gIF9sb2FkSW1hZ2UoaW1hZ2UsIGZpbGUsIGNhbGxiYWNrPzogYW55KSB7XG4gICAgaWYgKHR5cGVvZiAoVVJMKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICBpbWFnZS5zcmMgPSAoZXZ0LnRhcmdldCBhcyBhbnkpLnJlc3VsdDtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKCk7IH1cbiAgICAgIH07XG4gICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW1hZ2Uuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKTtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF90b0ZpbGUodGhlQmxvYjogQmxvYiwgZmlsZU5hbWU6IHN0cmluZyk6IEZpbGUge1xuICAgIGNvbnN0IGI6IGFueSA9IHRoZUJsb2I7XG4gICAgYi5sYXN0TW9kaWZpZWREYXRlID0gbmV3IERhdGUoKTtcbiAgICBiLm5hbWUgPSBmaWxlTmFtZTtcbiAgICByZXR1cm4gPEZpbGU+dGhlQmxvYjtcbiAgfVxufVxuIl19