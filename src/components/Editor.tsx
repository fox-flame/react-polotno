"use client";

import React from "react";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Toolbar } from "polotno/toolbar/toolbar";
import { PagesTimeline } from "polotno/pages-timeline";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { SidePanel, DEFAULT_SECTIONS } from "polotno/side-panel";
import { Workspace } from "polotno/canvas/workspace";

import { createStore } from "polotno/model/store";
import { TableSection } from "./index";
import { unstable_useHtmlTextRender } from "polotno/config";

// Register Table element.
import "./polotno-table";
import { ToolTipConfig } from "./polotno-table/tooltip";

unstable_useHtmlTextRender(true);

// create store
const store = createStore({
  // this is a demo key just for that project
  // (!) please don't use it in your projects
  // to create your own API key please go here: https://polotno.dev/cabinet
  key: process.env.REACT_APP_POLOTNO_KEY ?? "",
  // you can hide back-link on a paid license
  // but it will be good if you can keep it for Polotno project support
  showCredit: true,
});

// add to global namespace for debugging
(window as any).store = store;
store.addPage();

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
        <Toolbar store={store} />
        <Workspace store={store} components={ToolTipConfig} />
        <ZoomButtons store={store} />
        <PagesTimeline store={store} />
      </WorkspaceWrap>
    </PolotnoContainer>
  );
};

export default Editor;
