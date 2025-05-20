import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate  } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/main.css";
import "./styles/chat.css";

const AuthRedirect = () => {
  const isLoggedIn = !!localStorage.getItem("token");   
  return isLoggedIn ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Header />
      <div className="app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ChatPage />} />
          <Route path="/:chatId" element={<ChatPage />} />
          <Route path="*" element={<AuthRedirect />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;