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
        // this.restoreSelection();  // Prevent lost focus issues --JCN
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1lZGl0b3Iuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIvaG9tZS9taXRlc2gvZGV2L2FuZ3VsYXItZWRpdG9yL2FuZ3VsYXItZWRpdG9yL3Byb2plY3RzL2FuZ3VsYXItZWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyLWVkaXRvci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9ELE9BQU8sRUFBRSxVQUFVLEVBQWEsTUFBTSxzQkFBc0IsQ0FBQztBQUU3RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFM0MsT0FBTyxFQUFFLEVBQUUsSUFBSSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFNbEMsTUFBTSxPQUFPLG9CQUFvQjtJQU8vQixZQUNVLElBQWdCLEVBQ0UsR0FBUTtRQUQxQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ0UsUUFBRyxHQUFILEdBQUcsQ0FBSztRQXFGcEM7O1dBRUc7UUFDSSxrQkFBYSxHQUFHLENBQUMsRUFBYyxFQUFRLEVBQUU7WUFFOUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3BELE9BQU8sQ0FBQyw2REFBNkQ7YUFDdEU7WUFDRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFO2dCQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNwQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRTtvQkFDcEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztp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QUVELHNCQUFzQixDQUFDLEVBQUU7UUFDdkIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQztRQUM3QixPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUN6QixNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDeEM7UUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxRQUFRO1FBQzdCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDdkMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUM7Z0JBQ3JCLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUN4RCxtREFBbUQ7Z0JBQ25ELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNuQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7O1lBOVZGLFVBQVU7OztZQVRGLFVBQVU7NENBbUJkLE1BQU0sU0FBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRWxlbWVudFJlZiwgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwRXZlbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBDdXN0b21DbGFzcyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IHY0IGFzIHV1aWQgfSBmcm9tICd1dWlkJztcbmV4cG9ydCBpbnRlcmZhY2UgVXBsb2FkUmVzcG9uc2Uge1xuICBpbWFnZVVybDogc3RyaW5nO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhckVkaXRvclNlcnZpY2Uge1xuXG4gIHNhdmVkU2VsZWN0aW9uOiBSYW5nZSB8IG51bGw7XG4gIHNlbGVjdGVkVGV4dDogc3RyaW5nO1xuICB1cGxvYWRVcmw6IHN0cmluZztcbiAgdXBsb2FkV2l0aENyZWRlbnRpYWxzOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvYzogYW55XG4gICkgeyB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVkIGNvbW1hbmQgZnJvbSBlZGl0b3IgaGVhZGVyIGJ1dHRvbnMgZXhjbHVkZSB0b2dnbGVFZGl0b3JNb2RlXG4gICAqIEBwYXJhbSBjb21tYW5kIHN0cmluZyBmcm9tIHRyaWdnZXJDb21tYW5kXG4gICAqL1xuICBleGVjdXRlQ29tbWFuZChjb21tYW5kOiBzdHJpbmcsIHBhcmFtOiBzdHJpbmcgPSBudWxsKSB7XG4gICAgY29uc3QgY29tbWFuZHMgPSBbJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ2g1JywgJ2g2JywgJ3AnLCAncHJlJ107XG4gICAgaWYgKGNvbW1hbmRzLmluY2x1ZGVzKGNvbW1hbmQpKSB7XG4gICAgICB0aGlzLmVkaXRDbWQoJ2Zvcm1hdEJsb2NrJywgY29tbWFuZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZWRpdENtZChjb21tYW5kLCBwYXJhbSk7XG4gIH1cblxuICBlZGl0Q21kKGNtZDogc3RyaW5nLCBwYXJhbTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gY29uc29sZS5sb2coYGV4ZWN1dGVDb21tYW5kOiAke2NvbW1hbmR9ICR7cGFyYW19YCk7XG4gICAgLy8gdGhpcy5yZXN0b3JlU2VsZWN0aW9uKCk7ICAvLyBQcmV2ZW50IGxvc3QgZm9jdXMgaXNzdWVzIC0tSkNOXG4gICAgLy8gY29uc29sZS5sb2coJ3Jlc3RvcmluZyBzZWxlY3Rpb24nKTtcbiAgICByZXR1cm4gISF0aGlzLmRvYy5leGVjQ29tbWFuZChjbWQsIGZhbHNlLCBwYXJhbSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIFVSTCBsaW5rXG4gICAqIEBwYXJhbSB1cmwgc3RyaW5nIGZyb20gVUkgcHJvbXB0XG4gICAqL1xuICBjcmVhdGVMaW5rKHVybDogc3RyaW5nKSB7XG4gICAgaWYgKCF1cmwuaW5jbHVkZXMoJ2h0dHAnKSkge1xuICAgICAgdGhpcy5lZGl0Q21kKCdjcmVhdGVsaW5rJywgdXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbmV3VXJsID0gJzxhIGhyZWY9XCInICsgdXJsICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyB0aGlzLnNlbGVjdGVkVGV4dCArICc8L2E+JztcbiAgICAgIHRoaXMuaW5zZXJ0SHRtbChuZXdVcmwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBpbnNlcnQgY29sb3IgZWl0aGVyIGZvbnQgb3IgYmFja2dyb3VuZFxuICAgKlxuICAgKiBAcGFyYW0gY29sb3IgY29sb3IgdG8gYmUgaW5zZXJ0ZWRcbiAgICogQHBhcmFtIHdoZXJlIHdoZXJlIHRoZSBjb2xvciBoYXMgdG8gYmUgaW5zZXJ0ZWQgZWl0aGVyIHRleHQvYmFja2dyb3VuZFxuICAgKi9cbiAgaW5zZXJ0Q29sb3IoY29sb3I6IHN0cmluZywgd2hlcmU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHJlc3RvcmVkID0gdGhpcy5yZXN0b3JlU2VsZWN0aW9uKCk7XG4gICAgaWYgKHJlc3RvcmVkKSB7XG4gICAgICBpZiAod2hlcmUgPT09ICd0ZXh0Q29sb3InKSB7XG4gICAgICAgIHRoaXMuZWRpdENtZCgnZm9yZUNvbG9yJywgY29sb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lZGl0Q21kKCdoaWxpdGVDb2xvcicsIGNvbG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IGZvbnQgbmFtZVxuICAgKiBAcGFyYW0gZm9udE5hbWUgc3RyaW5nXG4gICAqL1xuICBzZXRGb250TmFtZShmb250TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5lZGl0Q21kKCdmb250TmFtZScsIGZvbnROYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZm9udCBzaXplXG4gICAqIEBwYXJhbSBmb250U2l6ZSBzdHJpbmdcbiAgICovXG4gIHNldEZvbnRTaXplKGZvbnRTaXplOiBzdHJpbmcpIHtcbiAgICB0aGlzLmVkaXRDbWQoJ2ZvbnRTaXplJywgZm9udFNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSByYXcgSFRNTFxuICAgKiBAcGFyYW0gaHRtbCBIVE1MIHN0cmluZ1xuICAgKi9cbiAgaW5zZXJ0SHRtbChodG1sOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgaXNIVE1MSW5zZXJ0ZWQgPSB0aGlzLmVkaXRDbWQoJ2luc2VydEhUTUwnLCBodG1sKTtcblxuICAgIGlmICghaXNIVE1MSW5zZXJ0ZWQpIHtcbiAgICAgIC8vIHJldHJ5Li4uc29tZXRpbWVzIGl0cyBuZWVkZWRcbiAgICAgIGlzSFRNTEluc2VydGVkID0gdGhpcy5lZGl0Q21kKCdpbnNlcnRIVE1MJywgaHRtbCk7XG4gICAgICBpZiAoIWlzSFRNTEluc2VydGVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHBlcmZvcm0gdGhlIG9wZXJhdGlvbicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBzYXZlIHNlbGVjdGlvbiB3aGVuIHRoZSBlZGl0b3IgaXMgZm9jdXNzZWQgb3V0XG4gICAqL1xuICBwdWJsaWMgc2F2ZVNlbGVjdGlvbiA9IChlbDogRWxlbWVudFJlZik6IHZvaWQgPT4ge1xuXG4gICAgaWYgKCF0aGlzLmVsZW1lbnRDb250YWluc1NlbGVjdGlvbihlbC5uYXRpdmVFbGVtZW50KSkge1xuICAgICAgcmV0dXJuOyAvLyBkbyBub3Qgc2F2ZSBicm93c2VyIHNlbGVjdGlvbnMgdGhhdCBhcmUgb3V0c2lkZSB0aGUgZWRpdG9yXG4gICAgfVxuICAgIGlmICh0aGlzLmRvYy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgIGNvbnN0IHNlbCA9IHRoaXMuZG9jLmdldFNlbGVjdGlvbigpO1xuICAgICAgaWYgKHNlbC5nZXRSYW5nZUF0ICYmIHNlbC5yYW5nZUNvdW50KSB7XG4gICAgICAgIHRoaXMuc2F2ZWRTZWxlY3Rpb24gPSBzZWwuZ2V0UmFuZ2VBdCgwKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFRleHQgPSBzZWwudG9TdHJpbmcoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbiAmJiB0aGlzLmRvYy5jcmVhdGVSYW5nZSkge1xuICAgICAgdGhpcy5zYXZlZFNlbGVjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2F2ZWRTZWxlY3Rpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc1NlbGVjdGlvbihlbCkge1xuICAgIGlmICghZWwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgdmlldyA9IHRoaXMuZG9jLmRlZmF1bHRWaWV3O1xuICAgIGNvbnN0IHNlbCA9IHZpZXcuZ2V0U2VsZWN0aW9uKCk7XG5cbiAgICBpZiAoc2VsICYmIHNlbC5yYW5nZUNvdW50ID4gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuaXNPckNvbnRhaW5zRG9tRWxlbShzZWwuZ2V0UmFuZ2VBdCgwKS5jb21tb25BbmNlc3RvckNvbnRhaW5lciwgZWwpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc09yQ29udGFpbnNEb21FbGVtKG5vZGUsIGNvbnRhaW5lcikge1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBpZiAobm9kZSA9PT0gY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlc3RvcmUgc2VsZWN0aW9uIHdoZW4gdGhlIGVkaXRvciBpcyBmb2N1c2VkIGluXG4gICAqXG4gICAqIHNhdmVkIHNlbGVjdGlvbiB3aGVuIHRoZSBlZGl0b3IgaXMgZm9jdXNlZCBvdXRcbiAgICovXG4gIHJlc3RvcmVTZWxlY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuc2F2ZWRTZWxlY3Rpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvYy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYCoqKlJlc3RvcmluZyBzZWxlY3Rpb24gOiAke3RoaXMuc2F2ZWRTZWxlY3Rpb24uc3RhcnRDb250YWluZXIubm9kZU5hbWV9ICR7dGhpcy5zYXZlZFNlbGVjdGlvbi5lbmRDb250YWluZXIubm9kZU5hbWV9YCk7XG4gICAgICAgIGNvbnN0IHNlbCA9IHRoaXMuZG9jLmdldFNlbGVjdGlvbigpO1xuICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgIHNlbC5hZGRSYW5nZSh0aGlzLnNhdmVkU2VsZWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZG9jLmdldFNlbGVjdGlvbiAvKiYmIHRoaXMuc2F2ZWRTZWxlY3Rpb24uc2VsZWN0Ki8pIHtcbiAgICAgICAgLy8gdGhpcy5zYXZlZFNlbGVjdGlvbi5zZWxlY3QoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2V0VGltZW91dCB1c2VkIGZvciBleGVjdXRlICdzYXZlU2VsZWN0aW9uJyBtZXRob2QgaW4gbmV4dCBldmVudCBsb29wIGl0ZXJhdGlvblxuICAgKi9cbiAgcHVibGljIGV4ZWN1dGVJbk5leHRRdWV1ZUl0ZXJhdGlvbihjYWxsYmFja0ZuOiAoLi4uYXJnczogYW55W10pID0+IGFueSwgdGltZW91dCA9IDFlMik6IHZvaWQge1xuICAgIHNldFRpbWVvdXQoY2FsbGJhY2tGbiwgdGltZW91dCk7XG4gIH1cblxuICAvKiogY2hlY2sgYW55IHNlbGVjdGlvbiBpcyBtYWRlIG9yIG5vdCAqL1xuICBwcml2YXRlIGNoZWNrU2VsZWN0aW9uKCk6IGFueSB7XG5cbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSB0aGlzLnNhdmVkU2VsZWN0aW9uLnRvU3RyaW5nKCk7XG5cbiAgICBpZiAoc2VsZWN0ZWRUZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBTZWxlY3Rpb24gTWFkZScpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGxvYWQgZmlsZSB0byB1cGxvYWRVcmxcbiAgICogQHBhcmFtIGZpbGUgVGhlIGZpbGVcbiAgICovXG4gIHVwbG9hZEltYWdlKGZpbGU6IEZpbGUpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxVcGxvYWRSZXNwb25zZT4+IHtcblxuICAgIGNvbnN0IHVwbG9hZERhdGE6IEZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICB1cGxvYWREYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUsIGZpbGUubmFtZSk7XG5cbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8VXBsb2FkUmVzcG9uc2U+KHRoaXMudXBsb2FkVXJsLCB1cGxvYWREYXRhLCB7XG4gICAgICByZXBvcnRQcm9ncmVzczogdHJ1ZSxcbiAgICAgIG9ic2VydmU6ICdldmVudHMnLFxuICAgICAgd2l0aENyZWRlbnRpYWxzOiB0aGlzLnVwbG9hZFdpdGhDcmVkZW50aWFscyxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgaW1hZ2Ugd2l0aCBVcmxcbiAgICogQHBhcmFtIGltYWdlVXJsIFRoZSBpbWFnZVVybC5cbiAgICovXG4gIGluc2VydEltYWdlKGltYWdlVXJsOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpZCA9IHV1aWQoKTtcbiAgICBjb25zdCBkaXYgPSBgXG4gICAgPGZpZ3VyZSBpZD0ke2lkfSBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyXCIgY29udGVudGVkaXRhYmxlPVwiZmFsc2VcIiA+XG4gICAgPGltZyBzcmM9XCIke2ltYWdlVXJsfVwiICAgc3R5bGU9XCJtYXJnaW46MCBhdXRvXCI+XG4gICAgPC9maWd1cmU+XG4gICAgPGJyPlxuICAgIGA7XG4gICAgdGhpcy5pbnNlcnRIdG1sKGRpdik7XG4gICAgLy8gdGhpcy5kb2MuZ2V0RWxlbWVudEJ5SWQoYGNsb3NlLSR7aWR9YCkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgLy8gICBjb25zdCBlbGUgPSB0aGlzLmRvYy5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgLy8gICBpZiAoZWxlKSB7XG4gICAgLy8gICAgIGVsZS5yZW1vdmUoKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9KVxuICB9XG5cbiAgc2V0RGVmYXVsdFBhcmFncmFwaFNlcGFyYXRvcihzZXBhcmF0b3I6IHN0cmluZykge1xuICAgIHRoaXMuZWRpdENtZCgnZGVmYXVsdFBhcmFncmFwaFNlcGFyYXRvcicsIHNlcGFyYXRvcik7XG4gIH1cblxuICBjcmVhdGVDdXN0b21DbGFzcyhjdXN0b21DbGFzczogQ3VzdG9tQ2xhc3MpIHtcbiAgICBsZXQgbmV3VGFnID0gdGhpcy5zZWxlY3RlZFRleHQ7XG4gICAgaWYgKGN1c3RvbUNsYXNzKSB7XG4gICAgICBjb25zdCB0YWdOYW1lID0gY3VzdG9tQ2xhc3MudGFnID8gY3VzdG9tQ2xhc3MudGFnIDogJ3NwYW4nO1xuICAgICAgbmV3VGFnID0gJzwnICsgdGFnTmFtZSArICcgY2xhc3M9XCInICsgY3VzdG9tQ2xhc3MuY2xhc3MgKyAnXCI+JyArIHRoaXMuc2VsZWN0ZWRUZXh0ICsgJzwvJyArIHRhZ05hbWUgKyAnPic7XG4gICAgfVxuICAgIHRoaXMuaW5zZXJ0SHRtbChuZXdUYWcpO1xuICB9XG5cbiAgaW5zZXJ0VmlkZW8odmlkZW9Vcmw6IHN0cmluZykge1xuICAgIGlmICh2aWRlb1VybC5tYXRjaCgnd3d3LnlvdXR1YmUuY29tJykpIHtcbiAgICAgIHRoaXMuaW5zZXJ0WW91VHViZVZpZGVvVGFnKHZpZGVvVXJsKTtcbiAgICB9XG4gICAgaWYgKHZpZGVvVXJsLm1hdGNoKCd2aW1lby5jb20nKSkge1xuICAgICAgdGhpcy5pbnNlcnRWaW1lb1ZpZGVvVGFnKHZpZGVvVXJsKTtcbiAgICB9XG4gIH1cblxuICBpbnNlcnRBcmJpdHJhcnlIdG1sKGh0bWw6IHN0cmluZykge1xuICAgIHRoaXMuaW5zZXJ0SHRtbChodG1sKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5zZXJ0WW91VHViZVZpZGVvVGFnKHZpZGVvVXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBpZCA9IHZpZGVvVXJsLnNwbGl0KCd2PScpWzFdO1xuICAgIGNvbnN0IHRodW1ibmFpbCA9IGBcbiAgICA8aWZyYW1lIHdpZHRoPVwiNTYwXCIgaGVpZ2h0PVwiMzE1XCJcbiAgICBzcmM9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8ke2lkfVwiXG4gICAgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3c9XCJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgY2xpcGJvYXJkLXdyaXRlOyBlbmNyeXB0ZWQtbWVkaWE7IGd5cm9zY29wZTsgcGljdHVyZS1pbi1waWN0dXJlXCJcbiAgICBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+XG4gICAgPGJyPlxuICAgIGA7XG4gICAgdGhpcy5pbnNlcnRIdG1sKHRodW1ibmFpbCk7XG4gIH1cblxuICBwcml2YXRlIGluc2VydFZpbWVvVmlkZW9UYWcodmlkZW9Vcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGlkID0gdmlkZW9Vcmwuc3BsaXQoJy5jb20vJylbMV07XG4gICAgY29uc3QgdGh1bWJuYWlsID0gYDxpZnJhbWUgc3JjPVwiaHR0cHM6Ly9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLyR7aWR9XCJcbiAgICB3aWR0aD1cIjY0MFwiIGhlaWdodD1cIjM2MFwiIGZyYW1lYm9yZGVyPVwiMFwiIGFsbG93PVwiYXV0b3BsYXk7IGZ1bGxzY3JlZW47IHBpY3R1cmUtaW4tcGljdHVyZVwiIGFsbCBvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+XG4gICAgPGJyPmA7XG4gICAgLy8gY29uc3Qgc3ViID0gdGhpcy5odHRwLmdldDxhbnk+KGBodHRwczovL3ZpbWVvLmNvbS9hcGkvb2VtYmVkLmpzb24/dXJsPSR7dmlkZW9Vcmx9YCkuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgIC8vICAgY29uc3QgaW1hZ2VVcmwgPSBkYXRhLnRodW1ibmFpbF91cmxfd2l0aF9wbGF5X2J1dHRvbjtcbiAgICAvLyAgIGNvbnN0IHRodW1ibmFpbCA9IGBcbiAgICAvLyAgIDxpZnJhbWUgd2lkdGg9XCI1NjBcIiBoZWlnaHQ9XCIzMTVcIlxuICAgIC8vICAgc3JjPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJHtpZH1cIlxuICAgIC8vICAgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3c9XCJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgY2xpcGJvYXJkLXdyaXRlOyBlbmNyeXB0ZWQtbWVkaWE7IGd5cm9zY29wZTsgcGljdHVyZS1pbi1waWN0dXJlXCJcbiAgICAvLyAgIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cbiAgICAvLyAgIGA7XG4gICAgLy8gICB0aGlzLmluc2VydEh0bWwodGh1bWJuYWlsKTtcbiAgICAvLyAgIHN1Yi51bnN1YnNjcmliZSgpO1xuICAgIC8vIH0pO1xuICAgIHRoaXMuaW5zZXJ0SHRtbCh0aHVtYm5haWwpO1xuICB9XG5cbiAgbmV4dE5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgcmV0dXJuIG5vZGUuZmlyc3RDaGlsZDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKG5vZGUgJiYgIW5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgIH1cbiAgICAgIGlmICghbm9kZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlU2VsZWN0ZWROb2RlcyhyYW5nZSwgaW5jbHVkZVBhcnRpYWxseVNlbGVjdGVkQ29udGFpbmVycykge1xuICAgIGxldCBub2RlID0gcmFuZ2Uuc3RhcnRDb250YWluZXI7XG4gICAgY29uc3QgZW5kTm9kZSA9IHJhbmdlLmVuZENvbnRhaW5lcjtcbiAgICBsZXQgcmFuZ2VOb2RlcyA9IFtdO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBhIHJhbmdlIHRoYXQgaXMgY29udGFpbmVkIHdpdGhpbiBhIHNpbmdsZSBub2RlXG4gICAgaWYgKG5vZGUgPT09IGVuZE5vZGUpIHtcbiAgICAgIHJhbmdlTm9kZXMgPSBbbm9kZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEl0ZXJhdGUgbm9kZXMgdW50aWwgd2UgaGl0IHRoZSBlbmQgY29udGFpbmVyXG4gICAgICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSBlbmROb2RlKSB7XG4gICAgICAgIHJhbmdlTm9kZXMucHVzaChub2RlID0gdGhpcy5uZXh0Tm9kZShub2RlKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBwYXJ0aWFsbHkgc2VsZWN0ZWQgbm9kZXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSByYW5nZVxuICAgICAgbm9kZSA9IHJhbmdlLnN0YXJ0Q29udGFpbmVyO1xuICAgICAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gcmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXIpIHtcbiAgICAgICAgcmFuZ2VOb2Rlcy51bnNoaWZ0KG5vZGUpO1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBhbmNlc3RvcnMgb2YgdGhlIHJhbmdlIGNvbnRhaW5lciwgaWYgcmVxdWlyZWRcbiAgICBpZiAoaW5jbHVkZVBhcnRpYWxseVNlbGVjdGVkQ29udGFpbmVycykge1xuICAgICAgbm9kZSA9IHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyO1xuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgcmFuZ2VOb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByYW5nZU5vZGVzO1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWROb2RlcygpIHtcbiAgICBjb25zdCBub2RlcyA9IFtdO1xuICAgIGlmICh0aGlzLmRvYy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgIGNvbnN0IHNlbCA9IHRoaXMuZG9jLmdldFNlbGVjdGlvbigpO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHNlbC5yYW5nZUNvdW50OyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgbm9kZXMucHVzaC5hcHBseShub2RlcywgdGhpcy5nZXRSYW5nZVNlbGVjdGVkTm9kZXMoc2VsLmdldFJhbmdlQXQoaSksIHRydWUpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzO1xuICB9XG5cbiAgcmVwbGFjZVdpdGhPd25DaGlsZHJlbihlbCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gICAgd2hpbGUgKGVsLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShlbC5maXJzdENoaWxkLCBlbCk7XG4gICAgfVxuICAgIHBhcmVudC5yZW1vdmVDaGlsZChlbCk7XG4gIH1cblxuICByZW1vdmVTZWxlY3RlZEVsZW1lbnRzKHRhZ05hbWVzKSB7XG4gICAgY29uc3QgdGFnTmFtZXNBcnJheSA9IHRhZ05hbWVzLnRvTG93ZXJDYXNlKCkuc3BsaXQoJywnKTtcbiAgICB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKS5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSAmJlxuICAgICAgICB0YWdOYW1lc0FycmF5LmluZGV4T2Yobm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkpID4gLTEpIHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBub2RlIGFuZCByZXBsYWNlIGl0IHdpdGggaXRzIGNoaWxkcmVuXG4gICAgICAgIHRoaXMucmVwbGFjZVdpdGhPd25DaGlsZHJlbihub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19