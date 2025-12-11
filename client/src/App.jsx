import React, { useState } from "react";
import './App.css'
import AppRouter from './router/AppRouter';


import Home from "./pages/Home";

function App() {
  return (
    <div>
      <AppRouter />
    </div>
  );
}

export default App;
