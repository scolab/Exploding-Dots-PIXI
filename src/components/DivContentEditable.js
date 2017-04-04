import React, {Component} from 'react';

export default class DivContentEditable extends Component {
    constructor() {
        super();
        this.emitChange = this.emitChange.bind(this);
        this.caretOffset = 0;
    }

    render() {
        var { tagName, html, ...props } = this.props;
        return React.createElement(
            tagName || 'div',
            {
                ...props,
                ref: (e) => this.htmlEl = e,
                onInput: this.emitChange,
                onKeyUp: this.emitChange,
                onPaste: this.emitChange,
                onInput: this.emitChange,
                onBlur: this.props.onBlur || this.emitChange,
                contentEditable: !this.props.disabled,
                dangerouslySetInnerHTML: {__html: html}
            },
            this.props.children);
    }

    shouldComponentUpdate(nextProps) {
        // We need not rerender if the change of props simply reflects the user's
        // edits. Rerendering in this case would make the cursor/caret jump.
        this.caretOffset = this.getCaretCharacterOffsetWithin(this.htmlEl);
        return (
            true
            // Rerender if there is no element yet... (somehow?)
            //!this.htmlEl
            // ...or if html really changed... (programmatically, not by user edit)
            //|| ( nextProps.html !== this.htmlEl.innerHTML && nextProps.html !== this.props.html )
            // ...or if editing is enabled or disabled.
            //|| this.props.disabled !== nextProps.disabled
        );
    }

    getCaretCharacterOffsetWithin(element) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            console.log('sel', sel);
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                console.log('range', range);
                var preCaretRange = range.cloneRange();
                console.log('preCaretRange', preCaretRange);
                preCaretRange.selectNodeContents(element);
                console.log('range.endContainer, range.endOffset', range.endContainer, range.endOffset);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                console.log('preCaretRange', preCaretRange);
                console.log('preCaretRange.toString()', preCaretRange.toString());
                caretOffset = preCaretRange.toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        console.log('caretOffset', caretOffset);
        return caretOffset;
    }

    componentDidUpdate() {
        if ( this.htmlEl && this.props.html !== this.htmlEl.innerHTML ) {
            // Perhaps React (whose VDOM gets outdated because we often prevent
            // rerendering) did not update the DOM. So we update it manually now.
            this.htmlEl.innerHTML = this.props.html;
        }
        //console.log(this.htmlEl.createRange());
        //console.log(this.htmlEl.selectionStart);
        var el = this.htmlEl;
        var range = document.createRange();
        var sel = window.getSelection();
        if(el.childNodes.length > 0) {
            //range.setStart(el.childNodes[0], el.childNodes[0].length);
            this.caretOffset = Math.min(this.caretOffset, el.childNodes[0].length);
            range.setStart(el.childNodes[0], this.caretOffset);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        /*if(this.htmlEl.createTextRange) {
            var range = this.htmlEl.createTextRange();
            range.move('character', 2);
            range.select();
        }
        else {
            if(this.htmlEl.selectionStart) {
                this.htmlEl.focus();
                this.htmlEl.setSelectionRange(2, 2);
            }
            else
                this.htmlEl.focus();
        }*/


    }

    emitChange(e) {
        //console.log('emitChange');
        if (!this.htmlEl) return;
        var html = this.htmlEl.innerHTML;
        html = html.replace('<br>','');
        if (this.props.onChange && html !== this.lastHtml) {
            e.target = { value: html };
            this.props.onChange(e);
        }
        this.lastHtml = html;
    }
}
