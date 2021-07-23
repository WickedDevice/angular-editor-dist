import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { v4 as uuid } from 'uuid';
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
AngularEditorService.decorators = [
    { type: Injectable }
];
AngularEditorService.ctorParameters = () => [
    { type: HttpClient },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1lZGl0b3Iuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIvaG9tZS92aWMvZGV2L2FuZ3VsYXItZWRpdG9yL3Byb2plY3RzL2FuZ3VsYXItZWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyLWVkaXRvci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9ELE9BQU8sRUFBRSxVQUFVLEVBQWEsTUFBTSxzQkFBc0IsQ0FBQztBQUU3RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFM0MsT0FBTyxFQUFFLEVBQUUsSUFBSSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFNbEMsTUFBTSxPQUFPLG9CQUFvQjtJQU8vQixZQUNVLElBQWdCLEVBQ0UsR0FBUTtRQUQxQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ0UsUUFBRyxHQUFILEdBQUcsQ0FBSztRQThHcEM7O1dBRUc7UUFDSSxrQkFBYSxHQUFHLENBQUMsRUFBYyxFQUFRLEVBQUU7WUFFOUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3BELE9BQU8sQ0FBQyw2REFBNkQ7YUFDdEU7WUFDRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFO2dCQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNwQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRTtvQkFDcEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDcEM7YUFDRjtpQkFBTSxJ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QVE7UUFDN0IsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN2QyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQztnQkFDckIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3hELG1EQUFtRDtnQkFDbkQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25DO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7WUF2WEYsVUFBVTs7O1lBVEYsVUFBVTs0Q0FtQmQsTUFBTSxTQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbGVtZW50UmVmLCBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBDbGllbnQsIEh0dHBFdmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IEN1c3RvbUNsYXNzIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgdjQgYXMgdXVpZCB9IGZyb20gJ3V1aWQnO1xuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRSZXNwb25zZSB7XG4gIGltYWdlVXJsOiBzdHJpbmc7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRWRpdG9yU2VydmljZSB7XG5cbiAgc2F2ZWRTZWxlY3Rpb246IFJhbmdlIHwgbnVsbDtcbiAgc2VsZWN0ZWRUZXh0OiBzdHJpbmc7XG4gIHVwbG9hZFVybDogc3RyaW5nO1xuICB1cGxvYWRXaXRoQ3JlZGVudGlhbHM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgZG9jOiBhbnlcbiAgKSB7IH1cblxuICAvKipcbiAgICogRXhlY3V0ZWQgY29tbWFuZCBmcm9tIGVkaXRvciBoZWFkZXIgYnV0dG9ucyBleGNsdWRlIHRvZ2dsZUVkaXRvck1vZGVcbiAgICogQHBhcmFtIGNvbW1hbmQgc3RyaW5nIGZyb20gdHJpZ2dlckNvbW1hbmRcbiAgICovXG4gIGV4ZWN1dGVDb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgcGFyYW06IHN0cmluZyA9IG51bGwpIHtcbiAgICBjb25zdCBjb21tYW5kcyA9IFsnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAnaDUnLCAnaDYnLCAncCcsICdwcmUnXTtcbiAgICBpZiAoY29tbWFuZHMuaW5jbHVkZXMoY29tbWFuZCkpIHtcbiAgICAgIHRoaXMuZWRpdENtZCgnZm9ybWF0QmxvY2snLCBjb21tYW5kKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5lZGl0Q21kKGNvbW1hbmQsIHBhcmFtKTtcbiAgfVxuXG4gIGVkaXRDbWQoY21kOiBzdHJpbmcsIHBhcmFtOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBjb25zb2xlLmxvZyhgZXhlY3V0ZUNvbW1hbmQ6ICR7Y29tbWFuZH0gJHtwYXJhbX1gKTtcbiAgICB0aGlzLnJlc3RvcmVTZWxlY3Rpb24oKTsgIC8vIFByZXZlbnQgbG9zdCBmb2N1cyBpc3N1ZXMgLS1KQ05cbiAgICAvLyBjb25zb2xlLmxvZygncmVzdG9yaW5nIHNlbGVjdGlvbicpO1xuICAgIHJldHVybiAhIXRoaXMuZG9jLmV4ZWNDb21tYW5kKGNtZCwgZmFsc2UsIHBhcmFtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgVVJMIGxpbmtcbiAgICogQHBhcmFtIHVybCBzdHJpbmcgZnJvbSBVSSBwcm9tcHRcbiAgICovXG4gIGNyZWF0ZUxpbmsodXJsOiBzdHJpbmcpIHtcbiAgICBpZiAoIXVybC5pbmNsdWRlcygnaHR0cCcpKSB7XG4gICAgICB0aGlzLmVkaXRDbWQoJ2NyZWF0ZWxpbmsnLCB1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBuZXdVcmwgPSAnPGEgaHJlZj1cIicgKyB1cmwgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIHRoaXMuc2VsZWN0ZWRUZXh0ICsgJzwvYT4nO1xuICAgICAgdGhpcy5pbnNlcnRIdG1sKG5ld1VybCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGluc2VydCBjb2xvciBlaXRoZXIgZm9udCBvciBiYWNrZ3JvdW5kXG4gICAqXG4gICAqIEBwYXJhbSBjb2xvciBjb2xvciB0byBiZSBpbnNlcnRlZFxuICAgKiBAcGFyYW0gd2hlcmUgd2hlcmUgdGhlIGNvbG9yIGhhcyB0byBiZSBpbnNlcnRlZCBlaXRoZXIgdGV4dC9iYWNrZ3JvdW5kXG4gICAqL1xuICBpbnNlcnRDb2xvcihjb2xvcjogc3RyaW5nLCB3aGVyZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcmVzdG9yZWQgPSB0aGlzLnJlc3RvcmVTZWxlY3Rpb24oKTtcbiAgICBpZiAocmVzdG9yZWQpIHtcbiAgICAgIGlmICh3aGVyZSA9PT0gJ3RleHRDb2xvcicpIHtcbiAgICAgICAgdGhpcy5lZGl0Q21kKCdmb3JlQ29sb3InLCBjb2xvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVkaXRDbWQoJ2hpbGl0ZUNvbG9yJywgY29sb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZm9udCBuYW1lXG4gICAqIEBwYXJhbSBmb250TmFtZSBzdHJpbmdcbiAgICovXG4gIHNldEZvbnROYW1lKGZvbnROYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmVkaXRDbWQoJ2ZvbnROYW1lJywgZm9udE5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBmb250IHNpemVcbiAgICogQHBhcmFtIGZvbnRTaXplIHN0cmluZ1xuICAgKi9cbiAgc2V0Rm9udFNpemUoZm9udFNpemU6IHN0cmluZykge1xuICAgIHRoaXMuZWRpdENtZCgnZm9udFNpemUnLCBmb250U2l6ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIHJhdyBIVE1MXG4gICAqIEBwYXJhbSBodG1sIEhUTUwgc3RyaW5nXG4gICAqL1xuICBpbnNlcnRIdG1sKGh0bWw6IGFueSk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgaHRtbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIHlvdSBjYW4gcGFzcyBodG1sIGluIGFzIGEgc3RyaW5nLCBidXQgbm8gZ3VhcmFudGVlcyB0aGF0IGluc2VydEhUTUwgd29uJ3QgbXV0aWxhdGUgaXRcbiAgICAgIC8vIGlmIHlvdSB3YW50IHRvIGd1YXJhbnRlZSB0aGUgRE9NIHN0cnVjdHVyZSwgcGFzcyBpdCBpbiBhcyBhIGJ1aWx0IEhUTUxFbGVtZW50XG4gICAgICBsZXQgaXNIVE1MSW5zZXJ0ZWQgPSB0aGlzLmVkaXRDbWQoJ2luc2VydEhUTUwnLCBodG1sKTtcblxuICAgICAgaWYgKCFpc0hUTUxJbnNlcnRlZCkge1xuICAgICAgICAvLyByZXRyeS4uLnNvbWV0aW1lcyBpdHMgbmVlZGVkXG4gICAgICAgIGlzSFRNTEluc2VydGVkID0gdGhpcy5lZGl0Q21kKCdpbnNlcnRIVE1MJywgaHRtbCk7XG4gICAgICAgIGlmICghaXNIVE1MSW5zZXJ0ZWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBwZXJmb3JtIHRoZSBvcGVyYXRpb24nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGh0bWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAvLyBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjU5NDE1NTkvaXMtdGhlcmUtYS13YXktdG8ta2VlcC1leGVjY29tbWFuZGluc2VydGh0bWwtZnJvbS1yZW1vdmluZy1hdHRyaWJ1dGVzLWluLWNoclxuICAgICAgLy8gdGhpcyBjYXNlIGlzIGFzc3VtZWQgdG8gcmVjZWl2ZSBodG1sIGFzIGEgcHJvcGVyIEhUTUxFbGVtZW50XG4gICAgICAvLyBpZiB0aGUgZXhpc3Rpbmcgc2VsZWN0aW9uIGlzIG5vdCBjb2xsYXBzZWQsIGRlbGV0ZSBpdFxuICAgICAgdGhpcy5lZGl0Q21kKCdkZWxldGUnLCAnJyk7XG4gICAgICBsZXQgc2VsO1xuICAgICAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgICAgICBpZiAoc2VsLnJhbmdlQ291bnQpIHtcbiAgICAgICAgICBjb25zdCByYW5nZSA9IHNlbC5nZXRSYW5nZUF0KDApO1xuICAgICAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xuXG4gICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZShodG1sKTtcblxuICAgICAgICAgIC8vIE1vdmUgdGhlIGNhcmV0IGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBpbnNlcnRlZCBzcGFuXG4gICAgICAgICAgcmFuZ2Uuc2V0U3RhcnRBZnRlcihodG1sKTtcbiAgICAgICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgICAgc2VsLmFkZFJhbmdlKHJhbmdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBzYXZlIHNlbGVjdGlvbiB3aGVuIHRoZSBlZGl0b3IgaXMgZm9jdXNzZWQgb3V0XG4gICAqL1xuICBwdWJsaWMgc2F2ZVNlbGVjdGlvbiA9IChlbDogRWxlbWVudFJlZik6IHZvaWQgPT4ge1xuXG4gICAgaWYgKCF0aGlzLmVsZW1lbnRDb250YWluc1NlbGVjdGlvbihlbC5uYXRpdmVFbGVtZW50KSkge1xuICAgICAgcmV0dXJuOyAvLyBkbyBub3Qgc2F2ZSBicm93c2VyIHNlbGVjdGlvbnMgdGhhdCBhcmUgb3V0c2lkZSB0aGUgZWRpdG9yXG4gICAgfVxuICAgIGlmICh0aGlzLmRvYy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgIGNvbnN0IHNlbCA9IHRoaXMuZG9jLmdldFNlbGVjdGlvbigpO1xuICAgICAgaWYgKHNlbC5nZXRSYW5nZUF0ICYmIHNlbC5yYW5nZUNvdW50KSB7XG4gICAgICAgIHRoaXMuc2F2ZWRTZWxlY3Rpb24gPSBzZWwuZ2V0UmFuZ2VBdCgwKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFRleHQgPSBzZWwudG9TdHJpbmcoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbiAmJiB0aGlzLmRvYy5jcmVhdGVSYW5nZSkge1xuICAgICAgdGhpcy5zYXZlZFNlbGVjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2F2ZWRTZWxlY3Rpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc1NlbGVjdGlvbihlbCkge1xuICAgIGlmICghZWwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgdmlldyA9IHRoaXMuZG9jLmRlZmF1bHRWaWV3O1xuICAgIGNvbnN0IHNlbCA9IHZpZXcuZ2V0U2VsZWN0aW9uKCk7XG5cbiAgICBpZiAoc2VsICYmIHNlbC5yYW5nZUNvdW50ID4gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuaXNPckNvbnRhaW5zRG9tRWxlbShzZWwuZ2V0UmFuZ2VBdCgwKS5jb21tb25BbmNlc3RvckNvbnRhaW5lciwgZWwpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc09yQ29udGFpbnNEb21FbGVtKG5vZGUsIGNvbnRhaW5lcikge1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBpZiAobm9kZSA9PT0gY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlc3RvcmUgc2VsZWN0aW9uIHdoZW4gdGhlIGVkaXRvciBpcyBmb2N1c2VkIGluXG4gICAqXG4gICAqIHNhdmVkIHNlbGVjdGlvbiB3aGVuIHRoZSBlZGl0b3IgaXMgZm9jdXNlZCBvdXRcbiAgICovXG4gIHJlc3RvcmVTZWxlY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuc2F2ZWRTZWxlY3Rpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvYy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYCoqKlJlc3RvcmluZyBzZWxlY3Rpb24gOiAke3RoaXMuc2F2ZWRTZWxlY3Rpb24uc3RhcnRDb250YWluZXIubm9kZU5hbWV9ICR7dGhpcy5zYXZlZFNlbGVjdGlvbi5lbmRDb250YWluZXIubm9kZU5hbWV9YCk7XG4gICAgICAgIGNvbnN0IHNlbCA9IHRoaXMuZG9jLmdldFNlbGVjdGlvbigpO1xuICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgIHNlbC5hZGRSYW5nZSh0aGlzLnNhdmVkU2VsZWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbiAvKiYmIHRoaXMuc2F2ZWRTZWxlY3Rpb24uc2VsZWN0Ki8pIHtcbiAgICAgICAgLy8gdGhpcy5zYXZlZFNlbGVjdGlvbi5zZWxlY3QoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2V0VGltZW91dCB1c2VkIGZvciBleGVjdXRlICdzYXZlU2VsZWN0aW9uJyBtZXRob2QgaW4gbmV4dCBldmVudCBsb29wIGl0ZXJhdGlvblxuICAgKi9cbiAgcHVibGljIGV4ZWN1dGVJbk5leHRRdWV1ZUl0ZXJhdGlvbihjYWxsYmFja0ZuOiAoLi4uYXJnczogYW55W10pID0+IGFueSwgdGltZW91dCA9IDFlMik6IHZvaWQge1xuICAgIHNldFRpbWVvdXQoY2FsbGJhY2tGbiwgdGltZW91dCk7XG4gIH1cblxuICAvKiogY2hlY2sgYW55IHNlbGVjdGlvbiBpcyBtYWRlIG9yIG5vdCAqL1xuICBwcml2YXRlIGNoZWNrU2VsZWN0aW9uKCk6IGFueSB7XG5cbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSB0aGlzLnNhdmVkU2VsZWN0aW9uLnRvU3RyaW5nKCk7XG5cbiAgICBpZiAoc2VsZWN0ZWRUZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBTZWxlY3Rpb24gTWFkZScpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGxvYWQgZmlsZSB0byB1cGxvYWRVcmxcbiAgICogQHBhcmFtIGZpbGUgVGhlIGZpbGVcbiAgICovXG4gIHVwbG9hZEltYWdlKGZpbGU6IEZpbGUpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxVcGxvYWRSZXNwb25zZT4+IHtcblxuICAgIGNvbnN0IHVwbG9hZERhdGE6IEZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICB1cGxvYWREYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUsIGZpbGUubmFtZSk7XG5cbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8VXBsb2FkUmVzcG9uc2U+KHRoaXMudXBsb2FkVXJsLCB1cGxvYWREYXRhLCB7XG4gICAgICByZXBvcnRQcm9ncmVzczogdHJ1ZSxcbiAgICAgIG9ic2VydmU6ICdldmVudHMnLFxuICAgICAgd2l0aENyZWRlbnRpYWxzOiB0aGlzLnVwbG9hZFdpdGhDcmVkZW50aWFscyxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgaW1hZ2Ugd2l0aCBVcmxcbiAgICogQHBhcmFtIGltYWdlVXJsIFRoZSBpbWFnZVVybC5cbiAgICovXG4gIGluc2VydEltYWdlKGltYWdlVXJsOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpZCA9IHV1aWQoKTtcbiAgICBjb25zdCBkaXYgPSBgXG4gICAgPGZpZ3VyZSBpZD0ke2lkfSBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyXCIgY29udGVudGVkaXRhYmxlPVwiZmFsc2VcIiA+XG4gICAgPGltZyBzcmM9XCIke2ltYWdlVXJsfVwiICAgc3R5bGU9XCJtYXJnaW46MCBhdXRvXCI+XG4gICAgPC9maWd1cmU+XG4gICAgPGJyPlxuICAgIGA7XG4gICAgdGhpcy5pbnNlcnRIdG1sKGRpdik7XG4gICAgLy8gdGhpcy5kb2MuZ2V0RWxlbWVudEJ5SWQoYGNsb3NlLSR7aWR9YCkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgLy8gICBjb25zdCBlbGUgPSB0aGlzLmRvYy5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgLy8gICBpZiAoZWxlKSB7XG4gICAgLy8gICAgIGVsZS5yZW1vdmUoKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9KVxuICB9XG5cbiAgc2V0RGVmYXVsdFBhcmFncmFwaFNlcGFyYXRvcihzZXBhcmF0b3I6IHN0cmluZykge1xuICAgIHRoaXMuZWRpdENtZCgnZGVmYXVsdFBhcmFncmFwaFNlcGFyYXRvcicsIHNlcGFyYXRvcik7XG4gIH1cblxuICBjcmVhdGVDdXN0b21DbGFzcyhjdXN0b21DbGFzczogQ3VzdG9tQ2xhc3MpIHtcbiAgICBsZXQgbmV3VGFnID0gdGhpcy5zZWxlY3RlZFRleHQ7XG4gICAgaWYgKGN1c3RvbUNsYXNzKSB7XG4gICAgICBjb25zdCB0YWdOYW1lID0gY3VzdG9tQ2xhc3MudGFnID8gY3VzdG9tQ2xhc3MudGFnIDogJ3NwYW4nO1xuICAgICAgbmV3VGFnID0gJzwnICsgdGFnTmFtZSArICcgY2xhc3M9XCInICsgY3VzdG9tQ2xhc3MuY2xhc3MgKyAnXCI+JyArIHRoaXMuc2VsZWN0ZWRUZXh0ICsgJzwvJyArIHRhZ05hbWUgKyAnPic7XG4gICAgfVxuICAgIHRoaXMuaW5zZXJ0SHRtbChuZXdUYWcpO1xuICB9XG5cbiAgaW5zZXJ0VmlkZW8odmlkZW9Vcmw6IHN0cmluZykge1xuICAgIGlmICh2aWRlb1VybC5tYXRjaCgnd3d3LnlvdXR1YmUuY29tJykpIHtcbiAgICAgIHRoaXMuaW5zZXJ0WW91VHViZVZpZGVvVGFnKHZpZGVvVXJsKTtcbiAgICB9XG4gICAgaWYgKHZpZGVvVXJsLm1hdGNoKCd2aW1lby5jb20nKSkge1xuICAgICAgdGhpcy5pbnNlcnRWaW1lb1ZpZGVvVGFnKHZpZGVvVXJsKTtcbiAgICB9XG4gIH1cblxuICBpbnNlcnRBcmJpdHJhcnlIdG1sKGh0bWw6IHN0cmluZykge1xuICAgIHRoaXMuaW5zZXJ0SHRtbChodG1sKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5zZXJ0WW91VHViZVZpZGVvVGFnKHZpZGVvVXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBpZCA9IHZpZGVvVXJsLnNwbGl0KCd2PScpWzFdO1xuICAgIGNvbnN0IHRodW1ibmFpbCA9IGBcbiAgICA8aWZyYW1lIHdpZHRoPVwiNTYwXCIgaGVpZ2h0PVwiMzE1XCJcbiAgICBzcmM9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8ke2lkfVwiXG4gICAgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3c9XCJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgY2xpcGJvYXJkLXdyaXRlOyBlbmNyeXB0ZWQtbWVkaWE7IGd5cm9zY29wZTsgcGljdHVyZS1pbi1waWN0dXJlXCJcbiAgICBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+XG4gICAgPGJyPlxuICAgIGA7XG4gICAgdGhpcy5pbnNlcnRIdG1sKHRodW1ibmFpbCk7XG4gIH1cblxuICBwcml2YXRlIGluc2VydFZpbWVvVmlkZW9UYWcodmlkZW9Vcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGlkID0gdmlkZW9Vcmwuc3BsaXQoJy5jb20vJylbMV07XG4gICAgY29uc3QgdGh1bWJuYWlsID0gYDxpZnJhbWUgc3JjPVwiaHR0cHM6Ly9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLyR7aWR9XCJcbiAgICB3aWR0aD1cIjY0MFwiIGhlaWdodD1cIjM2MFwiIGZyYW1lYm9yZGVyPVwiMFwiIGFsbG93PVwiYXV0b3BsYXk7IGZ1bGxzY3JlZW47IHBpY3R1cmUtaW4tcGljdHVyZVwiIGFsbCBvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+XG4gICAgPGJyPmA7XG4gICAgLy8gY29uc3Qgc3ViID0gdGhpcy5odHRwLmdldDxhbnk+KGBodHRwczovL3ZpbWVvLmNvbS9hcGkvb2VtYmVkLmpzb24/dXJsPSR7dmlkZW9Vcmx9YCkuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgIC8vICAgY29uc3QgaW1hZ2VVcmwgPSBkYXRhLnRodW1ibmFpbF91cmxfd2l0aF9wbGF5X2J1dHRvbjtcbiAgICAvLyAgIGNvbnN0IHRodW1ibmFpbCA9IGBcbiAgICAvLyAgIDxpZnJhbWUgd2lkdGg9XCI1NjBcIiBoZWlnaHQ9XCIzMTVcIlxuICAgIC8vICAgc3JjPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJHtpZH1cIlxuICAgIC8vICAgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3c9XCJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgY2xpcGJvYXJkLXdyaXRlOyBlbmNyeXB0ZWQtbWVkaWE7IGd5cm9zY29wZTsgcGljdHVyZS1pbi1waWN0dXJlXCJcbiAgICAvLyAgIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cbiAgICAvLyAgIGA7XG4gICAgLy8gICB0aGlzLmluc2VydEh0bWwodGh1bWJuYWlsKTtcbiAgICAvLyAgIHN1Yi51bnN1YnNjcmliZSgpO1xuICAgIC8vIH0pO1xuICAgIHRoaXMuaW5zZXJ0SHRtbCh0aHVtYm5haWwpO1xuICB9XG5cbiAgbmV4dE5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgcmV0dXJuIG5vZGUuZmlyc3RDaGlsZDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKG5vZGUgJiYgIW5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgIH1cbiAgICAgIGlmICghbm9kZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlU2VsZWN0ZWROb2RlcyhyYW5nZSwgaW5jbHVkZVBhcnRpYWxseVNlbGVjdGVkQ29udGFpbmVycykge1xuICAgIGxldCBub2RlID0gcmFuZ2Uuc3RhcnRDb250YWluZXI7XG4gICAgY29uc3QgZW5kTm9kZSA9IHJhbmdlLmVuZENvbnRhaW5lcjtcbiAgICBsZXQgcmFuZ2VOb2RlcyA9IFtdO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBhIHJhbmdlIHRoYXQgaXMgY29udGFpbmVkIHdpdGhpbiBhIHNpbmdsZSBub2RlXG4gICAgaWYgKG5vZGUgPT09IGVuZE5vZGUpIHtcbiAgICAgIHJhbmdlTm9kZXMgPSBbbm9kZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEl0ZXJhdGUgbm9kZXMgdW50aWwgd2UgaGl0IHRoZSBlbmQgY29udGFpbmVyXG4gICAgICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSBlbmROb2RlKSB7XG4gICAgICAgIHJhbmdlTm9kZXMucHVzaChub2RlID0gdGhpcy5uZXh0Tm9kZShub2RlKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBwYXJ0aWFsbHkgc2VsZWN0ZWQgbm9kZXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSByYW5nZVxuICAgICAgbm9kZSA9IHJhbmdlLnN0YXJ0Q29udGFpbmVyO1xuICAgICAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gcmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXIpIHtcbiAgICAgICAgcmFuZ2VOb2Rlcy51bnNoaWZ0KG5vZGUpO1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBhbmNlc3RvcnMgb2YgdGhlIHJhbmdlIGNvbnRhaW5lciwgaWYgcmVxdWlyZWRcbiAgICBpZiAoaW5jbHVkZVBhcnRpYWxseVNlbGVjdGVkQ29udGFpbmVycykge1xuICAgICAgbm9kZSA9IHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyO1xuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgcmFuZ2VOb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByYW5nZU5vZGVzO1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWROb2RlcygpIHtcbiAgICBjb25zdCBub2RlcyA9IFtdO1xuICAgIGlmICh0aGlzLmRvYy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgIGNvbnN0IHNlbCA9IHRoaXMuZG9jLmdldFNlbGVjdGlvbigpO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHNlbC5yYW5nZUNvdW50OyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgbm9kZXMucHVzaC5hcHBseShub2RlcywgdGhpcy5nZXRSYW5nZVNlbGVjdGVkTm9kZXMoc2VsLmdldFJhbmdlQXQoaSksIHRydWUpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzO1xuICB9XG5cbiAgcmVwbGFjZVdpdGhPd25DaGlsZHJlbihlbCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gICAgd2hpbGUgKGVsLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShlbC5maXJzdENoaWxkLCBlbCk7XG4gICAgfVxuICAgIHBhcmVudC5yZW1vdmVDaGlsZChlbCk7XG4gIH1cblxuICByZW1vdmVTZWxlY3RlZEVsZW1lbnRzKHRhZ05hbWVzKSB7XG4gICAgY29uc3QgdGFnTmFtZXNBcnJheSA9IHRhZ05hbWVzLnRvTG93ZXJDYXNlKCkuc3BsaXQoJywnKTtcbiAgICB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKS5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSAmJlxuICAgICAgICB0YWdOYW1lc0FycmF5LmluZGV4T2Yobm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkpID4gLTEpIHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBub2RlIGFuZCByZXBsYWNlIGl0IHdpdGggaXRzIGNoaWxkcmVuXG4gICAgICAgIHRoaXMucmVwbGFjZVdpdGhPd25DaGlsZHJlbihub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19