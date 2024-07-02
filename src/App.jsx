import React, { useState } from "react";
import "./App.css";
import VideoEditor from "./pages/VideoEditor";
import ThemeSwitch from "./components/ThemeSwitch";

function App() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={`App ${isDark ? "dark" : "light"}`}>
      <ThemeSwitch isDark={isDark} setIsDark={setIsDark} />
      <VideoEditor sDark={isDark} />
    </div>
  );
}

export default App;
