import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';
import "../styles/auth.css"; 

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("Login response data:", data);
      if (!res.ok) throw new Error(data.error || "Ошибка при входе");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Вход</h2>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-input-group">
          <label className="auth-label">Имя пользователя:</label>
          <input
            type="text"
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="auth-input-group">
          <label className="auth-label">Пароль:</label>
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="auth-button" type="submit">Войти</button>
      </form>
    </div>
  );
}
