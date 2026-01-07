import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { v4 as uuid } from 'uuid';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class AngularEditorService {
    constructor(http, doc) {
        this.http = http;
        this.doc = doc;
        /**
         * save selection when the editor is focussed out
         */
        this.saveSelection = (el) => {
            if (!this.elementContainsSelection(el.nativeElement)) {
                return; // do not save browser selections that are outside the editor
            }
            if (this.doc.getSelection) {
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
        };
    }
    /**
     * Executed command from editor header buttons exclude toggleEditorMode
     * @param command string from triggerCommand
     */
    executeCommand(command, param = null) {
        const commands = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre'];
        if (commands.includes(command)) {
            this.editCmd('formatBlock', command);
            return;
        }
        this.editCmd(command, param);
    }
    editCmd(cmd, param) {
        // console.log(`executeCommand: ${command} ${param}`);
        this.restoreSelection(); // Prevent lost focus issues --JCN
        // console.log('restoring selection');
        return !!this.doc.execCommand(cmd, false, param);
    }
    /**
     * Create URL link
     * @param url string from UI prompt
     */
    createLink(url) {
        if (!url.includes('http')) {
            this.editCmd('createlink', url);
        }
        else {
            const newUrl = '<a href="' + url + '" target="_blank">' + this.selectedText + '</a>';
            this.insertHtml(newUrl);
        }
    }
    /**
     * insert color either font or background
     *
     * @param color color to be inserted
     * @param where where the color has to be inserted either text/background
     */
    insertColor(color, where) {
        const restored = this.restoreSelection();
        if (restored) {
            if (where === 'textColor') {
                this.editCmd('foreColor', color);
            }
            else {
                this.editCmd('hiliteColor', color);
            }
        }
    }
    /**
     * Set font name
     * @param fontName string
     */
    setFontName(fontName) {
        this.editCmd('fontName', fontName);
    }
    /**
     * Set font size
     * @param fontSize string
     */
    setFontSize(fontSize) {
        this.editCmd('fontSize', fontSize);
    }
    /**
     * Create raw HTML
     * @param html HTML string
     */
    insertHtml(html) {
        if (typeof html === 'string') {
            // you can pass html in as a string, but no guarantees that insertHTML won't mutilate it
            // if you want to guarantee the DOM structure, pass it in as a built HTMLElement
            let isHTMLInserted = this.editCmd('insertHTML', html);
            if (!isHTMLInserted) {
                // retry...sometimes its needed
                isHTMLInserted = this.editCmd('insertHTML', html);
                if (!isHTMLInserted) {
                    throw new Error('Unable to perform the operation');
                }
            }
        }
        else if (typeof html === 'object') {
            // see https://stackoverflow.com/questions/25941559/is-there-a-way-to-keep-execcommandinserthtml-from-removing-attributes-in-chr
            // this case is assumed to receive html as a proper HTMLElement
            // if the existing selection is not collapsed, delete it
            this.editCmd('delete', '');
            let sel;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    const range = sel.getRangeAt(0);
                    range.collapse(true);
                    range.insertNode(html);
                    // Move the caret immediately after the inserted span
                    range.setStartAfter(html);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
    }
    elementContainsSelection(el) {
        if (!el) {
            return false;
        }
        const view = this.doc.defaultView;
        const sel = view.getSelection();
        if (sel && sel.rangeCount > 0) {
            return this.isOrContainsDomElem(sel.getRangeAt(0).commonAncestorContainer, el);
        }
        return false;
    }
    isOrContainsDomElem(node, container) {
        while (node) {
            if (node === container) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }
    /**
     * restore selection when the editor is focused in
     *
     * saved selection when the editor is focused out
     */
    restoreSelection() {
        if (this.savedSelection) {
            if (this.doc.getSelection) {
                // console.log(`***Restoring selection : ${this.savedSelection.startContainer.nodeName} ${this.savedSelection.endContainer.nodeName}`);
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
     */
    executeInNextQueueIteration(callbackFn, timeout = 1e2) {
        setTimeout(callbackFn, timeout);
    }
    /** check any selection is made or not */
    checkSelection() {
        const selectedText = this.savedSelection.toString();
        if (selectedText.length === 0) {
            throw new Error('No Selection Made');
        }
        return true;
    }
    /**
     * Upload file to uploadUrl
     * @param file The file
     */
    uploadImage(file) {
        const uploadData = new FormData();
        uploadData.append('file', file, file.name);
        return this.http.post(this.uploadUrl, uploadData, {
            reportProgress: true,
            observe: 'events',
            withCredentials: this.uploadWithCredentials,
        });
    }
    /**
     * Insert image with Url
     * @param imageUrl The imageUrl.
     */
    insertImage(imageUrl) {
        const id = uuid();
        const div = `
    <figure id=${id} style="text-align:center" contenteditable="false" >
    <img src="${imageUrl}"   style="margin:0 auto">
    </figure>
    <br>
    `;
        this.insertHtml(div);
        // this.doc.getElementById(`close-${id}`).addEventListener('click', () => {
        //   const ele = this.doc.getElementById(id);
        //   if (ele) {
        //     ele.remove();
        //   }
        // })
    }
    setDefaultParagraphSeparator(separator) {
        this.editCmd('defaultParagraphSeparator', separator);
    }
    createCustomClass(customClass) {
        let newTag = this.selectedText;
        if (customClass) {
            const tagName = customClass.tag ? customClass.tag : 'span';
            newTag = '<' + tagName + ' class="' + customClass.class + '">' + this.selectedText + '</' + tagName + '>';
        }
        this.insertHtml(newTag);
    }
    insertVideo(videoUrl) {
        if (videoUrl.match('www.youtube.com')) {
            this.insertYouTubeVideoTag(videoUrl);
        }
        if (videoUrl.match('vimeo.com')) {
            this.insertVimeoVideoTag(videoUrl);
        }
    }
    insertArbitraryHtml(html) {
        this.insertHtml(html);
    }
    insertYouTubeVideoTag(videoUrl) {
        const id = videoUrl.split('v=')[1];
        const thumbnail = `
    <iframe width="560" height="315"
    src="https://www.youtube.com/embed/${id}"
    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
    <br>
    `;
        this.insertHtml(thumbnail);
    }
    insertVimeoVideoTag(videoUrl) {
        const id = videoUrl.split('.com/')[1];
        const thumbnail = `<iframe src="https://player.vimeo.com/video/${id}"
    width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" all owfullscreen></iframe>
    <br>`;
        // const sub = this.http.get<any>(`https://vimeo.com/api/oembed.json?url=${videoUrl}`).subscribe(data => {
        //   const imageUrl = data.thumbnail_url_with_play_button;
        //   const thumbnail = `
        //   <iframe width="560" height="315"
        //   src="https://www.youtube.com/embed/${id}"
        //   frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        //   allowfullscreen></iframe>
        //   `;
        //   this.insertHtml(thumbnail);
        //   sub.unsubscribe();
        // });
        this.insertHtml(thumbnail);
    }
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
    getRangeSelectedNodes(range, includePartiallySelectedContainers) {
        let node = range.startContainer;
        const endNode = range.endContainer;
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
    getSelectedNodes() {
        const nodes = [];
        if (this.doc.getSelection) {
            const sel = this.doc.getSelection();
            for (let i = 0, len = sel.rangeCount; i < len; ++i) {
                nodes.push.apply(nodes, this.getRangeSelectedNodes(sel.getRangeAt(i), true));
            }
        }
        return nodes;
    }
    replaceWithOwnChildren(el) {
        const parent = el.parentNode;
        while (el.hasChildNodes()) {
            parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
    }
    removeSelectedElements(tagNames) {
        const tagNamesArray = tagNames.toLowerCase().split(',');
        this.getSelectedNodes().forEach((node) => {
            if (node.nodeType === 1 &&
                tagNamesArray.indexOf(node.tagName.toLowerCase()) > -1) {
                // Remove the node and replace it with its children
                this.replaceWithOwnChildren(node);
            }
        });
    }
}
AngularEditorService.ɵfac = function AngularEditorService_Factory(t) { return new (t || AngularEditorService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(DOCUMENT)); };
AngularEditorService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AngularEditorService, factory: AngularEditorService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AngularEditorService, [{
        type: Injectable
    }], function () { return [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1lZGl0b3Iuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItZWRpdG9yL3NyYy9saWIvYW5ndWxhci1lZGl0b3Iuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUcvRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFM0MsT0FBTyxFQUFFLEVBQUUsSUFBSSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7OztBQU1sQyxNQUFNLE9BQU8sb0JBQW9CO0lBTy9CLFlBQ1UsSUFBZ0IsRUFDRSxHQUFRO1FBRDFCLFNBQUksR0FBSixJQUFJLENBQVk7UUFDRSxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBOEdwQzs7V0FFRztRQUNJLGtCQUFhLEdBQUcsQ0FBQyxFQUFjLEVBQVEsRUFBRTtZQUU5QyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDcEQsT0FBTyxDQUFDLDZEQUE2RDthQUN0RTtZQUNELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3pCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3BDLElBQUksR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFO29CQUNwQyxJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUNwQzthQUNGO2lCQUFNLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3hELElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzlDO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1FBQ0gsQ0FBQyxDQUFBO0lBaElHLENBQUM7SUFFTDs7O09BR0c7SUFDSCxjQUFjLENBQUMsT0FBZSxFQUFFLFFBQWdCLElBQUk7UUFDbEQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEUsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLE9BQU87U0FDUjtRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBVyxFQUFFLEtBQWE7UUFDaEMsc0RBQXNEO1FBQ3RELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUUsa0NBQWtDO1FBQzVELHNDQUFzQztRQUN0QyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRDs7O09BR0c7SUFDSCxVQUFVLENBQUMsR0FBVztRQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNqQzthQUFNO1lBQ0wsTUFBTSxNQUFNLEdBQUcsV0FBVyxHQUFHLEdBQUcsR0FBRyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztZQUNyRixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsV0FBVyxDQUFDLEtBQWEsRUFBRSxLQUFhO1FBQ3RDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3pDLElBQUksUUFBUSxFQUFFO1lBQ1osSUFBSSxLQUFLLEtBQUssV0FBVyxFQUFFO2dCQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNsQztpQkFBTTtnQkFDTCxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNwQztTQUNGO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILFdBQVcsQ0FBQyxRQUFnQjtRQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsV0FBVyxDQUFDLFFBQWdCO1FBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxVQUFVLENBQUMsSUFBUztRQUNsQixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUM1Qix3RkFBd0Y7WUFDeEYsZ0ZBQWdGO1lBQ2hGLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXRELElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ25CLCtCQUErQjtnQkFDL0IsY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsY0FBYyxFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7aUJBQ3BEO2FBQ0Y7U0FDRjthQUFNLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQ25DLGdJQUFnSTtZQUNoSSwrREFBK0Q7WUFDL0Qsd0RBQXdEO1lBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNCLElBQUksR0FBRyxDQUFDO1lBQ1IsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFO2dCQUN2QixHQUFHLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUM1QixJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUU7b0JBQ2xCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXJCLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXZCLHFEQUFxRDtvQkFDckQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDMUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDckIsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUN0QixHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNyQjthQUNGO1NBQ0Y7SUFDSCxDQUFDO0lBdUJELHdCQUF3QixDQUFDLEVBQUU7UUFDekIsSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUNQLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUNsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFaEMsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUU7WUFDN0IsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELG1CQUFtQixDQUFDLElBQUksRUFBRSxTQUFTO1FBQ2pDLE9BQU8sSUFBSSxFQUFFO1lBQ1gsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUN0QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDeEI7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZ0JBQWdCO1FBQ2QsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3ZCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3pCLHVJQUF1STtnQkFDdkksTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDcEMsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN0QixHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxJQUFJLENBQUM7YUFDYjtpQkFBTSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGlDQUFpQyxFQUFFO2dCQUNsRSxnQ0FBZ0M7Z0JBQ2hDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjthQUFNO1lBQ0wsT0FBTyxLQUFLLENBQUM7U0FDZDtJQUNILENBQUM7SUFFRDs7T0FFRztJQUNJLDJCQUEyQixDQUFDLFVBQW1DLEVBQUUsT0FBTyxHQUFHLEdBQUc7UUFDbkYsVUFBVSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQseUNBQXlDO0lBQ2pDLGNBQWM7UUFFcEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVwRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUN0QztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNILFdBQVcsQ0FBQyxJQUFVO1FBRXBCLE1BQU0sVUFBVSxHQUFhLElBQUksUUFBUSxFQUFFLENBQUM7UUFFNUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFpQixJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRTtZQUNoRSxjQUFjLEVBQUUsSUFBSTtZQUNwQixPQUFPLEVBQUUsUUFBUTtZQUNqQixlQUFlLEVBQUUsSUFBSSxDQUFDLHFCQUFxQjtTQUM1QyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsV0FBVyxDQUFDLFFBQWdCO1FBQzFCLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDO1FBQ2xCLE1BQU0sR0FBRyxHQUFHO2lCQUNDLEVBQUU7Z0JBQ0gsUUFBUTs7O0tBR25CLENBQUM7UUFDRixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLDJFQUEyRTtRQUMzRSw2Q0FBNkM7UUFDN0MsZUFBZTtRQUNmLG9CQUFvQjtRQUNwQixNQUFNO1FBQ04sS0FBSztJQUNQLENBQUM7SUFFRCw0QkFBNEIsQ0FBQyxTQUFpQjtRQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxXQUF3QjtRQUN4QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQy9CLElBQUksV0FBVyxFQUFFO1lBQ2YsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQzNELE1BQU0sR0FBRyxHQUFHLEdBQUcsT0FBTyxHQUFHLFVBQVUsR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFDO1NBQzNHO1FBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQWdCO1FBQzFCLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN0QztRQUNELElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMvQixJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDcEM7SUFDSCxDQUFDO0lBRUQsbUJBQW1CLENBQUMsSUFBWTtRQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxRQUFnQjtRQUM1QyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sU0FBUyxHQUFHOzt5Q0FFbUIsRUFBRTs7OztLQUl0QyxDQUFDO1FBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRU8sbUJBQW1CLENBQUMsUUFBZ0I7UUFDMUMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QyxNQUFNLFNBQVMsR0FBRywrQ0FBK0MsRUFBRTs7U0FFOUQsQ0FBQztRQUNOLDBHQUEwRztRQUMxRywwREFBMEQ7UUFDMUQsd0JBQXdCO1FBQ3hCLHFDQUFxQztRQUNyQyw4Q0FBOEM7UUFDOUMscUhBQXFIO1FBQ3JILDhCQUE4QjtRQUM5QixPQUFPO1FBQ1AsZ0NBQWdDO1FBQ2hDLHVCQUF1QjtRQUN2QixNQUFNO1FBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsUUFBUSxDQUFDLElBQUk7UUFDWCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUN4QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDeEI7YUFBTTtZQUNMLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7YUFDeEI7WUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNULE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBRUQscUJBQXFCLENBQUMsS0FBSyxFQUFFLGtDQUFrQztRQUM3RCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO1FBQ2hDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7UUFDbkMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBRXBCLGtFQUFrRTtRQUNsRSxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDcEIsVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckI7YUFBTTtZQUNMLCtDQUErQztZQUMvQyxPQUFPLElBQUksSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFO2dCQUMvQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDN0M7WUFFRCx5REFBeUQ7WUFDekQsSUFBSSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUM7WUFDNUIsT0FBTyxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssQ0FBQyx1QkFBdUIsRUFBRTtnQkFDckQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekIsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7YUFDeEI7U0FDRjtRQUVELG9EQUFvRDtRQUNwRCxJQUFJLGtDQUFrQyxFQUFFO1lBQ3RDLElBQUksR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUM7WUFDckMsT0FBTyxJQUFJLEVBQUU7Z0JBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7YUFDeEI7U0FDRjtRQUVELE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRTtZQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7Z0JBQ2xELEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzlFO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7UUFDN0IsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDekIsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsc0JBQXNCLENBQUMsUUFBUTtRQUM3QixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ3ZDLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDO2dCQUNyQixhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDeEQsbURBQW1EO2dCQUNuRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7O3dGQXRYVSxvQkFBb0IsMENBU3JCLFFBQVE7MEVBVFAsb0JBQW9CLFdBQXBCLG9CQUFvQjt1RkFBcEIsb0JBQW9CO2NBRGhDLFVBQVU7O3NCQVVOLE1BQU07dUJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEV2ZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgRE9DVU1FTlQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgQ3VzdG9tQ2xhc3MgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyB2NCBhcyB1dWlkIH0gZnJvbSAndXVpZCc7XG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZFJlc3BvbnNlIHtcbiAgaW1hZ2VVcmw6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJFZGl0b3JTZXJ2aWNlIHtcblxuICBzYXZlZFNlbGVjdGlvbjogUmFuZ2UgfCBudWxsO1xuICBzZWxlY3RlZFRleHQ6IHN0cmluZztcbiAgdXBsb2FkVXJsOiBzdHJpbmc7XG4gIHVwbG9hZFdpdGhDcmVkZW50aWFsczogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2M6IGFueVxuICApIHsgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlZCBjb21tYW5kIGZyb20gZWRpdG9yIGhlYWRlciBidXR0b25zIGV4Y2x1ZGUgdG9nZ2xlRWRpdG9yTW9kZVxuICAgKiBAcGFyYW0gY29tbWFuZCBzdHJpbmcgZnJvbSB0cmlnZ2VyQ29tbWFuZFxuICAgKi9cbiAgZXhlY3V0ZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBwYXJhbTogc3RyaW5nID0gbnVsbCkge1xuICAgIGNvbnN0IGNvbW1hbmRzID0gWydoMScsICdoMicsICdoMycsICdoNCcsICdoNScsICdoNicsICdwJywgJ3ByZSddO1xuICAgIGlmIChjb21tYW5kcy5pbmNsdWRlcyhjb21tYW5kKSkge1xuICAgICAgdGhpcy5lZGl0Q21kKCdmb3JtYXRCbG9jaycsIGNvbW1hbmQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmVkaXRDbWQoY29tbWFuZCwgcGFyYW0pO1xuICB9XG5cbiAgZWRpdENtZChjbWQ6IHN0cmluZywgcGFyYW06IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIGNvbnNvbGUubG9nKGBleGVjdXRlQ29tbWFuZDogJHtjb21tYW5kfSAke3BhcmFtfWApO1xuICAgIHRoaXMucmVzdG9yZVNlbGVjdGlvbigpOyAgLy8gUHJldmVudCBsb3N0IGZvY3VzIGlzc3VlcyAtLUpDTlxuICAgIC8vIGNvbnNvbGUubG9nKCdyZXN0b3Jpbmcgc2VsZWN0aW9uJyk7XG4gICAgcmV0dXJuICEhdGhpcy5kb2MuZXhlY0NvbW1hbmQoY21kLCBmYWxzZSwgcGFyYW0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBVUkwgbGlua1xuICAgKiBAcGFyYW0gdXJsIHN0cmluZyBmcm9tIFVJIHByb21wdFxuICAgKi9cbiAgY3JlYXRlTGluayh1cmw6IHN0cmluZykge1xuICAgIGlmICghdXJsLmluY2x1ZGVzKCdodHRwJykpIHtcbiAgICAgIHRoaXMuZWRpdENtZCgnY3JlYXRlbGluaycsIHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5ld1VybCA9ICc8YSBocmVmPVwiJyArIHVybCArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgdGhpcy5zZWxlY3RlZFRleHQgKyAnPC9hPic7XG4gICAgICB0aGlzLmluc2VydEh0bWwobmV3VXJsKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogaW5zZXJ0IGNvbG9yIGVpdGhlciBmb250IG9yIGJhY2tncm91bmRcbiAgICpcbiAgICogQHBhcmFtIGNvbG9yIGNvbG9yIHRvIGJlIGluc2VydGVkXG4gICAqIEBwYXJhbSB3aGVyZSB3aGVyZSB0aGUgY29sb3IgaGFzIHRvIGJlIGluc2VydGVkIGVpdGhlciB0ZXh0L2JhY2tncm91bmRcbiAgICovXG4gIGluc2VydENvbG9yKGNvbG9yOiBzdHJpbmcsIHdoZXJlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCByZXN0b3JlZCA9IHRoaXMucmVzdG9yZVNlbGVjdGlvbigpO1xuICAgIGlmIChyZXN0b3JlZCkge1xuICAgICAgaWYgKHdoZXJlID09PSAndGV4dENvbG9yJykge1xuICAgICAgICB0aGlzLmVkaXRDbWQoJ2ZvcmVDb2xvcicsIGNvbG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWRpdENtZCgnaGlsaXRlQ29sb3InLCBjb2xvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBmb250IG5hbWVcbiAgICogQHBhcmFtIGZvbnROYW1lIHN0cmluZ1xuICAgKi9cbiAgc2V0Rm9udE5hbWUoZm9udE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZWRpdENtZCgnZm9udE5hbWUnLCBmb250TmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGZvbnQgc2l6ZVxuICAgKiBAcGFyYW0gZm9udFNpemUgc3RyaW5nXG4gICAqL1xuICBzZXRGb250U2l6ZShmb250U2l6ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5lZGl0Q21kKCdmb250U2l6ZScsIGZvbnRTaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgcmF3IEhUTUxcbiAgICogQHBhcmFtIGh0bWwgSFRNTCBzdHJpbmdcbiAgICovXG4gIGluc2VydEh0bWwoaHRtbDogYW55KTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBodG1sID09PSAnc3RyaW5nJykge1xuICAgICAgLy8geW91IGNhbiBwYXNzIGh0bWwgaW4gYXMgYSBzdHJpbmcsIGJ1dCBubyBndWFyYW50ZWVzIHRoYXQgaW5zZXJ0SFRNTCB3b24ndCBtdXRpbGF0ZSBpdFxuICAgICAgLy8gaWYgeW91IHdhbnQgdG8gZ3VhcmFudGVlIHRoZSBET00gc3RydWN0dXJlLCBwYXNzIGl0IGluIGFzIGEgYnVpbHQgSFRNTEVsZW1lbnRcbiAgICAgIGxldCBpc0hUTUxJbnNlcnRlZCA9IHRoaXMuZWRpdENtZCgnaW5zZXJ0SFRNTCcsIGh0bWwpO1xuXG4gICAgICBpZiAoIWlzSFRNTEluc2VydGVkKSB7XG4gICAgICAgIC8vIHJldHJ5Li4uc29tZXRpbWVzIGl0cyBuZWVkZWRcbiAgICAgICAgaXNIVE1MSW5zZXJ0ZWQgPSB0aGlzLmVkaXRDbWQoJ2luc2VydEhUTUwnLCBodG1sKTtcbiAgICAgICAgaWYgKCFpc0hUTUxJbnNlcnRlZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHBlcmZvcm0gdGhlIG9wZXJhdGlvbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaHRtbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNTk0MTU1OS9pcy10aGVyZS1hLXdheS10by1rZWVwLWV4ZWNjb21tYW5kaW5zZXJ0aHRtbC1mcm9tLXJlbW92aW5nLWF0dHJpYnV0ZXMtaW4tY2hyXG4gICAgICAvLyB0aGlzIGNhc2UgaXMgYXNzdW1lZCB0byByZWNlaXZlIGh0bWwgYXMgYSBwcm9wZXIgSFRNTEVsZW1lbnRcbiAgICAgIC8vIGlmIHRoZSBleGlzdGluZyBzZWxlY3Rpb24gaXMgbm90IGNvbGxhcHNlZCwgZGVsZXRlIGl0XG4gICAgICB0aGlzLmVkaXRDbWQoJ2RlbGV0ZScsICcnKTtcbiAgICAgIGxldCBzZWw7XG4gICAgICBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgICAgICBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGlmIChzZWwucmFuZ2VDb3VudCkge1xuICAgICAgICAgIGNvbnN0IHJhbmdlID0gc2VsLmdldFJhbmdlQXQoMCk7XG4gICAgICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG5cbiAgICAgICAgICByYW5nZS5pbnNlcnROb2RlKGh0bWwpO1xuXG4gICAgICAgICAgLy8gTW92ZSB0aGUgY2FyZXQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGluc2VydGVkIHNwYW5cbiAgICAgICAgICByYW5nZS5zZXRTdGFydEFmdGVyKGh0bWwpO1xuICAgICAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xuICAgICAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHNhdmUgc2VsZWN0aW9uIHdoZW4gdGhlIGVkaXRvciBpcyBmb2N1c3NlZCBvdXRcbiAgICovXG4gIHB1YmxpYyBzYXZlU2VsZWN0aW9uID0gKGVsOiBFbGVtZW50UmVmKTogdm9pZCA9PiB7XG5cbiAgICBpZiAoIXRoaXMuZWxlbWVudENvbnRhaW5zU2VsZWN0aW9uKGVsLm5hdGl2ZUVsZW1lbnQpKSB7XG4gICAgICByZXR1cm47IC8vIGRvIG5vdCBzYXZlIGJyb3dzZXIgc2VsZWN0aW9ucyB0aGF0IGFyZSBvdXRzaWRlIHRoZSBlZGl0b3JcbiAgICB9XG4gICAgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbikge1xuICAgICAgY29uc3Qgc2VsID0gdGhpcy5kb2MuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICBpZiAoc2VsLmdldFJhbmdlQXQgJiYgc2VsLnJhbmdlQ291bnQpIHtcbiAgICAgICAgdGhpcy5zYXZlZFNlbGVjdGlvbiA9IHNlbC5nZXRSYW5nZUF0KDApO1xuICAgICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9IHNlbC50b1N0cmluZygpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5kb2MuZ2V0U2VsZWN0aW9uICYmIHRoaXMuZG9jLmNyZWF0ZVJhbmdlKSB7XG4gICAgICB0aGlzLnNhdmVkU2VsZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zYXZlZFNlbGVjdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZWxlbWVudENvbnRhaW5zU2VsZWN0aW9uKGVsKSB7XG4gICAgaWYgKCFlbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB2aWV3ID0gdGhpcy5kb2MuZGVmYXVsdFZpZXc7XG4gICAgY29uc3Qgc2VsID0gdmlldy5nZXRTZWxlY3Rpb24oKTtcblxuICAgIGlmIChzZWwgJiYgc2VsLnJhbmdlQ291bnQgPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5pc09yQ29udGFpbnNEb21FbGVtKHNlbC5nZXRSYW5nZUF0KDApLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyLCBlbCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzT3JDb250YWluc0RvbUVsZW0obm9kZSwgY29udGFpbmVyKSB7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgIGlmIChub2RlID09PSBjb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogcmVzdG9yZSBzZWxlY3Rpb24gd2hlbiB0aGUgZWRpdG9yIGlzIGZvY3VzZWQgaW5cbiAgICpcbiAgICogc2F2ZWQgc2VsZWN0aW9uIHdoZW4gdGhlIGVkaXRvciBpcyBmb2N1c2VkIG91dFxuICAgKi9cbiAgcmVzdG9yZVNlbGVjdGlvbigpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5zYXZlZFNlbGVjdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgKioqUmVzdG9yaW5nIHNlbGVjdGlvbiA6ICR7dGhpcy5zYXZlZFNlbGVjdGlvbi5zdGFydENvbnRhaW5lci5ub2RlTmFtZX0gJHt0aGlzLnNhdmVkU2VsZWN0aW9uLmVuZENvbnRhaW5lci5ub2RlTmFtZX1gKTtcbiAgICAgICAgY29uc3Qgc2VsID0gdGhpcy5kb2MuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgc2VsLmFkZFJhbmdlKHRoaXMuc2F2ZWRTZWxlY3Rpb24pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5kb2MuZ2V0U2VsZWN0aW9uIC8qJiYgdGhpcy5zYXZlZFNlbGVjdGlvbi5zZWxlY3QqLykge1xuICAgICAgICAvLyB0aGlzLnNhdmVkU2VsZWN0aW9uLnNlbGVjdCgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBzZXRUaW1lb3V0IHVzZWQgZm9yIGV4ZWN1dGUgJ3NhdmVTZWxlY3Rpb24nIG1ldGhvZCBpbiBuZXh0IGV2ZW50IGxvb3AgaXRlcmF0aW9uXG4gICAqL1xuICBwdWJsaWMgZXhlY3V0ZUluTmV4dFF1ZXVlSXRlcmF0aW9uKGNhbGxiYWNrRm46ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55LCB0aW1lb3V0ID0gMWUyKTogdm9pZCB7XG4gICAgc2V0VGltZW91dChjYWxsYmFja0ZuLCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8qKiBjaGVjayBhbnkgc2VsZWN0aW9uIGlzIG1hZGUgb3Igbm90ICovXG4gIHByaXZhdGUgY2hlY2tTZWxlY3Rpb24oKTogYW55IHtcblxuICAgIGNvbnN0IHNlbGVjdGVkVGV4dCA9IHRoaXMuc2F2ZWRTZWxlY3Rpb24udG9TdHJpbmcoKTtcblxuICAgIGlmIChzZWxlY3RlZFRleHQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIFNlbGVjdGlvbiBNYWRlJyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwbG9hZCBmaWxlIHRvIHVwbG9hZFVybFxuICAgKiBAcGFyYW0gZmlsZSBUaGUgZmlsZVxuICAgKi9cbiAgdXBsb2FkSW1hZ2UoZmlsZTogRmlsZSk6IE9ic2VydmFibGU8SHR0cEV2ZW50PFVwbG9hZFJlc3BvbnNlPj4ge1xuXG4gICAgY29uc3QgdXBsb2FkRGF0YTogRm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgIHVwbG9hZERhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSwgZmlsZS5uYW1lKTtcblxuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxVcGxvYWRSZXNwb25zZT4odGhpcy51cGxvYWRVcmwsIHVwbG9hZERhdGEsIHtcbiAgICAgIHJlcG9ydFByb2dyZXNzOiB0cnVlLFxuICAgICAgb2JzZXJ2ZTogJ2V2ZW50cycsXG4gICAgICB3aXRoQ3JlZGVudGlhbHM6IHRoaXMudXBsb2FkV2l0aENyZWRlbnRpYWxzLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBpbWFnZSB3aXRoIFVybFxuICAgKiBAcGFyYW0gaW1hZ2VVcmwgVGhlIGltYWdlVXJsLlxuICAgKi9cbiAgaW5zZXJ0SW1hZ2UoaW1hZ2VVcmw6IHN0cmluZykge1xuICAgIGNvbnN0IGlkID0gdXVpZCgpO1xuICAgIGNvbnN0IGRpdiA9IGBcbiAgICA8ZmlndXJlIGlkPSR7aWR9IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXJcIiBjb250ZW50ZWRpdGFibGU9XCJmYWxzZVwiID5cbiAgICA8aW1nIHNyYz1cIiR7aW1hZ2VVcmx9XCIgICBzdHlsZT1cIm1hcmdpbjowIGF1dG9cIj5cbiAgICA8L2ZpZ3VyZT5cbiAgICA8YnI+XG4gICAgYDtcbiAgICB0aGlzLmluc2VydEh0bWwoZGl2KTtcbiAgICAvLyB0aGlzLmRvYy5nZXRFbGVtZW50QnlJZChgY2xvc2UtJHtpZH1gKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAvLyAgIGNvbnN0IGVsZSA9IHRoaXMuZG9jLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAvLyAgIGlmIChlbGUpIHtcbiAgICAvLyAgICAgZWxlLnJlbW92ZSgpO1xuICAgIC8vICAgfVxuICAgIC8vIH0pXG4gIH1cblxuICBzZXREZWZhdWx0UGFyYWdyYXBoU2VwYXJhdG9yKHNlcGFyYXRvcjogc3RyaW5nKSB7XG4gICAgdGhpcy5lZGl0Q21kKCdkZWZhdWx0UGFyYWdyYXBoU2VwYXJhdG9yJywgc2VwYXJhdG9yKTtcbiAgfVxuXG4gIGNyZWF0ZUN1c3RvbUNsYXNzKGN1c3RvbUNsYXNzOiBDdXN0b21DbGFzcykge1xuICAgIGxldCBuZXdUYWcgPSB0aGlzLnNlbGVjdGVkVGV4dDtcbiAgICBpZiAoY3VzdG9tQ2xhc3MpIHtcbiAgICAgIGNvbnN0IHRhZ05hbWUgPSBjdXN0b21DbGFzcy50YWcgPyBjdXN0b21DbGFzcy50YWcgOiAnc3Bhbic7XG4gICAgICBuZXdUYWcgPSAnPCcgKyB0YWdOYW1lICsgJyBjbGFzcz1cIicgKyBjdXN0b21DbGFzcy5jbGFzcyArICdcIj4nICsgdGhpcy5zZWxlY3RlZFRleHQgKyAnPC8nICsgdGFnTmFtZSArICc+JztcbiAgICB9XG4gICAgdGhpcy5pbnNlcnRIdG1sKG5ld1RhZyk7XG4gIH1cblxuICBpbnNlcnRWaWRlbyh2aWRlb1VybDogc3RyaW5nKSB7XG4gICAgaWYgKHZpZGVvVXJsLm1hdGNoKCd3d3cueW91dHViZS5jb20nKSkge1xuICAgICAgdGhpcy5pbnNlcnRZb3VUdWJlVmlkZW9UYWcodmlkZW9VcmwpO1xuICAgIH1cbiAgICBpZiAodmlkZW9VcmwubWF0Y2goJ3ZpbWVvLmNvbScpKSB7XG4gICAgICB0aGlzLmluc2VydFZpbWVvVmlkZW9UYWcodmlkZW9VcmwpO1xuICAgIH1cbiAgfVxuXG4gIGluc2VydEFyYml0cmFyeUh0bWwoaHRtbDogc3RyaW5nKSB7XG4gICAgdGhpcy5pbnNlcnRIdG1sKGh0bWwpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnNlcnRZb3VUdWJlVmlkZW9UYWcodmlkZW9Vcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGlkID0gdmlkZW9Vcmwuc3BsaXQoJ3Y9JylbMV07XG4gICAgY29uc3QgdGh1bWJuYWlsID0gYFxuICAgIDxpZnJhbWUgd2lkdGg9XCI1NjBcIiBoZWlnaHQ9XCIzMTVcIlxuICAgIHNyYz1cImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLyR7aWR9XCJcbiAgICBmcmFtZWJvcmRlcj1cIjBcIiBhbGxvdz1cImFjY2VsZXJvbWV0ZXI7IGF1dG9wbGF5OyBjbGlwYm9hcmQtd3JpdGU7IGVuY3J5cHRlZC1tZWRpYTsgZ3lyb3Njb3BlOyBwaWN0dXJlLWluLXBpY3R1cmVcIlxuICAgIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cbiAgICA8YnI+XG4gICAgYDtcbiAgICB0aGlzLmluc2VydEh0bWwodGh1bWJuYWlsKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5zZXJ0VmltZW9WaWRlb1RhZyh2aWRlb1VybDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgaWQgPSB2aWRlb1VybC5zcGxpdCgnLmNvbS8nKVsxXTtcbiAgICBjb25zdCB0aHVtYm5haWwgPSBgPGlmcmFtZSBzcmM9XCJodHRwczovL3BsYXllci52aW1lby5jb20vdmlkZW8vJHtpZH1cIlxuICAgIHdpZHRoPVwiNjQwXCIgaGVpZ2h0PVwiMzYwXCIgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3c9XCJhdXRvcGxheTsgZnVsbHNjcmVlbjsgcGljdHVyZS1pbi1waWN0dXJlXCIgYWxsIG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cbiAgICA8YnI+YDtcbiAgICAvLyBjb25zdCBzdWIgPSB0aGlzLmh0dHAuZ2V0PGFueT4oYGh0dHBzOi8vdmltZW8uY29tL2FwaS9vZW1iZWQuanNvbj91cmw9JHt2aWRlb1VybH1gKS5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgLy8gICBjb25zdCBpbWFnZVVybCA9IGRhdGEudGh1bWJuYWlsX3VybF93aXRoX3BsYXlfYnV0dG9uO1xuICAgIC8vICAgY29uc3QgdGh1bWJuYWlsID0gYFxuICAgIC8vICAgPGlmcmFtZSB3aWR0aD1cIjU2MFwiIGhlaWdodD1cIjMxNVwiXG4gICAgLy8gICBzcmM9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8ke2lkfVwiXG4gICAgLy8gICBmcmFtZWJvcmRlcj1cIjBcIiBhbGxvdz1cImFjY2VsZXJvbWV0ZXI7IGF1dG9wbGF5OyBjbGlwYm9hcmQtd3JpdGU7IGVuY3J5cHRlZC1tZWRpYTsgZ3lyb3Njb3BlOyBwaWN0dXJlLWluLXBpY3R1cmVcIlxuICAgIC8vICAgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPlxuICAgIC8vICAgYDtcbiAgICAvLyAgIHRoaXMuaW5zZXJ0SHRtbCh0aHVtYm5haWwpO1xuICAgIC8vICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgLy8gfSk7XG4gICAgdGhpcy5pbnNlcnRIdG1sKHRodW1ibmFpbCk7XG4gIH1cblxuICBuZXh0Tm9kZShub2RlKSB7XG4gICAgaWYgKG5vZGUuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICByZXR1cm4gbm9kZS5maXJzdENoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAobm9kZSAmJiAhbm9kZS5uZXh0U2libGluZykge1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmc7XG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2VTZWxlY3RlZE5vZGVzKHJhbmdlLCBpbmNsdWRlUGFydGlhbGx5U2VsZWN0ZWRDb250YWluZXJzKSB7XG4gICAgbGV0IG5vZGUgPSByYW5nZS5zdGFydENvbnRhaW5lcjtcbiAgICBjb25zdCBlbmROb2RlID0gcmFuZ2UuZW5kQ29udGFpbmVyO1xuICAgIGxldCByYW5nZU5vZGVzID0gW107XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIGEgcmFuZ2UgdGhhdCBpcyBjb250YWluZWQgd2l0aGluIGEgc2luZ2xlIG5vZGVcbiAgICBpZiAobm9kZSA9PT0gZW5kTm9kZSkge1xuICAgICAgcmFuZ2VOb2RlcyA9IFtub2RlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSXRlcmF0ZSBub2RlcyB1bnRpbCB3ZSBoaXQgdGhlIGVuZCBjb250YWluZXJcbiAgICAgIHdoaWxlIChub2RlICYmIG5vZGUgIT09IGVuZE5vZGUpIHtcbiAgICAgICAgcmFuZ2VOb2Rlcy5wdXNoKG5vZGUgPSB0aGlzLm5leHROb2RlKG5vZGUpKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHBhcnRpYWxseSBzZWxlY3RlZCBub2RlcyBhdCB0aGUgc3RhcnQgb2YgdGhlIHJhbmdlXG4gICAgICBub2RlID0gcmFuZ2Uuc3RhcnRDb250YWluZXI7XG4gICAgICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSByYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcikge1xuICAgICAgICByYW5nZU5vZGVzLnVuc2hpZnQobm9kZSk7XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGFuY2VzdG9ycyBvZiB0aGUgcmFuZ2UgY29udGFpbmVyLCBpZiByZXF1aXJlZFxuICAgIGlmIChpbmNsdWRlUGFydGlhbGx5U2VsZWN0ZWRDb250YWluZXJzKSB7XG4gICAgICBub2RlID0gcmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXI7XG4gICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICByYW5nZU5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlTm9kZXM7XG4gIH1cblxuICBnZXRTZWxlY3RlZE5vZGVzKCkge1xuICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbikge1xuICAgICAgY29uc3Qgc2VsID0gdGhpcy5kb2MuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gc2VsLnJhbmdlQ291bnQ7IGkgPCBsZW47ICsraSkge1xuICAgICAgICBub2Rlcy5wdXNoLmFwcGx5KG5vZGVzLCB0aGlzLmdldFJhbmdlU2VsZWN0ZWROb2RlcyhzZWwuZ2V0UmFuZ2VBdChpKSwgdHJ1ZSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICByZXBsYWNlV2l0aE93bkNoaWxkcmVuKGVsKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICB3aGlsZSAoZWwuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLmZpcnN0Q2hpbGQsIGVsKTtcbiAgICB9XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKGVsKTtcbiAgfVxuXG4gIHJlbW92ZVNlbGVjdGVkRWxlbWVudHModGFnTmFtZXMpIHtcbiAgICBjb25zdCB0YWdOYW1lc0FycmF5ID0gdGFnTmFtZXMudG9Mb3dlckNhc2UoKS5zcGxpdCgnLCcpO1xuICAgIHRoaXMuZ2V0U2VsZWN0ZWROb2RlcygpLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxICYmXG4gICAgICAgIHRhZ05hbWVzQXJyYXkuaW5kZXhPZihub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSkgPiAtMSkge1xuICAgICAgICAvLyBSZW1vdmUgdGhlIG5vZGUgYW5kIHJlcGxhY2UgaXQgd2l0aCBpdHMgY2hpbGRyZW5cbiAgICAgICAgdGhpcy5yZXBsYWNlV2l0aE93bkNoaWxkcmVuKG5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=