"use client";
import React, {useState, useEffect} from "react";
import {usePopper} from "react-popper";
import {grey} from "./colors";
import ArrowUpIcon from "./img/ArrowUp";
import ArrowDownIcon from "./img/ArrowDown";
import ArrowLeftIcon from "./img/ArrowLeft";
import ArrowRightIcon from "./img/ArrowRight";
import TrashIcon from "./img/Trash";
import TextIcon from "./Text";
import MultiIcon from "./img/Multi";
import HashIcon from "./img/Hash";
import PlusIcon from "./img/Plus";
import {shortId} from "./utils";
import { Menu, MenuItem } from "@blueprintjs/core";
import { randomColor } from "./utils";

export default function Header({
  column: {id, created, label, dataType, getResizerProps, getHeaderProps},
  setSortBy,
  dataDispatch,
  setData,
  updateData,
  skipReset,
  headerColor,
  columnColor
}) {
  const [expanded, setExpanded] = useState(created || false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [inputRef, setInputRef] = useState(null);
  const {styles, attributes} = usePopper(referenceElement, popperElement, {
    placement: "bottom",
    strategy: "absolute"
  });
  const [header, setHeader] = useState(label);
  const [typeReferenceElement, setTypeReferenceElement] = useState(null);
  const [typePopperElement, setTypePopperElement] = useState(null);
  const [showType, setShowType] = useState(false);

  const buttons = [
    {
      onClick: (e) => {
        dataDispatch({type: "update_column_header", columnId: id, label: header});
        setSortBy([{id: id, desc: false}]);
        setExpanded(false);
      },
      icon: <ArrowUpIcon />,
      label: "Sort ascending"
    },
    {
      onClick: (e) => {
        dataDispatch({type: "update_column_header", columnId: id, label: header});
        setSortBy([{id: id, desc: true}]);
        setExpanded(false);
      },
      icon: <ArrowDownIcon />,
      label: "Sort descending"
    },
    {
      onClick: (e) => {
        dataDispatch({type: "update_column_header", columnId: id, label: header});
        dataDispatch({type: "add_column_to_left", columnId: id, focus: false});
        setExpanded(false);
      },
      icon: <ArrowLeftIcon />,
      label: "Insert left"
    },
    {
      onClick: (e) => {
        dataDispatch({type: "update_column_header", columnId: id, label: header});
        dataDispatch({type: "add_column_to_right", columnId: id, focus: false});
        setExpanded(false);
      },
      icon: <ArrowRightIcon />,
      label: "Insert right"
    },
    {
      onClick: (e) => {
        dataDispatch({type: "update_column_header", columnId: id, label: header});
        dataDispatch({type: "delete_column", columnId: id});
        setExpanded(false);
      },
      icon: <TrashIcon />,
      label: "Delete"
    }
  ];

  const types = [
    {
      onClick: (e) => {
        dataDispatch({type: "update_column_type", columnId: id, dataType: "select"});
        setShowType(false);
        setExpanded(false);
      },
      icon: <MultiIcon />,
      label: "Select"
    },
    {
      onClick: (e) => {
        dataDispatch({type: "update_column_type", columnId: id, dataType: "text"});
        setShowType(false);
        setExpanded(false);
      },
      icon: <TextIcon />,
      label: "Text"
    },
    {
      onClick: (e) => {
        dataDispatch({type: "update_column_type", columnId: id, dataType: "number"});
        setShowType(false);
        setExpanded(false);
      },
      icon: <HashIcon />,
      label: "Number"
    }
  ];

  let propertyIcon;
  switch (dataType) {
    case "number":
      propertyIcon = <HashIcon />;
      break;
    case "text":
      propertyIcon = <TextIcon />;
      break;
    case "select":
      propertyIcon = <MultiIcon />;
      break;
    default:
      break;
  }

  useEffect(() => {
    if (created) {
      setExpanded(true);
    }
  }, [created]);

  useEffect(() => {
    setHeader(label);
  }, [label]);

  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
      inputRef.select();
    }
  }, [inputRef]);

  const typePopper = usePopper(typeReferenceElement, typePopperElement, {
    placement: "right",
    strategy: "fixed"
  });

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      dataDispatch({type: "update_column_header", columnId: id, label: header});
      setExpanded(false);
    }
  }

  function handleChange(e) {
    setHeader(e.target.value);
  }

  function handleBlur(e) {
    e.preventDefault();
    dataDispatch({type: "update_column_header", columnId: id, label: header});
  }

  return id !== 999999 ? (
    <>
      <div
        {...getHeaderProps({style: {display: "inline-block", backgroundColor: columnColor || headerColor || "#e6f7ff"}})}
        className='th noselect'>
        <div className='th-content' onClick={() => setExpanded(true)} ref={setReferenceElement}>
          <span className='svg-icon svg-gray icon-margin'>{propertyIcon}</span>
          {label}
        </div>
        <div {...getResizerProps()} className='resizer' />
      </div>
      {expanded && <div className='overlay' onClick={() => setExpanded(false)} />}
      {expanded && (
        <div 
          ref={setPopperElement} 
          style={{
            ...styles.popper, 
            zIndex: 3,
            position: 'fixed',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} 
          {...attributes.popper}
        >
          <div
            className='bg-white shadow-5 border-radius-md'
            style={{
              width: 240
            }}>
            <div style={{paddingTop: "0.75rem", paddingLeft: "0.75rem", paddingRight: "0.75rem"}}>
              <div className='is-fullwidth' style={{marginBottom: 12}}>
                <input
                  className='form-input'
                  ref={setInputRef}
                  type='text'
                  value={header}
                  style={{width: "100%"}}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div style={{marginLeft: "-0.75rem", marginRight: "-0.75rem"}}>
                {buttons.map((button, index) => (
                  <button
                    key={index}
                    className='sort-button'
                    onMouseDown={button.onClick}
                    style={{paddingLeft: "0.75rem", paddingRight: "0.75rem"}}>
                    <span className='svg-icon-sm svg-gray icon-margin'>{button.icon}</span>
                    {button.label}
                  </button>
                ))}
                <div style={{position: "relative"}} ref={setTypeReferenceElement}>
                  <button
                    className='sort-button'
                    onMouseDown={() => setShowType(true)}
                    style={{paddingLeft: "0.75rem", paddingRight: "0.75rem"}}>
                    <span className='svg-icon-sm svg-gray icon-margin'>{propertyIcon}</span>
                    {dataType === "select"
                      ? "Select"
                      : dataType === "text"
                      ? "Text"
                      : dataType === "number"
                      ? "Number"
                      : ""}
                  </button>
                  {showType && <div className='overlay' onClick={() => setShowType(false)} />}
                  {showType && (
                    <div
                      className='shadow-5 bg-white border-radius-md'
                      ref={setTypePopperElement}
                      {...typePopper.attributes.popper}
                      style={{
                        ...typePopper.styles.popper,
                        width: 150,
                        marginLeft: "1rem",
                        zIndex: 4,
                        position: 'fixed',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                      }}>
                      {types.map((type, index) => (
                        <button
                          key={index}
                          className='sort-button'
                          onMouseDown={type.onClick}
                          style={{paddingLeft: "0.75rem", paddingRight: "0.75rem"}}>
                          <span className='svg-icon-sm svg-gray icon-margin'>{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <div
      {...getHeaderProps({style: {display: "inline-block", backgroundColor: columnColor || headerColor || "#e6f7ff"}})}
      className='th noselect'>
      <div
        className='th-content'
        style={{display: "flex", justifyContent: "center"}}
        onClick={(e) => dataDispatch({type: "add_column_to_left", columnId: 999999, focus: true})}>
        <span className='svg-icon-sm svg-gray'>
          <PlusIcon />
        </span>
      </div>
    </div>
  );
}
