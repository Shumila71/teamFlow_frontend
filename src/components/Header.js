import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = String(localStorage.getItem("username"));

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const chat_list = () => {
    navigate("/");
  };

  return (
    <header style={{ padding: "10px"}}>
      <nav>
        {!token && (
          <>
            <div style={{display:"flex", flexDirection:"row", justifyContent:"space-around"}}>
              <Link to="/login" style={{ marginRight: "15px" }}>Войти</Link><Link to="/register">Регистрация</Link>
            </div>
          </>
        )}
        {token && (
          <>
            <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
              <div style={{justifySelf:"start"}}>Добро пожаловать, {username}!</div>
              <button onClick={chat_list} style={{position: "absolute",left: "50%",transform: "translateX(-50%)", height:"21.6px" }}>Чаты</button>
              <button onClick={logout}>Выйти</button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
