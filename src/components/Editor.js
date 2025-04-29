"use client";
// import all default sections
import { DEFAULT_SECTIONS } from "polotno/side-panel";

import React, { useEffect } from "react";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Toolbar } from "polotno/toolbar/toolbar";
import { PagesTimeline } from "polotno/pages-timeline";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { SidePanel } from "polotno/side-panel";
import { Workspace } from "polotno/canvas/workspace";

import { createStore } from "polotno/model/store";
import { TableSection } from "./TableSection";
import { SvgTableButton } from "./table-button";
import { ActionControls } from "./ActionControls";
import { unstable_useHtmlTextRender } from "polotno/config";

// Import our custom table components
import "./custom-table";

unstable_useHtmlTextRender(true);

// create store
const store = createStore({
  // this is a demo key just for that project
  // (!) please don't use it in your projects
  // to create your own API key please go here: https://polotno.dev/cabinet
  key: process.env.REACT_APP_POLOTNO_KEY,
  // you can hide back-link on a paid license
  // but it will be good if you can keep it for Polotno project support
  showCredit: true,
});

// add to global namespace for debugging
window.store = store;
const page = store.addPage();

// we will have just two sections
const sections = [TableSection, ...DEFAULT_SECTIONS];

export const Editor = () => {
  return (
    <PolotnoContainer style={{ width: "100vw", height: "100vh" }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/@blueprintjs/core@latest/lib/css/blueprint.css"
      />
      <SidePanelWrap>
        <SidePanel store={store} sections={sections} defaultSection="table" />
      </SidePanelWrap>
      <WorkspaceWrap>
        <Toolbar
          store={store}
          components={{ SvgTableButton, ActionControls }}
        />
        <Workspace store={store} />
        <ZoomButtons store={store} />
        <PagesTimeline store={store} />
      </WorkspaceWrap>
    </PolotnoContainer>
  );
};

export default Editor;
