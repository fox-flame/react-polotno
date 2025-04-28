import React, { useState, useRef } from 'react';
import { SketchPicker } from 'react-color';

export default function HeaderColorPicker({ color, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  const handleClickOutside = (e) => {
    if (pickerRef.current && !pickerRef.current.contains(e.target) && !buttonRef.current.contains(e.target)) {
      setShowPicker(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}>
      <div
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setShowPicker(!showPicker);
        }}
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: color || '#e6f7ff',
          border: '2px solid #fff',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      />
      
      {showPicker && (
        <div
          ref={pickerRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <SketchPicker
            color={color || '#e6f7ff'}
            onChange={(color) => onChange(color.hex)}
            disableAlpha={true}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
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