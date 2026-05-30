import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Dashboard from "./Dashboard";
import Top from "./Top";
import Create from "./Create";
import Question from "./Question";
import Answer from "./Answer";
import Login from "./Login";
import Mypage from "./Mypage"
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Top />} />
        <Route path="/create" element={<Create />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/question/:id" element={<Question />} />
        <Route path="/answer/:id" element={<Answer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
