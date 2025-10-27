import React, { JSX } from "react";
import Navigation from "./components/Layout/Navigation";
import Routes from "./Routes";

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="pt-16">
        <Routes />
      </main>
    </div>
  );
}

export default App;
