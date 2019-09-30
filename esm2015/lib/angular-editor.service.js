/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@angular/common";
/**
 * @record
 */
export function UploadResponse() { }
if (false) {
    /** @type {?} */
    UploadResponse.prototype.imageUrl;
}
export class AngularEditorService {
    /**
     * @param {?} http
     * @param {?} doc
     */
    constructor(http, doc) {
        this.http = http;
        this.doc = doc;
        /**
         * save selection when the editor is focussed out
         */
        this.saveSelection = (/**
         * @return {?}
         */
        () => {
            if (this.doc.getSelection) {
                /** @type {?} */
                const sel = this.doc.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    this.savedSelection = sel.getRangeAt(0);
                    this.selectedText = sel.toString();
                }
            }
            else if (this.doc.getSelection && this.doc.createRange) {
                this.savedSelection = document.createRange();
            }
            else {
                this.savedSelection = null;
            }
        });
    }
    /**
     * Executed command from editor header buttons exclude toggleEditorMode
     * @param {?} command string from triggerCommand
     * @param {?=} param
     * @return {?}
     */
    executeCommand(command, param = null) {
        /** @type {?} */
        const commands = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre'];
        if (commands.includes(command)) {
            this.doc.execCommand('formatBlock', false, command);
            return;
        }
        /** @type {?} */
        const restored = this.restoreSelection();
        this.doc.execCommand(command, false, param);
    }
    /**
     * Create URL link
     * @param {?} url string from UI prompt
     * @return {?}
     */
    createLink(url) {
        if (!url.includes('http')) {
            this.doc.execCommand('createlink', false, url);
        }
        else {
            /** @type {?} */
            const newUrl = '<a href="' + url + '" target="_blank">' + this.selectedText + '</a>';
            this.insertHtml(newUrl);
        }
    }
    /**
     * insert color either font or background
     *
     * @param {?} color color to be inserted
     * @param {?} where where the color has to be inserted either text/background
     * @return {?}
     */
    insertColor(color, where) {
        /** @type {?} */
        const restored = this.restoreSelection();
        if (restored) {
            if (where === 'textColor') {
                this.doc.execCommand('foreColor', false, color);
            }
            else {
                this.doc.execCommand('hiliteColor', false, color);
            }
        }
    }
    /**
     * Set font name
     * @param {?} fontName string
     * @return {?}
     */
    setFontName(fontName) {
        this.doc.execCommand('fontName', false, fontName);
    }
    /**
     * Set font size
     * @param {?} fontSize string
     * @return {?}
     */
    setFontSize(fontSize) {
        this.doc.execCommand('fontSize', false, fontSize);
    }
    /**
     * Create raw HTML
     * @param {?} html HTML string
     * @return {?}
     */
    insertHtml(html) {
        /** @type {?} */
        const isHTMLInserted = this.doc.execCommand('insertHTML', false, html);
        if (!isHTMLInserted) {
            throw new Error('Unable to perform the operation');
        }
    }
    /**
     * restore selection when the editor is focused in
     *
     * saved selection when the editor is focused out
     * @return {?}
     */
    restoreSelection() {
        if (this.savedSelection) {
            if (this.doc.getSelection) {
                /** @type {?} */
                const sel = this.doc.getSelection();
                sel.removeAllRanges();
                sel.addRange(this.savedSelection);
                return true;
            }
            else if (this.doc.getSelection /*&& this.savedSelection.select*/) {
                // this.savedSelection.select();
                return true;
            }
        }
        else {
            return false;
        }
    }
    /**
     * setTimeout used for execute 'saveSelection' method in next event loop iteration
     * @param {?} callbackFn
     * @param {?=} timeout
     * @return {?}
     */
    executeInNextQueueIteration(callbackFn, timeout = 1e2) {
        setTimeout(callbackFn, timeout);
    }
    /**
     * check any selection is made or not
     * @private
     * @return {?}
     */
    checkSelection() {
        /** @type {?} */
        const selectedText = this.savedSelection.toString();
        if (selectedText.length === 0) {
            throw new Error('No Selection Made');
        }
        return true;
    }
    /**
     * Upload file to uploadUrl
     * @param {?} file The file
     * @return {?}
     */
    uploadImage(file) {
        /** @type {?} */
        const uploadData = new FormData();
        uploadData.append('file', file, file.name);
        return this.http.post(this.uploadUrl, uploadData, {
            reportProgress: true,
            observe: 'events',
        });
    }
    /**
     * Insert image with Url
     * @param {?} imageUrl The imageUrl.
     * @return {?}
     */
    insertImage(imageUrl) {
        this.doc.execCommand('insertImage', false, imageUrl);
    }
    /**
     * @param {?} separator
     * @return {?}
     */
    setDefaultParagraphSeparator(separator) {
        this.doc.execCommand('defaultParagraphSeparator', false, separator);
    }
    /**
     * @param {?} customClass
     * @return {?}
     */
    createCustomClass(customClass) {
        /** @type {?} */
        let newTag = this.selectedText;
        if (customClass) {
            /** @type {?} */
            const tagName = customClass.tag ? customClass.tag : 'span';
            newTag = '<' + tagName + ' class="' + customClass.class + '">' + this.selectedText + '</' + tagName + '>';
        }
        this.insertHtml(newTag);
    }
    /**
     * @param {?} videoUrl
     * @return {?}
     */
    insertVideo(videoUrl) {
        if (videoUrl.match('www.youtube.com')) {
            this.insertYouTubeVideoTag(videoUrl);
        }
        if (videoUrl.match('vimeo.com')) {
            this.insertVimeoVideoTag(videoUrl);
        }
    }
    /**
     * @private
     * @param {?} videoUrl
     * @return {?}
     */
    insertYouTubeVideoTag(videoUrl) {
        /** @type {?} */
        const id = videoUrl.split('v=')[1];
        /** @type {?} */
        const imageUrl = `https://img.youtube.com/vi/${id}/0.jpg`;
        /** @type {?} */
        const thumbnail = `
      <div style='position: relative'>
        <img style='position: absolute; left:200px; top:140px'
             src="https://img.icons8.com/color/96/000000/youtube-play.png"/>
        <a href='${videoUrl}' target='_blank'>
          <img src="${imageUrl}" alt="click to watch"/>
        </a>
      </div>`;
        this.insertHtml(thumbnail);
    }
    /**
     * @private
     * @param {?} videoUrl
     * @return {?}
     */
    insertVimeoVideoTag(videoUrl) {
        /** @type {?} */
        const sub = this.http.get(`https://vimeo.com/api/oembed.json?url=${videoUrl}`).subscribe((/**
         * @param {?} data
         * @return {?}
         */
        data => {
            /** @type {?} */
            const imageUrl = data.thumbnail_url_with_play_button;
            /** @type {?} */
            const thumbnail = `<div>
        <a href='${videoUrl}' target='_blank'>
          <img src="${imageUrl}" alt="${data.title}"/>
        </a>
      </div>`;
            this.insertHtml(thumbnail);
            sub.unsubscribe();
        }));
    }
    /**
     * @param {?} node
     * @return {?}
     */
    nextNode(node) {
        if (node.hasChildNodes()) {
            return node.firstChild;
        }
        else {
            while (node && !node.nextSibling) {
                node = node.parentNode;
            }
            if (!node) {
                return null;
            }
            return node.nextSibling;
        }
    }
    /**
     * @param {?} range
     * @param {?} includePartiallySelectedContainers
     * @return {?}
     */
    getRangeSelectedNodes(range, includePartiallySelectedContainers) {
        /** @type {?} */
        let node = range.startContainer;
        /** @type {?} */
        const endNode = range.endContainer;
        /** @type {?} */
        let rangeNodes = [];
        // Special case for a range that is contained within a single node
        if (node === endNode) {
            rangeNodes = [node];
        }
        else {
            // Iterate nodes until we hit the end container
            while (node && node !== endNode) {
                rangeNodes.push(node = this.nextNode(node));
            }
            // Add partially selected nodes at the start of the range
            node = range.startContainer;
            while (node && node !== range.commonAncestorContainer) {
                rangeNodes.unshift(node);
                node = node.parentNode;
            }
        }
        // Add ancestors of the range container, if required
        if (includePartiallySelectedContainers) {
            node = range.commonAncestorContainer;
            while (node) {
                rangeNodes.push(node);
                node = node.parentNode;
            }
        }
        return rangeNodes;
    }
    /**
     * @return {?}
     */
    getSelectedNodes() {
        /** @type {?} */
        const nodes = [];
        if (this.doc.getSelection) {
            /** @type {?} */
            const sel = this.doc.getSelection();
            for (let i = 0, len = sel.rangeCount; i < len; ++i) {
                nodes.push.apply(nodes, this.getRangeSelectedNodes(sel.getRangeAt(i), true));
            }
        }
        return nodes;
    }
    /**
     * @param {?} el
     * @return {?}
     */
    replaceWithOwnChildren(el) {
        /** @type {?} */
        const parent = el.parentNode;
        while (el.hasChildNodes()) {
            parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
    }
    /**
     * @param {?} tagNames
     * @return {?}
     */
    removeSelectedElements(tagNames) {
        /** @type {?} */
        const tagNamesArray = tagNames.toLowerCase().split(',');
        this.getSelectedNodes().forEach((/**
         * @param {?} node
         * @return {?}
         */
        (node) => {
            if (node.nodeType === 1 &&
                tagNamesArray.indexOf(node.tagName.toLowerCase()) > -1) {
                // Remove the node and replace it with its children
                this.replaceWithOwnChildren(node);
            }
        }));
    }
}
AngularEditorService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
AngularEditorService.ctorParameters = () => [
    { type: HttpClient },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
/** @nocollapse */ AngularEditorService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function AngularEditorService_Factory() { return new AngularEditorService(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(i2.DOCUMENT)); }, token: AngularEditorService, providedIn: "root" });
if (false) {
    /** @type {?} */
    AngularEditorService.prototype.savedSelection;
    /** @type {?} */
    AngularEditorService.prototype.selectedText;
    /** @type {?} */
    AngularEditorService.prototype.uploadUrl;
    /**
     * save selection when the editor is focussed out
     * @type {?}
     */
    AngularEditorService.prototype.saveSelection;
    /**
     * @type {?}
     * @private
     */
    AngularEditorService.prototype.http;
    /**
     * @type {?}
     * @private
     */
    AngularEditorService.prototype.doc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1lZGl0b3Iuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Brb2xrb3YvYW5ndWxhci1lZGl0b3IvIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci1lZGl0b3Iuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLFVBQVUsRUFBWSxNQUFNLHNCQUFzQixDQUFDO0FBRTNELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7OztBQUd6QyxvQ0FFQzs7O0lBREMsa0NBQWlCOztBQU1uQixNQUFNLE9BQU8sb0JBQW9COzs7OztJQU0vQixZQUNVLElBQWdCLEVBQ0UsR0FBUTtRQUQxQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ0UsUUFBRyxHQUFILEdBQUcsQ0FBSzs7OztRQStFN0Isa0JBQWE7OztRQUFHLEdBQVMsRUFBRTtZQUNoQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFOztzQkFDbkIsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFO2dCQUNuQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRTtvQkFDcEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDcEM7YUFDRjtpQkFBTSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO2dCQUN4RCxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUM5QztpQkFBTTtnQkFDTCxJQUFJLENBQUMsY0FBYyxHQUFHLElB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UUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDdkQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsT0FBTzs7OztRQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDdkMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUM7Z0JBQ3JCLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUN4RCxtREFBbUQ7Z0JBQ25ELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNuQztRQUNILENBQUMsRUFBQyxDQUFDO0lBQ0wsQ0FBQzs7O1lBcFNGLFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQjs7OztZQVhPLFVBQVU7NENBb0JiLE1BQU0sU0FBQyxRQUFROzs7OztJQU5sQiw4Q0FBNkI7O0lBQzdCLDRDQUFxQjs7SUFDckIseUNBQWtCOzs7OztJQW1GbEIsNkNBWUM7Ozs7O0lBNUZDLG9DQUF3Qjs7Ozs7SUFDeEIsbUNBQWtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtIdHRwQ2xpZW50LCBIdHRwRXZlbnR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtDdXN0b21DbGFzc30gZnJvbSAnLi9jb25maWcnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZFJlc3BvbnNlIHtcbiAgaW1hZ2VVcmw6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhckVkaXRvclNlcnZpY2Uge1xuXG4gIHNhdmVkU2VsZWN0aW9uOiBSYW5nZSB8IG51bGw7XG4gIHNlbGVjdGVkVGV4dDogc3RyaW5nO1xuICB1cGxvYWRVcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2M6IGFueVxuICApIHsgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlZCBjb21tYW5kIGZyb20gZWRpdG9yIGhlYWRlciBidXR0b25zIGV4Y2x1ZGUgdG9nZ2xlRWRpdG9yTW9kZVxuICAgKiBAcGFyYW0gY29tbWFuZCBzdHJpbmcgZnJvbSB0cmlnZ2VyQ29tbWFuZFxuICAgKi9cbiAgZXhlY3V0ZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBwYXJhbTogc3RyaW5nID0gbnVsbCkge1xuICAgIGNvbnN0IGNvbW1hbmRzID0gWydoMScsICdoMicsICdoMycsICdoNCcsICdoNScsICdoNicsICdwJywgJ3ByZSddO1xuICAgIGlmIChjb21tYW5kcy5pbmNsdWRlcyhjb21tYW5kKSkge1xuICAgICAgdGhpcy5kb2MuZXhlY0NvbW1hbmQoJ2Zvcm1hdEJsb2NrJywgZmFsc2UsIGNvbW1hbmQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXN0b3JlZCA9IHRoaXMucmVzdG9yZVNlbGVjdGlvbigpOyAgLy8gISEhIFRFU1QgISEhIEpDTlxuICAgIHRoaXMuZG9jLmV4ZWNDb21tYW5kKGNvbW1hbmQsIGZhbHNlLCBwYXJhbSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIFVSTCBsaW5rXG4gICAqIEBwYXJhbSB1cmwgc3RyaW5nIGZyb20gVUkgcHJvbXB0XG4gICAqL1xuICBjcmVhdGVMaW5rKHVybDogc3RyaW5nKSB7XG4gICAgaWYgKCF1cmwuaW5jbHVkZXMoJ2h0dHAnKSkge1xuICAgICAgdGhpcy5kb2MuZXhlY0NvbW1hbmQoJ2NyZWF0ZWxpbmsnLCBmYWxzZSwgdXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbmV3VXJsID0gJzxhIGhyZWY9XCInICsgdXJsICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyB0aGlzLnNlbGVjdGVkVGV4dCArICc8L2E+JztcbiAgICAgIHRoaXMuaW5zZXJ0SHRtbChuZXdVcmwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBpbnNlcnQgY29sb3IgZWl0aGVyIGZvbnQgb3IgYmFja2dyb3VuZFxuICAgKlxuICAgKiBAcGFyYW0gY29sb3IgY29sb3IgdG8gYmUgaW5zZXJ0ZWRcbiAgICogQHBhcmFtIHdoZXJlIHdoZXJlIHRoZSBjb2xvciBoYXMgdG8gYmUgaW5zZXJ0ZWQgZWl0aGVyIHRleHQvYmFja2dyb3VuZFxuICAgKi9cbiAgaW5zZXJ0Q29sb3IoY29sb3I6IHN0cmluZywgd2hlcmU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHJlc3RvcmVkID0gdGhpcy5yZXN0b3JlU2VsZWN0aW9uKCk7XG4gICAgaWYgKHJlc3RvcmVkKSB7XG4gICAgICBpZiAod2hlcmUgPT09ICd0ZXh0Q29sb3InKSB7XG4gICAgICAgIHRoaXMuZG9jLmV4ZWNDb21tYW5kKCdmb3JlQ29sb3InLCBmYWxzZSwgY29sb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kb2MuZXhlY0NvbW1hbmQoJ2hpbGl0ZUNvbG9yJywgZmFsc2UsIGNvbG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IGZvbnQgbmFtZVxuICAgKiBAcGFyYW0gZm9udE5hbWUgc3RyaW5nXG4gICAqL1xuICBzZXRGb250TmFtZShmb250TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5kb2MuZXhlY0NvbW1hbmQoJ2ZvbnROYW1lJywgZmFsc2UsIGZvbnROYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZm9udCBzaXplXG4gICAqIEBwYXJhbSBmb250U2l6ZSBzdHJpbmdcbiAgICovXG4gIHNldEZvbnRTaXplKGZvbnRTaXplOiBzdHJpbmcpIHtcbiAgICB0aGlzLmRvYy5leGVjQ29tbWFuZCgnZm9udFNpemUnLCBmYWxzZSwgZm9udFNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSByYXcgSFRNTFxuICAgKiBAcGFyYW0gaHRtbCBIVE1MIHN0cmluZ1xuICAgKi9cbiAgaW5zZXJ0SHRtbChodG1sOiBzdHJpbmcpOiB2b2lkIHtcblxuICAgIGNvbnN0IGlzSFRNTEluc2VydGVkID0gdGhpcy5kb2MuZXhlY0NvbW1hbmQoJ2luc2VydEhUTUwnLCBmYWxzZSwgaHRtbCk7XG5cbiAgICBpZiAoIWlzSFRNTEluc2VydGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBwZXJmb3JtIHRoZSBvcGVyYXRpb24nKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2F2ZSBzZWxlY3Rpb24gd2hlbiB0aGUgZWRpdG9yIGlzIGZvY3Vzc2VkIG91dFxuICAgKi9cbiAgcHVibGljIHNhdmVTZWxlY3Rpb24gPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbikge1xuICAgICAgY29uc3Qgc2VsID0gdGhpcy5kb2MuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICBpZiAoc2VsLmdldFJhbmdlQXQgJiYgc2VsLnJhbmdlQ291bnQpIHtcbiAgICAgICAgdGhpcy5zYXZlZFNlbGVjdGlvbiA9IHNlbC5nZXRSYW5nZUF0KDApO1xuICAgICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9IHNlbC50b1N0cmluZygpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5kb2MuZ2V0U2VsZWN0aW9uICYmIHRoaXMuZG9jLmNyZWF0ZVJhbmdlKSB7XG4gICAgICB0aGlzLnNhdmVkU2VsZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zYXZlZFNlbGVjdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHJlc3RvcmUgc2VsZWN0aW9uIHdoZW4gdGhlIGVkaXRvciBpcyBmb2N1c2VkIGluXG4gICAqXG4gICAqIHNhdmVkIHNlbGVjdGlvbiB3aGVuIHRoZSBlZGl0b3IgaXMgZm9jdXNlZCBvdXRcbiAgICovXG4gIHJlc3RvcmVTZWxlY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuc2F2ZWRTZWxlY3Rpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvYy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgY29uc3Qgc2VsID0gdGhpcy5kb2MuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgc2VsLmFkZFJhbmdlKHRoaXMuc2F2ZWRTZWxlY3Rpb24pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5kb2MuZ2V0U2VsZWN0aW9uIC8qJiYgdGhpcy5zYXZlZFNlbGVjdGlvbi5zZWxlY3QqLykge1xuICAgICAgICAvLyB0aGlzLnNhdmVkU2VsZWN0aW9uLnNlbGVjdCgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBzZXRUaW1lb3V0IHVzZWQgZm9yIGV4ZWN1dGUgJ3NhdmVTZWxlY3Rpb24nIG1ldGhvZCBpbiBuZXh0IGV2ZW50IGxvb3AgaXRlcmF0aW9uXG4gICAqL1xuICBwdWJsaWMgZXhlY3V0ZUluTmV4dFF1ZXVlSXRlcmF0aW9uKGNhbGxiYWNrRm46ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55LCB0aW1lb3V0ID0gMWUyKTogdm9pZCB7XG4gICAgc2V0VGltZW91dChjYWxsYmFja0ZuLCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8qKiBjaGVjayBhbnkgc2VsZWN0aW9uIGlzIG1hZGUgb3Igbm90ICovXG4gIHByaXZhdGUgY2hlY2tTZWxlY3Rpb24oKTogYW55IHtcblxuICAgIGNvbnN0IHNlbGVjdGVkVGV4dCA9IHRoaXMuc2F2ZWRTZWxlY3Rpb24udG9TdHJpbmcoKTtcblxuICAgIGlmIChzZWxlY3RlZFRleHQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIFNlbGVjdGlvbiBNYWRlJyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwbG9hZCBmaWxlIHRvIHVwbG9hZFVybFxuICAgKiBAcGFyYW0gZmlsZSBUaGUgZmlsZVxuICAgKi9cbiAgdXBsb2FkSW1hZ2UoZmlsZTogRmlsZSk6IE9ic2VydmFibGU8SHR0cEV2ZW50PFVwbG9hZFJlc3BvbnNlPj4ge1xuXG4gICAgY29uc3QgdXBsb2FkRGF0YTogRm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgIHVwbG9hZERhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSwgZmlsZS5uYW1lKTtcblxuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxVcGxvYWRSZXNwb25zZT4odGhpcy51cGxvYWRVcmwsIHVwbG9hZERhdGEsIHtcbiAgICAgIHJlcG9ydFByb2dyZXNzOiB0cnVlLFxuICAgICAgb2JzZXJ2ZTogJ2V2ZW50cycsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGltYWdlIHdpdGggVXJsXG4gICAqIEBwYXJhbSBpbWFnZVVybCBUaGUgaW1hZ2VVcmwuXG4gICAqL1xuICBpbnNlcnRJbWFnZShpbWFnZVVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5kb2MuZXhlY0NvbW1hbmQoJ2luc2VydEltYWdlJywgZmFsc2UsIGltYWdlVXJsKTtcbiAgfVxuXG4gIHNldERlZmF1bHRQYXJhZ3JhcGhTZXBhcmF0b3Ioc2VwYXJhdG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLmRvYy5leGVjQ29tbWFuZCgnZGVmYXVsdFBhcmFncmFwaFNlcGFyYXRvcicsIGZhbHNlLCBzZXBhcmF0b3IpO1xuICB9XG5cbiAgY3JlYXRlQ3VzdG9tQ2xhc3MoY3VzdG9tQ2xhc3M6IEN1c3RvbUNsYXNzKSB7XG4gICAgbGV0IG5ld1RhZyA9IHRoaXMuc2VsZWN0ZWRUZXh0O1xuICAgIGlmIChjdXN0b21DbGFzcykge1xuICAgICAgY29uc3QgdGFnTmFtZSA9IGN1c3RvbUNsYXNzLnRhZyA/IGN1c3RvbUNsYXNzLnRhZyA6ICdzcGFuJztcbiAgICAgIG5ld1RhZyA9ICc8JyArIHRhZ05hbWUgKyAnIGNsYXNzPVwiJyArIGN1c3RvbUNsYXNzLmNsYXNzICsgJ1wiPicgKyB0aGlzLnNlbGVjdGVkVGV4dCArICc8LycgKyB0YWdOYW1lICsgJz4nO1xuICAgIH1cbiAgICB0aGlzLmluc2VydEh0bWwobmV3VGFnKTtcbiAgfVxuXG4gIGluc2VydFZpZGVvKHZpZGVvVXJsOiBzdHJpbmcpIHtcbiAgICBpZiAodmlkZW9VcmwubWF0Y2goJ3d3dy55b3V0dWJlLmNvbScpKSB7XG4gICAgICB0aGlzLmluc2VydFlvdVR1YmVWaWRlb1RhZyh2aWRlb1VybCk7XG4gICAgfVxuICAgIGlmICh2aWRlb1VybC5tYXRjaCgndmltZW8uY29tJykpIHtcbiAgICAgIHRoaXMuaW5zZXJ0VmltZW9WaWRlb1RhZyh2aWRlb1VybCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbnNlcnRZb3VUdWJlVmlkZW9UYWcodmlkZW9Vcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGlkID0gdmlkZW9Vcmwuc3BsaXQoJ3Y9JylbMV07XG4gICAgY29uc3QgaW1hZ2VVcmwgPSBgaHR0cHM6Ly9pbWcueW91dHViZS5jb20vdmkvJHtpZH0vMC5qcGdgO1xuICAgIGNvbnN0IHRodW1ibmFpbCA9IGBcbiAgICAgIDxkaXYgc3R5bGU9J3Bvc2l0aW9uOiByZWxhdGl2ZSc+XG4gICAgICAgIDxpbWcgc3R5bGU9J3Bvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDoyMDBweDsgdG9wOjE0MHB4J1xuICAgICAgICAgICAgIHNyYz1cImh0dHBzOi8vaW1nLmljb25zOC5jb20vY29sb3IvOTYvMDAwMDAwL3lvdXR1YmUtcGxheS5wbmdcIi8+XG4gICAgICAgIDxhIGhyZWY9JyR7dmlkZW9Vcmx9JyB0YXJnZXQ9J19ibGFuayc+XG4gICAgICAgICAgPGltZyBzcmM9XCIke2ltYWdlVXJsfVwiIGFsdD1cImNsaWNrIHRvIHdhdGNoXCIvPlxuICAgICAgICA8L2E+XG4gICAgICA8L2Rpdj5gO1xuICAgIHRoaXMuaW5zZXJ0SHRtbCh0aHVtYm5haWwpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnNlcnRWaW1lb1ZpZGVvVGFnKHZpZGVvVXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLmh0dHAuZ2V0PGFueT4oYGh0dHBzOi8vdmltZW8uY29tL2FwaS9vZW1iZWQuanNvbj91cmw9JHt2aWRlb1VybH1gKS5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICBjb25zdCBpbWFnZVVybCA9IGRhdGEudGh1bWJuYWlsX3VybF93aXRoX3BsYXlfYnV0dG9uO1xuICAgICAgY29uc3QgdGh1bWJuYWlsID0gYDxkaXY+XG4gICAgICAgIDxhIGhyZWY9JyR7dmlkZW9Vcmx9JyB0YXJnZXQ9J19ibGFuayc+XG4gICAgICAgICAgPGltZyBzcmM9XCIke2ltYWdlVXJsfVwiIGFsdD1cIiR7ZGF0YS50aXRsZX1cIi8+XG4gICAgICAgIDwvYT5cbiAgICAgIDwvZGl2PmA7XG4gICAgICB0aGlzLmluc2VydEh0bWwodGh1bWJuYWlsKTtcbiAgICAgIHN1Yi51bnN1YnNjcmliZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgbmV4dE5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgcmV0dXJuIG5vZGUuZmlyc3RDaGlsZDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKG5vZGUgJiYgIW5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgIH1cbiAgICAgIGlmICghbm9kZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlU2VsZWN0ZWROb2RlcyhyYW5nZSwgaW5jbHVkZVBhcnRpYWxseVNlbGVjdGVkQ29udGFpbmVycykge1xuICAgIGxldCBub2RlID0gcmFuZ2Uuc3RhcnRDb250YWluZXI7XG4gICAgY29uc3QgZW5kTm9kZSA9IHJhbmdlLmVuZENvbnRhaW5lcjtcbiAgICBsZXQgcmFuZ2VOb2RlcyA9IFtdO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBhIHJhbmdlIHRoYXQgaXMgY29udGFpbmVkIHdpdGhpbiBhIHNpbmdsZSBub2RlXG4gICAgaWYgKG5vZGUgPT09IGVuZE5vZGUpIHtcbiAgICAgIHJhbmdlTm9kZXMgPSBbbm9kZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEl0ZXJhdGUgbm9kZXMgdW50aWwgd2UgaGl0IHRoZSBlbmQgY29udGFpbmVyXG4gICAgICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSBlbmROb2RlKSB7XG4gICAgICAgIHJhbmdlTm9kZXMucHVzaCggbm9kZSA9IHRoaXMubmV4dE5vZGUobm9kZSkgKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHBhcnRpYWxseSBzZWxlY3RlZCBub2RlcyBhdCB0aGUgc3RhcnQgb2YgdGhlIHJhbmdlXG4gICAgICBub2RlID0gcmFuZ2Uuc3RhcnRDb250YWluZXI7XG4gICAgICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSByYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcikge1xuICAgICAgICByYW5nZU5vZGVzLnVuc2hpZnQobm9kZSk7XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGFuY2VzdG9ycyBvZiB0aGUgcmFuZ2UgY29udGFpbmVyLCBpZiByZXF1aXJlZFxuICAgIGlmIChpbmNsdWRlUGFydGlhbGx5U2VsZWN0ZWRDb250YWluZXJzKSB7XG4gICAgICBub2RlID0gcmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXI7XG4gICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICByYW5nZU5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlTm9kZXM7XG4gIH1cblxuICBnZXRTZWxlY3RlZE5vZGVzKCkge1xuICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbikge1xuICAgICAgY29uc3Qgc2VsID0gdGhpcy5kb2MuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gc2VsLnJhbmdlQ291bnQ7IGkgPCBsZW47ICsraSkge1xuICAgICAgICBub2Rlcy5wdXNoLmFwcGx5KG5vZGVzLCB0aGlzLmdldFJhbmdlU2VsZWN0ZWROb2RlcyhzZWwuZ2V0UmFuZ2VBdChpKSwgdHJ1ZSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICByZXBsYWNlV2l0aE93bkNoaWxkcmVuKGVsKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICB3aGlsZSAoZWwuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLmZpcnN0Q2hpbGQsIGVsKTtcbiAgICB9XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKGVsKTtcbiAgfVxuXG4gIHJlbW92ZVNlbGVjdGVkRWxlbWVudHModGFnTmFtZXMpIHtcbiAgICBjb25zdCB0YWdOYW1lc0FycmF5ID0gdGFnTmFtZXMudG9Mb3dlckNhc2UoKS5zcGxpdCgnLCcpO1xuICAgIHRoaXMuZ2V0U2VsZWN0ZWROb2RlcygpLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxICYmXG4gICAgICAgIHRhZ05hbWVzQXJyYXkuaW5kZXhPZihub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSkgPiAtMSkge1xuICAgICAgICAvLyBSZW1vdmUgdGhlIG5vZGUgYW5kIHJlcGxhY2UgaXQgd2l0aCBpdHMgY2hpbGRyZW5cbiAgICAgICAgdGhpcy5yZXBsYWNlV2l0aE93bkNoaWxkcmVuKG5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=