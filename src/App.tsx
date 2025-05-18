import React, { lazy, Suspense } from "react";

const Editor = lazy(() => import("./components/Editor"));

export const App: React.FC = () => {
  return (
    <div className="app">
      <Suspense fallback={<div>Loading...</div>}>
        <Editor />
      </Suspense>
    </div>
  );
};
