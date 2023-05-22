import React, { useState, useRef } from 'react';
import './customAutoSuggest.css';
const CustomAutoSuggest = (props) => {
    let suggestions = props.suggestion || [];
    const editableDivRef = useRef();
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [currentValuee, setcurrentValuee] = useState();
    const [suggestionPosition, setSuggestionPosition] = useState({ left: 0, top: 0 });
    const handleKeyDown = (event) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedSuggestionIndex((prevIndex) => {
                if (prevIndex === -1) {
                    return filteredSuggestions.length - 1;
                }
                return Math.max(0, prevIndex - 1);
            });
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedSuggestionIndex((prevIndex) => {
                if (prevIndex === filteredSuggestions.length - 1) {
                    return -1;
                }
                return Math.min(filteredSuggestions.length - 1, prevIndex + 1);
            });
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const selectedSuggestion = filteredSuggestions[selectedSuggestionIndex];
            if (selectedSuggestion) {
                insertSuggestion(selectedSuggestion);
                setSelectedSuggestionIndex(-1);
            }
        }
        else if (event.key === "Backspace" && editableDivRef.current?.childNodes?.length <= 2 && editableDivRef.current?.childNodes?.length > 0) {
            const childNode = editableDivRef.current?.childNodes
            if (childNode[0]?.nodeName === "SPAN" ||
                (childNode[0]?.nodeName === "#text" && childNode[0]?.length === 0 && childNode[1]?.nodeName === "SPAN")) {
                event.target.textContent = ""
            }
        }
    };
    const handleInputChange = (e) => {
        const sel = window.getSelection();
        const currentNode = sel.anchorNode.textContent.trim();
        var words = currentNode.trim();
        const caretPosition = getCaretPosition();
        setSuggestionPosition(caretPosition);
        words = currentNode.split(/ |\\u00A0/);
        const currentWord = words[words.length - 1];
        setcurrentValuee(currentWord)
        const filtered = suggestions.filter((suggestion) =>
            suggestion.toLowerCase().startsWith(currentWord.trim().toLowerCase())
        )
        setFilteredSuggestions(filtered);
        setSelectedSuggestionIndex(-1);
    };
    const getCaretPosition = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            return { left: rect.left, top: rect.top + rect.height };
        }
        return { left: 0, top: 0 };
    };
    function setCursorPosition(element, offset) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(element, offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    const insertSuggestion = (replace) => {
        const sel = window.getSelection();
        const currentNode = sel.anchorNode;
        const caretOffset = sel.anchorOffset;
        if (currentNode && currentNode.nodeType === Node.TEXT_NODE) {
            const span = document.createElement('span');
            span.className = 'chip';
            span.contentEditable = 'false';
            span.textContent = replace;
            var strwithrepsecttocursor = currentNode.nodeValue.substring(0, caretOffset);
            var strwithrepsecttocursor2 = currentNode.nodeValue.substring(caretOffset, currentNode.nodeValue.length);
            let index = strwithrepsecttocursor.lastIndexOf(currentValuee);
            var finalstr = currentNode.nodeValue.substring(0, index);
            const textNode = document.createTextNode(finalstr);
            currentNode.parentNode.insertBefore(textNode, currentNode);
            currentNode.parentNode.insertBefore(span, currentNode);
            if ((strwithrepsecttocursor2.substring(0, 1)?.length === 1 && !(strwithrepsecttocursor2?.substring(0, 1) === " ")) || strwithrepsecttocursor2.substring(0, 1)?.length === 0) {
                strwithrepsecttocursor2 = \\\\u00A0 + strwithrepsecttocursor2;
            }
            const textNode1 = document.createTextNode(strwithrepsecttocursor2);
            currentNode.parentNode.insertBefore(textNode1, currentNode);
            setCursorPosition(textNode1, 0, replace.length);
            currentNode.parentNode.removeChild(currentNode);
        }
        setFilteredSuggestions([]);
    };
    return (
        <div className="suggestionMainContainer">
            <div contentEditable={true} ref={editableDivRef} onKeyDown={handleKeyDown} onInput={(e) => { handleInputChange(e); }} className="editable-div" suppressContentEditableWarning={true} />
            {
                filteredSuggestions.length > 0 ?
                    <div className="suggestionBox" style={{ position: 'absolute', left: suggestionPosition.left, top: suggestionPosition.top, border: '1px solid #ccc', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', zIndex: 100, }}>
                        {
                            filteredSuggestions?.map((suggestion, index) => (
                                <li key={index} style={{ background: selectedSuggestionIndex === index ? '#D3D3D3' : '', cursor:'pointer' }} onMouseDown={() => insertSuggestion(suggestion)}>
                                    {suggestion}
                                </li>
                            ))
                        }
                    </div>
                    :
                    ""
            }
        </div>
    );
};
export default CustomAutoSuggest;