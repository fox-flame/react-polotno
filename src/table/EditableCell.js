import React from "react";
import ContentEditable from "react-contenteditable";
import Relationship from "./Relationship";
import { usePopper } from "react-popper";
import { grey } from "./colors";
import PlusIcon from "./img/Plus";

export function EditableCell({
  value,
  onChange,
  onBlur,
  dataType,
  options = []
}) {
  const [selectRef, setSelectRef] = React.useState(null);
  const [selectPop, setSelectPop] = React.useState(null);
  const [showSelect, setShowSelect] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);
  const [addSelectRef, setAddSelectRef] = React.useState(null);

  const { styles, attributes } = usePopper(selectRef, selectPop, {
    placement: "bottom-start",
    strategy: "fixed"
  });

  function getColor() {
    let match = options.find((option) => option.label === value.value);
    return (match && match.backgroundColor) || grey(300);
  }

  React.useEffect(() => {
    if (addSelectRef && showAdd) {
      addSelectRef.focus();
    }
  }, [addSelectRef, showAdd]);

  function handleOptionKeyDown(e) {
    if (e.key === "Enter") {
      if (e.target.value !== "") {
        onBlur({ target: { value: e.target.value } });
      }
      setShowAdd(false);
    }
  }

  function handleAddOption() {
    setShowAdd(true);
  }

  function handleOptionBlur(e) {
    if (e.target.value !== "") {
      onBlur({ target: { value: e.target.value } });
    }
    setShowAdd(false);
  }

  let element;
  switch (dataType) {
    case "text":
      element = (
        <ContentEditable
          html={(value.value && value.value.toString()) || ""}
          onChange={onChange}
          onBlur={onBlur}
          className="data-input"
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word'
          }}
          onPaste={(e) => {
            e.preventDefault();
            // Get plain text and clean it
            const text = e.clipboardData.getData('text/plain');
            // Convert divs to line breaks and remove other HTML
            const cleanText = text
              .replace(/<div>/gi, '\n')
              .replace(/<\/div>/gi, '')
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .trim();
            document.execCommand('insertText', false, cleanText);
          }}
        />
      );
      break;
    case "number":
      element = (
        <ContentEditable
          html={(value.value && value.value.toString()) || ""}
          onChange={onChange}
          onBlur={onBlur}
          className="data-input text-align-right"
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word'
          }}
          onPaste={(e) => {
            e.preventDefault();
            // Get plain text and clean it
            const text = e.clipboardData.getData('text/plain');
            // Convert divs to line breaks and remove other HTML
            const cleanText = text
              .replace(/<div>/gi, '\n')
              .replace(/<\/div>/gi, '')
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .trim();
            document.execCommand('insertText', false, cleanText);
          }}
        />
      );
      break;
    case "select":
      element = (
        <>
          <div
            ref={setSelectRef}
            className="cell-padding d-flex cursor-default align-items-center flex-1"
            onClick={() => setShowSelect(true)}>
            {value.value && <Relationship value={value.value} backgroundColor={getColor()} />}
          </div>
          {showSelect && (
            <div className="overlay" onClick={() => setShowSelect(false)} />
          )}
          {showSelect && (
            <div
              className="shadow-5 bg-white border-radius-md"
              ref={setSelectPop}
              {...attributes.popper}
              style={{
                ...styles.popper,
                zIndex: 4,
                minWidth: 200,
                maxWidth: 320,
                padding: "0.75rem"
              }}>
              <div className="d-flex flex-wrap-wrap" style={{ marginTop: "-0.5rem" }}>
                {options.map((option) => (
                  <div
                    key={option.label}
                    className="cursor-pointer"
                    style={{ marginRight: "0.5rem", marginTop: "0.5rem" }}
                    onClick={() => {
                      onChange({ target: { value: option.label } });
                      onBlur({ target: { value: option.label } });
                      setShowSelect(false);
                    }}>
                    <Relationship value={option.label} backgroundColor={option.backgroundColor} />
                  </div>
                ))}
                <div
                  className="cursor-pointer"
                  style={{ marginRight: "0.5rem", marginTop: "0.5rem" }}
                  onClick={handleAddOption}>
                  <Relationship
                    value={
                      <span className="svg-icon-sm svg-text">
                        <PlusIcon />
                      </span>
                    }
                    backgroundColor={grey(200)}
                  />
                </div>
                {showAdd && (
                  <div
                    style={{
                      marginRight: "0.5rem",
                      marginTop: "0.5rem",
                      width: 120,
                      padding: "2px 4px",
                      backgroundColor: grey(200),
                      borderRadius: 4
                    }}>
                    <input
                      type="text"
                      className="option-input"
                      onBlur={handleOptionBlur}
                      ref={setAddSelectRef}
                      onKeyDown={handleOptionKeyDown}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );
      break;
    default:
      element = <span></span>;
      break;
  }

  return element;
} 