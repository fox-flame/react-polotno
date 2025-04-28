import React, { useEffect, useState, useRef } from 'react';
import { SketchPicker } from 'react-color';

export default function FloatingColorPicker({ onColorChange }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);
  const savedSelection = useRef(null);

  useEffect(() => {
    function handleSelectionChange() {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        savedSelection.current = {
          range: selection.getRangeAt(0).cloneRange(),
          text: selection.toString()
        };
        setIsVisible(true);
      }
    }

    function handleClickOutside(event) {
      // Don't handle clicks on the button or picker
      if (buttonRef.current?.contains(event.target) || pickerRef.current?.contains(event.target)) {
        return;
      }

      // For other clicks, close the picker and clear selection
      setShowPicker(false);
      if (!savedSelection.current?.range.intersectsNode(event.target)) {
        setIsVisible(false);
        savedSelection.current = null;
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFormatClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Keep the button visible
    setIsVisible(true);
    setShowPicker(!showPicker);

    // Restore the selection
    if (savedSelection.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelection.current.range);
    }
  };

  const handleColorChange = (color) => {
    // Restore selection before applying color
    if (savedSelection.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelection.current.range);
      onColorChange(color);
    }
  };

  if (!isVisible && !showPicker) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div 
        ref={buttonRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleFormatClick}
          style={{
            padding: '8px 16px',
            backgroundColor: '#137cbd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            userSelect: 'none'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.5 11.5L3 18V21H6L12.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 10L14.5 7.5L16.5 9.5L14 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Format Selection
        </button>
      </div>
      
      {showPicker && (
        <div
          ref={pickerRef}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '8px',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: '4px',
            padding: '8px'
          }}
        >
          <SketchPicker
            color="#ffffff"
            onChange={handleColorChange}
            disableAlpha={true}
          />
          <button
            onClick={() => {
              handleColorChange({ hex: 'transparent' });
              setShowPicker(false);
            }}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '8px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              userSelect: 'none'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6L5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 6L19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Reset Color
          </button>
        </div>
      )}
    </div>
  );
} 