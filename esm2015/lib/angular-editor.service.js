import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
        let isHTMLInserted = this.editCmd('insertHTML', html);
        if (!isHTMLInserted) {
            // retry...sometimes its needed
            isHTMLInserted = this.editCmd('insertHTML', html);
            if (!isHTMLInserted) {
                throw new Error('Unable to perform the operation');
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
AngularEditorService.ɵprov = i0.ɵɵdefineInjectable({ token: AngularEditorService, factory: AngularEditorService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AngularEditorService, [{
        type: Injectable
    }], function () { return [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1lZGl0b3Iuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIvaG9tZS9qb2Vub2xhbi9kZXYvYW5ndWxhci1lZGl0b3IvcHJvamVjdHMvYW5ndWxhci1lZGl0b3Ivc3JjLyIsInNvdXJjZXMiOlsibGliL2FuZ3VsYXItZWRpdG9yLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLHNCQUFzQixDQUFDO0FBRTdELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUzQyxPQUFPLEVBQUUsRUFBRSxJQUFJLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQzs7O0FBTWxDLE1BQU0sT0FBTyxvQkFBb0I7SUFPL0IsWUFDVSxJQUFnQixFQUNFLEdBQVE7UUFEMUIsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNFLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFxRnBDOztXQUVHO1FBQ0ksa0JBQWEsR0FBRyxDQUFDLEVBQWMsRUFBUSxFQUFFO1lBRTlDLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUNwRCxPQUFPLENBQUMsNkRBQTZEO2FBQ3RFO1lBQ0QsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRTtnQkFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ3BDO2FBQ0Y7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QUFVLENBQUM7UUFDN0IsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDekIsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsc0JBQXNCLENBQUMsUUFBUTtRQUM3QixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ3ZDLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDO2dCQUNyQixhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDeEQsbURBQW1EO2dCQUNuRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7O3dGQXpWVSxvQkFBb0IsMENBU3JCLFFBQVE7NERBVFAsb0JBQW9CLFdBQXBCLG9CQUFvQjtrREFBcEIsb0JBQW9CO2NBRGhDLFVBQVU7O3NCQVVOLE1BQU07dUJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEV2ZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgRE9DVU1FTlQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgQ3VzdG9tQ2xhc3MgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyB2NCBhcyB1dWlkIH0gZnJvbSAndXVpZCc7XG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZFJlc3BvbnNlIHtcbiAgaW1hZ2VVcmw6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJFZGl0b3JTZXJ2aWNlIHtcblxuICBzYXZlZFNlbGVjdGlvbjogUmFuZ2UgfCBudWxsO1xuICBzZWxlY3RlZFRleHQ6IHN0cmluZztcbiAgdXBsb2FkVXJsOiBzdHJpbmc7XG4gIHVwbG9hZFdpdGhDcmVkZW50aWFsczogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2M6IGFueVxuICApIHsgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlZCBjb21tYW5kIGZyb20gZWRpdG9yIGhlYWRlciBidXR0b25zIGV4Y2x1ZGUgdG9nZ2xlRWRpdG9yTW9kZVxuICAgKiBAcGFyYW0gY29tbWFuZCBzdHJpbmcgZnJvbSB0cmlnZ2VyQ29tbWFuZFxuICAgKi9cbiAgZXhlY3V0ZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBwYXJhbTogc3RyaW5nID0gbnVsbCkge1xuICAgIGNvbnN0IGNvbW1hbmRzID0gWydoMScsICdoMicsICdoMycsICdoNCcsICdoNScsICdoNicsICdwJywgJ3ByZSddO1xuICAgIGlmIChjb21tYW5kcy5pbmNsdWRlcyhjb21tYW5kKSkge1xuICAgICAgdGhpcy5lZGl0Q21kKCdmb3JtYXRCbG9jaycsIGNvbW1hbmQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmVkaXRDbWQoY29tbWFuZCwgcGFyYW0pO1xuICB9XG5cbiAgZWRpdENtZChjbWQ6IHN0cmluZywgcGFyYW06IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIGNvbnNvbGUubG9nKGBleGVjdXRlQ29tbWFuZDogJHtjb21tYW5kfSAke3BhcmFtfWApO1xuICAgIHRoaXMucmVzdG9yZVNlbGVjdGlvbigpOyAgLy8gUHJldmVudCBsb3N0IGZvY3VzIGlzc3VlcyAtLUpDTlxuICAgIC8vIGNvbnNvbGUubG9nKCdyZXN0b3Jpbmcgc2VsZWN0aW9uJyk7XG4gICAgcmV0dXJuICEhdGhpcy5kb2MuZXhlY0NvbW1hbmQoY21kLCBmYWxzZSwgcGFyYW0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBVUkwgbGlua1xuICAgKiBAcGFyYW0gdXJsIHN0cmluZyBmcm9tIFVJIHByb21wdFxuICAgKi9cbiAgY3JlYXRlTGluayh1cmw6IHN0cmluZykge1xuICAgIGlmICghdXJsLmluY2x1ZGVzKCdodHRwJykpIHtcbiAgICAgIHRoaXMuZWRpdENtZCgnY3JlYXRlbGluaycsIHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5ld1VybCA9ICc8YSBocmVmPVwiJyArIHVybCArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgdGhpcy5zZWxlY3RlZFRleHQgKyAnPC9hPic7XG4gICAgICB0aGlzLmluc2VydEh0bWwobmV3VXJsKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogaW5zZXJ0IGNvbG9yIGVpdGhlciBmb250IG9yIGJhY2tncm91bmRcbiAgICpcbiAgICogQHBhcmFtIGNvbG9yIGNvbG9yIHRvIGJlIGluc2VydGVkXG4gICAqIEBwYXJhbSB3aGVyZSB3aGVyZSB0aGUgY29sb3IgaGFzIHRvIGJlIGluc2VydGVkIGVpdGhlciB0ZXh0L2JhY2tncm91bmRcbiAgICovXG4gIGluc2VydENvbG9yKGNvbG9yOiBzdHJpbmcsIHdoZXJlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCByZXN0b3JlZCA9IHRoaXMucmVzdG9yZVNlbGVjdGlvbigpO1xuICAgIGlmIChyZXN0b3JlZCkge1xuICAgICAgaWYgKHdoZXJlID09PSAndGV4dENvbG9yJykge1xuICAgICAgICB0aGlzLmVkaXRDbWQoJ2ZvcmVDb2xvcicsIGNvbG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWRpdENtZCgnaGlsaXRlQ29sb3InLCBjb2xvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBmb250IG5hbWVcbiAgICogQHBhcmFtIGZvbnROYW1lIHN0cmluZ1xuICAgKi9cbiAgc2V0Rm9udE5hbWUoZm9udE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZWRpdENtZCgnZm9udE5hbWUnLCBmb250TmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGZvbnQgc2l6ZVxuICAgKiBAcGFyYW0gZm9udFNpemUgc3RyaW5nXG4gICAqL1xuICBzZXRGb250U2l6ZShmb250U2l6ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5lZGl0Q21kKCdmb250U2l6ZScsIGZvbnRTaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgcmF3IEhUTUxcbiAgICogQHBhcmFtIGh0bWwgSFRNTCBzdHJpbmdcbiAgICovXG4gIGluc2VydEh0bWwoaHRtbDogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGlzSFRNTEluc2VydGVkID0gdGhpcy5lZGl0Q21kKCdpbnNlcnRIVE1MJywgaHRtbCk7XG5cbiAgICBpZiAoIWlzSFRNTEluc2VydGVkKSB7XG4gICAgICAvLyByZXRyeS4uLnNvbWV0aW1lcyBpdHMgbmVlZGVkXG4gICAgICBpc0hUTUxJbnNlcnRlZCA9IHRoaXMuZWRpdENtZCgnaW5zZXJ0SFRNTCcsIGh0bWwpO1xuICAgICAgaWYgKCFpc0hUTUxJbnNlcnRlZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBwZXJmb3JtIHRoZSBvcGVyYXRpb24nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2F2ZSBzZWxlY3Rpb24gd2hlbiB0aGUgZWRpdG9yIGlzIGZvY3Vzc2VkIG91dFxuICAgKi9cbiAgcHVibGljIHNhdmVTZWxlY3Rpb24gPSAoZWw6IEVsZW1lbnRSZWYpOiB2b2lkID0+IHtcblxuICAgIGlmICghdGhpcy5lbGVtZW50Q29udGFpbnNTZWxlY3Rpb24oZWwubmF0aXZlRWxlbWVudCkpIHtcbiAgICAgIHJldHVybjsgLy8gZG8gbm90IHNhdmUgYnJvd3NlciBzZWxlY3Rpb25zIHRoYXQgYXJlIG91dHNpZGUgdGhlIGVkaXRvclxuICAgIH1cbiAgICBpZiAodGhpcy5kb2MuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICBjb25zdCBzZWwgPSB0aGlzLmRvYy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgIGlmIChzZWwuZ2V0UmFuZ2VBdCAmJiBzZWwucmFuZ2VDb3VudCkge1xuICAgICAgICB0aGlzLnNhdmVkU2VsZWN0aW9uID0gc2VsLmdldFJhbmdlQXQoMCk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRUZXh0ID0gc2VsLnRvU3RyaW5nKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmRvYy5nZXRTZWxlY3Rpb24gJiYgdGhpcy5kb2MuY3JlYXRlUmFuZ2UpIHtcbiAgICAgIHRoaXMuc2F2ZWRTZWxlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNhdmVkU2VsZWN0aW9uID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBlbGVtZW50Q29udGFpbnNTZWxlY3Rpb24oZWwpIHtcbiAgICBpZiAoIWVsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmRvYy5kZWZhdWx0VmlldztcbiAgICBjb25zdCBzZWwgPSB2aWV3LmdldFNlbGVjdGlvbigpO1xuXG4gICAgaWYgKHNlbCAmJiBzZWwucmFuZ2VDb3VudCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmlzT3JDb250YWluc0RvbUVsZW0oc2VsLmdldFJhbmdlQXQoMCkuY29tbW9uQW5jZXN0b3JDb250YWluZXIsIGVsKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaXNPckNvbnRhaW5zRG9tRWxlbShub2RlLCBjb250YWluZXIpIHtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgaWYgKG5vZGUgPT09IGNvbnRhaW5lcikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZXN0b3JlIHNlbGVjdGlvbiB3aGVuIHRoZSBlZGl0b3IgaXMgZm9jdXNlZCBpblxuICAgKlxuICAgKiBzYXZlZCBzZWxlY3Rpb24gd2hlbiB0aGUgZWRpdG9yIGlzIGZvY3VzZWQgb3V0XG4gICAqL1xuICByZXN0b3JlU2VsZWN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnNhdmVkU2VsZWN0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb2MuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGAqKipSZXN0b3Jpbmcgc2VsZWN0aW9uIDogJHt0aGlzLnNhdmVkU2VsZWN0aW9uLnN0YXJ0Q29udGFpbmVyLm5vZGVOYW1lfSAke3RoaXMuc2F2ZWRTZWxlY3Rpb24uZW5kQ29udGFpbmVyLm5vZGVOYW1lfWApO1xuICAgICAgICBjb25zdCBzZWwgPSB0aGlzLmRvYy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICBzZWwuYWRkUmFuZ2UodGhpcy5zYXZlZFNlbGVjdGlvbik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmRvYy5nZXRTZWxlY3Rpb24gLyomJiB0aGlzLnNhdmVkU2VsZWN0aW9uLnNlbGVjdCovKSB7XG4gICAgICAgIC8vIHRoaXMuc2F2ZWRTZWxlY3Rpb24uc2VsZWN0KCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHNldFRpbWVvdXQgdXNlZCBmb3IgZXhlY3V0ZSAnc2F2ZVNlbGVjdGlvbicgbWV0aG9kIGluIG5leHQgZXZlbnQgbG9vcCBpdGVyYXRpb25cbiAgICovXG4gIHB1YmxpYyBleGVjdXRlSW5OZXh0UXVldWVJdGVyYXRpb24oY2FsbGJhY2tGbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnksIHRpbWVvdXQgPSAxZTIpOiB2b2lkIHtcbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrRm4sIHRpbWVvdXQpO1xuICB9XG5cbiAgLyoqIGNoZWNrIGFueSBzZWxlY3Rpb24gaXMgbWFkZSBvciBub3QgKi9cbiAgcHJpdmF0ZSBjaGVja1NlbGVjdGlvbigpOiBhbnkge1xuXG4gICAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gdGhpcy5zYXZlZFNlbGVjdGlvbi50b1N0cmluZygpO1xuXG4gICAgaWYgKHNlbGVjdGVkVGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gU2VsZWN0aW9uIE1hZGUnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVXBsb2FkIGZpbGUgdG8gdXBsb2FkVXJsXG4gICAqIEBwYXJhbSBmaWxlIFRoZSBmaWxlXG4gICAqL1xuICB1cGxvYWRJbWFnZShmaWxlOiBGaWxlKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8VXBsb2FkUmVzcG9uc2U+PiB7XG5cbiAgICBjb25zdCB1cGxvYWREYXRhOiBGb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG4gICAgdXBsb2FkRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlLCBmaWxlLm5hbWUpO1xuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PFVwbG9hZFJlc3BvbnNlPih0aGlzLnVwbG9hZFVybCwgdXBsb2FkRGF0YSwge1xuICAgICAgcmVwb3J0UHJvZ3Jlc3M6IHRydWUsXG4gICAgICBvYnNlcnZlOiAnZXZlbnRzJyxcbiAgICAgIHdpdGhDcmVkZW50aWFsczogdGhpcy51cGxvYWRXaXRoQ3JlZGVudGlhbHMsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGltYWdlIHdpdGggVXJsXG4gICAqIEBwYXJhbSBpbWFnZVVybCBUaGUgaW1hZ2VVcmwuXG4gICAqL1xuICBpbnNlcnRJbWFnZShpbWFnZVVybDogc3RyaW5nKSB7XG4gICAgY29uc3QgaWQgPSB1dWlkKCk7XG4gICAgY29uc3QgZGl2ID0gYFxuICAgIDxmaWd1cmUgaWQ9JHtpZH0gc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlclwiIGNvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCIgPlxuICAgIDxpbWcgc3JjPVwiJHtpbWFnZVVybH1cIiAgIHN0eWxlPVwibWFyZ2luOjAgYXV0b1wiPlxuICAgIDwvZmlndXJlPlxuICAgIDxicj5cbiAgICBgO1xuICAgIHRoaXMuaW5zZXJ0SHRtbChkaXYpO1xuICAgIC8vIHRoaXMuZG9jLmdldEVsZW1lbnRCeUlkKGBjbG9zZS0ke2lkfWApLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIC8vICAgY29uc3QgZWxlID0gdGhpcy5kb2MuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIC8vICAgaWYgKGVsZSkge1xuICAgIC8vICAgICBlbGUucmVtb3ZlKCk7XG4gICAgLy8gICB9XG4gICAgLy8gfSlcbiAgfVxuXG4gIHNldERlZmF1bHRQYXJhZ3JhcGhTZXBhcmF0b3Ioc2VwYXJhdG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLmVkaXRDbWQoJ2RlZmF1bHRQYXJhZ3JhcGhTZXBhcmF0b3InLCBzZXBhcmF0b3IpO1xuICB9XG5cbiAgY3JlYXRlQ3VzdG9tQ2xhc3MoY3VzdG9tQ2xhc3M6IEN1c3RvbUNsYXNzKSB7XG4gICAgbGV0IG5ld1RhZyA9IHRoaXMuc2VsZWN0ZWRUZXh0O1xuICAgIGlmIChjdXN0b21DbGFzcykge1xuICAgICAgY29uc3QgdGFnTmFtZSA9IGN1c3RvbUNsYXNzLnRhZyA/IGN1c3RvbUNsYXNzLnRhZyA6ICdzcGFuJztcbiAgICAgIG5ld1RhZyA9ICc8JyArIHRhZ05hbWUgKyAnIGNsYXNzPVwiJyArIGN1c3RvbUNsYXNzLmNsYXNzICsgJ1wiPicgKyB0aGlzLnNlbGVjdGVkVGV4dCArICc8LycgKyB0YWdOYW1lICsgJz4nO1xuICAgIH1cbiAgICB0aGlzLmluc2VydEh0bWwobmV3VGFnKTtcbiAgfVxuXG4gIGluc2VydFZpZGVvKHZpZGVvVXJsOiBzdHJpbmcpIHtcbiAgICBpZiAodmlkZW9VcmwubWF0Y2goJ3d3dy55b3V0dWJlLmNvbScpKSB7XG4gICAgICB0aGlzLmluc2VydFlvdVR1YmVWaWRlb1RhZyh2aWRlb1VybCk7XG4gICAgfVxuICAgIGlmICh2aWRlb1VybC5tYXRjaCgndmltZW8uY29tJykpIHtcbiAgICAgIHRoaXMuaW5zZXJ0VmltZW9WaWRlb1RhZyh2aWRlb1VybCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbnNlcnRZb3VUdWJlVmlkZW9UYWcodmlkZW9Vcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGlkID0gdmlkZW9Vcmwuc3BsaXQoJ3Y9JylbMV07XG4gICAgY29uc3QgdGh1bWJuYWlsID0gYFxuICAgIDxpZnJhbWUgd2lkdGg9XCI1NjBcIiBoZWlnaHQ9XCIzMTVcIlxuICAgIHNyYz1cImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLyR7aWR9XCJcbiAgICBmcmFtZWJvcmRlcj1cIjBcIiBhbGxvdz1cImFjY2VsZXJvbWV0ZXI7IGF1dG9wbGF5OyBjbGlwYm9hcmQtd3JpdGU7IGVuY3J5cHRlZC1tZWRpYTsgZ3lyb3Njb3BlOyBwaWN0dXJlLWluLXBpY3R1cmVcIlxuICAgIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cbiAgICA8YnI+XG4gICAgYDtcbiAgICB0aGlzLmluc2VydEh0bWwodGh1bWJuYWlsKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5zZXJ0VmltZW9WaWRlb1RhZyh2aWRlb1VybDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgaWQgPSB2aWRlb1VybC5zcGxpdCgnLmNvbS8nKVsxXTtcbiAgICBjb25zdCB0aHVtYm5haWwgPSBgPGlmcmFtZSBzcmM9XCJodHRwczovL3BsYXllci52aW1lby5jb20vdmlkZW8vJHtpZH1cIlxuICAgIHdpZHRoPVwiNjQwXCIgaGVpZ2h0PVwiMzYwXCIgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3c9XCJhdXRvcGxheTsgZnVsbHNjcmVlbjsgcGljdHVyZS1pbi1waWN0dXJlXCIgYWxsIG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cbiAgICA8YnI+YDtcbiAgICAvLyBjb25zdCBzdWIgPSB0aGlzLmh0dHAuZ2V0PGFueT4oYGh0dHBzOi8vdmltZW8uY29tL2FwaS9vZW1iZWQuanNvbj91cmw9JHt2aWRlb1VybH1gKS5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgLy8gICBjb25zdCBpbWFnZVVybCA9IGRhdGEudGh1bWJuYWlsX3VybF93aXRoX3BsYXlfYnV0dG9uO1xuICAgIC8vICAgY29uc3QgdGh1bWJuYWlsID0gYFxuICAgIC8vICAgPGlmcmFtZSB3aWR0aD1cIjU2MFwiIGhlaWdodD1cIjMxNVwiXG4gICAgLy8gICBzcmM9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8ke2lkfVwiXG4gICAgLy8gICBmcmFtZWJvcmRlcj1cIjBcIiBhbGxvdz1cImFjY2VsZXJvbWV0ZXI7IGF1dG9wbGF5OyBjbGlwYm9hcmQtd3JpdGU7IGVuY3J5cHRlZC1tZWRpYTsgZ3lyb3Njb3BlOyBwaWN0dXJlLWluLXBpY3R1cmVcIlxuICAgIC8vICAgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPlxuICAgIC8vICAgYDtcbiAgICAvLyAgIHRoaXMuaW5zZXJ0SHRtbCh0aHVtYm5haWwpO1xuICAgIC8vICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgLy8gfSk7XG4gICAgdGhpcy5pbnNlcnRIdG1sKHRodW1ibmFpbCk7XG4gIH1cblxuICBuZXh0Tm9kZShub2RlKSB7XG4gICAgaWYgKG5vZGUuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICByZXR1cm4gbm9kZS5maXJzdENoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAobm9kZSAmJiAhbm9kZS5uZXh0U2libGluZykge1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmc7XG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2VTZWxlY3RlZE5vZGVzKHJhbmdlLCBpbmNsdWRlUGFydGlhbGx5U2VsZWN0ZWRDb250YWluZXJzKSB7XG4gICAgbGV0IG5vZGUgPSByYW5nZS5zdGFydENvbnRhaW5lcjtcbiAgICBjb25zdCBlbmROb2RlID0gcmFuZ2UuZW5kQ29udGFpbmVyO1xuICAgIGxldCByYW5nZU5vZGVzID0gW107XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIGEgcmFuZ2UgdGhhdCBpcyBjb250YWluZWQgd2l0aGluIGEgc2luZ2xlIG5vZGVcbiAgICBpZiAobm9kZSA9PT0gZW5kTm9kZSkge1xuICAgICAgcmFuZ2VOb2RlcyA9IFtub2RlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSXRlcmF0ZSBub2RlcyB1bnRpbCB3ZSBoaXQgdGhlIGVuZCBjb250YWluZXJcbiAgICAgIHdoaWxlIChub2RlICYmIG5vZGUgIT09IGVuZE5vZGUpIHtcbiAgICAgICAgcmFuZ2VOb2Rlcy5wdXNoKG5vZGUgPSB0aGlzLm5leHROb2RlKG5vZGUpKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHBhcnRpYWxseSBzZWxlY3RlZCBub2RlcyBhdCB0aGUgc3RhcnQgb2YgdGhlIHJhbmdlXG4gICAgICBub2RlID0gcmFuZ2Uuc3RhcnRDb250YWluZXI7XG4gICAgICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSByYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcikge1xuICAgICAgICByYW5nZU5vZGVzLnVuc2hpZnQobm9kZSk7XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGFuY2VzdG9ycyBvZiB0aGUgcmFuZ2UgY29udGFpbmVyLCBpZiByZXF1aXJlZFxuICAgIGlmIChpbmNsdWRlUGFydGlhbGx5U2VsZWN0ZWRDb250YWluZXJzKSB7XG4gICAgICBub2RlID0gcmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXI7XG4gICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICByYW5nZU5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlTm9kZXM7XG4gIH1cblxuICBnZXRTZWxlY3RlZE5vZGVzKCkge1xuICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbikge1xuICAgICAgY29uc3Qgc2VsID0gdGhpcy5kb2MuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gc2VsLnJhbmdlQ291bnQ7IGkgPCBsZW47ICsraSkge1xuICAgICAgICBub2Rlcy5wdXNoLmFwcGx5KG5vZGVzLCB0aGlzLmdldFJhbmdlU2VsZWN0ZWROb2RlcyhzZWwuZ2V0UmFuZ2VBdChpKSwgdHJ1ZSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICByZXBsYWNlV2l0aE93bkNoaWxkcmVuKGVsKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICB3aGlsZSAoZWwuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLmZpcnN0Q2hpbGQsIGVsKTtcbiAgICB9XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKGVsKTtcbiAgfVxuXG4gIHJlbW92ZVNlbGVjdGVkRWxlbWVudHModGFnTmFtZXMpIHtcbiAgICBjb25zdCB0YWdOYW1lc0FycmF5ID0gdGFnTmFtZXMudG9Mb3dlckNhc2UoKS5zcGxpdCgnLCcpO1xuICAgIHRoaXMuZ2V0U2VsZWN0ZWROb2RlcygpLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxICYmXG4gICAgICAgIHRhZ05hbWVzQXJyYXkuaW5kZXhPZihub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSkgPiAtMSkge1xuICAgICAgICAvLyBSZW1vdmUgdGhlIG5vZGUgYW5kIHJlcGxhY2UgaXQgd2l0aCBpdHMgY2hpbGRyZW5cbiAgICAgICAgdGhpcy5yZXBsYWNlV2l0aE93bkNoaWxkcmVuKG5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=