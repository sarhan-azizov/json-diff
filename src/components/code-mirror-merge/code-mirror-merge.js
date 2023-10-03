import { useState, useRef } from 'react';
import { EditorView } from 'codemirror';
import CodeMirrorMerge from 'react-codemirror-merge';
import { darcula } from '@uiw/codemirror-theme-darcula';
import sortJson from 'deep-sort-object';
import { EditorState } from '@codemirror/state';
import { langNames, langs, loadLanguage } from '@uiw/codemirror-extensions-langs';
import { linter } from "@codemirror/lint";
import { jsonParseLinter } from "@codemirror/lang-json";

import './code-mirror-merge.css';
import { jsonExample } from './example.js';

const Original = CodeMirrorMerge.Original;
const Modified = CodeMirrorMerge.Modified;

function JSONValid(str) {
    let result = null;
    try {
        result = JSON.parse(str);
    } catch (e) {
        return null;
    }
    return result;
}

export const CodeMirrorMergeComponent = () => {
    const $originalFieldRef = useRef(null);
    const [diffState, setDiffState] = useState({
        sourceValue: jsonExample,
        originalValue: jsonExample,

        isSourceValueValid: true,
        isOriginalValueValid: true,

        isOpenPopOver: false,
        highlightActiveLine: false,
        language: "json",
    });
    const language = langs[diffState.language]();
    const linting = linter(jsonParseLinter(), {
        delay: 300
    });

    loadLanguage(diffState.language);

    const handleFormatSourceJSON = () => {
        const parsedSourceValue = JSONValid(diffState.sourceValue);

        if (parsedSourceValue) {
            setDiffState(currentState => ({
                ...currentState,
                sourceValue: JSON.stringify(sortJson(parsedSourceValue), null, 2),
            }));
        }
    }

    const handleChangeHighlightActive = () => {
        setDiffState(currentState => ({
            ...currentState,
            highlightActiveLine: !currentState.highlightActiveLine
        }));
    }

    const handleChangeLanguage = (e) => {
        setDiffState(currentState => ({
            ...currentState,
            language: e.target.value
        }));
    }

    const handleChangSourceValue = (value) => {
        setDiffState(currentState => ({
            ...currentState,
            isSourceValueValid: JSONValid(value),
            sourceValue: value
        }));
    }

    const handleChangeOriginalValue = () => {
        const parsedOriginalFiedValue = JSONValid($originalFieldRef.current.value);

        if (parsedOriginalFiedValue && $originalFieldRef) {
            setDiffState(currentState => ({
                ...currentState,
                isOriginalValueValid: parsedOriginalFiedValue,
                originalValue: JSON.stringify(sortJson(parsedOriginalFiedValue), null, 2),
                isOpenPopOver: false,
            }));
        } else if (!parsedOriginalFiedValue) {
            setDiffState(currentState => ({
                ...currentState,
                isOriginalValueValid: parsedOriginalFiedValue,
            }));
        }
    }

    const handleToggleEditOriginalPopover = () => {
        setDiffState(currentState => ({
            ...currentState,
            isOpenPopOver: !currentState.isOpenPopOver
        }));
    };

    const handleClosePopOver = () => {
        setDiffState(currentState => ({
            ...currentState,
            isOpenPopOver: false
        }));
    };

    return (
        <>
            <div className="header">
                <div className="column">
                    <div className="tab">Source <span className="alert">(Modified)</span></div>
                    <div className={`tab action-button ${diffState.highlightActiveLine ? "action-button-active" : ""}`} style={{ width: "120px"}} onClick={handleChangeHighlightActive}>Highlight Active Line </div>
                    <div className={`tab action-button ${diffState.isSourceValueValid ? "" : "action-button-disabled"}`} style={{ width: "80px"}} onClick={handleFormatSourceJSON}>Format & Sort</div>
                    <div className="tab action-button action-button-status" style={{ width: "60px", color: diffState.isSourceValueValid ? "#29a721" : "#ff6262" }}>
                        {diffState.isSourceValueValid ? "Valid" : "Invalid"}
                    </div>
                    <div className="tab action-button" style={{ width: "80px", color: diffState.isOriginalValueValid ? "#29a721" : "#ff6262" }}>
                        <select onChange={handleChangeLanguage} className="language">
                            {langNames.map(lang => (<option key={lang} value={lang}>{lang}</option>))}
                        </select>
                    </div>
                </div>
                <div className="column">
                    <div className="tab original-tab">Original <span className="alert">(Read only)</span></div>
                    <div className="tab action-button editWrapper">
                        <div className="editText" onClick={handleToggleEditOriginalPopover}>Edit</div >
                        {diffState.isOpenPopOver && <div className="editPopOver">
                            <textarea className="editField" ref={$originalFieldRef} defaultValue={diffState.originalValue} />
                            <div className="actionEdit">
                                {!diffState.isOriginalValueValid && <div className="error">
                                    The JSON is invalid
                                </div>}
                                <button className="btn" onClick={handleClosePopOver}>Cancel</button>
                                <button className="btn" onClick={handleChangeOriginalValue}>Edit</button>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
            <CodeMirrorMerge revertControls="b-to-a" theme={darcula} highlightChanges={true} >
                <Original
                    value={diffState.sourceValue}
                    basicSetup={{
                        highlightActiveLineGutter: diffState.highlightActiveLine,
                        highlightActiveLine: diffState.highlightActiveLine
                    }}
                    extensions={[EditorView.lineWrapping, language, linting]}
                    onChange={handleChangSourceValue}
                />
                <Modified
                    value={diffState.originalValue}
                    basicSetup={{
                        highlightActiveLineGutter: diffState.highlightActiveLine,
                        highlightActiveLine: diffState.highlightActiveLine
                    }}
                    extensions={[EditorView.lineWrapping, language, EditorView.editable.of(false), EditorState.readOnly.of(true)]}
                />
            </CodeMirrorMerge>
        </>
    );
};