import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/chatList.css";
import { API_URL } from '../config';

export default function ChatListPage() {
  const [chats, setChats] = useState([]);
  const [newChatName, setNewChatName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const userId = Number(localStorage.getItem("userId"));
  

  useEffect(() => {
    fetch(`${API_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setChats(data);
        setLoading(false);
      })
      .catch(() => {
        setChats([]);
        setLoading(false);
      });
  }, [token]);

  const createChat = async () => {
    if (!newChatName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/chats/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newChatName.trim() }),
      });

      if (!res.ok) throw new Error("Ошибка создания чата");

      const createdChat = await res.json();
      setChats((prev) => [...prev, createdChat]);
      setNewChatName("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (chatId) => {
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Ошибка при удалении");

      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="chat-list-container">
      <h2>Список ваших чатов</h2>

      <div className="chat-create">
        <input
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          placeholder="Название нового чата"
        />
        <button onClick={createChat}>Создать чат</button>
      </div>
      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <ul className="chat-list">
          {chats.map((chat) => (
            <li key={chat.id} className="chat-card">
              <span className="chat-name">{chat.name}</span>
              <div className="chat-actions">
                <Link to={`/${chat.id}`}>
                  <button className="enter-btn">Войти</button>
                </Link>
                {chat.creator_id === userId && (
                  <button className="delete-btn" onClick={() => handleDelete(chat.id)}>
                    Удалить
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
