import React, { useEffect, useState, useCallback  } from "react";
import { API_URL } from '../config';
import "../styles/userlist.css";

function AddUserForm({ chatId, onUserAdded }) {
  const [newUser, setNewUser] = useState("");
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const addUser = async () => {
    if (!newUser.trim()) return;
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/chats/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId, username: newUser.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ошибка добавления пользователя");
      }

      setNewUser("");
      onUserAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h3>Пригласить пользователя</h3>
      <input
        type="text"
        placeholder="Имя пользователя для добавления"
        value={newUser}
        onChange={(e) => setNewUser(e.target.value)}
      />
      {error && <p className="user-management-error">{error}</p>}
      <button onClick={addUser}>Добавить пользователя</button>
    </div>
  );
}

function UserList({ chatId, users, refreshUsers }) {
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const [positionTags, setPositionTags] = useState({});
  const currentUserId = Number(localStorage.getItem("userId"));

  const handlePositionTagChange = (userId, value) => {
    setPositionTags((prev) => ({ ...prev, [userId]: value }));
  };

  const makeAdmin = async (userId) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/assign-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role: "admin" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ошибка назначения администратора");
      }

      refreshUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const revokeAdmin = async (userId) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/revoke-admin/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ошибка снятия роли администратора");
      }

      refreshUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeUser = async (userId) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ошибка удаления пользователя");
      }

      refreshUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const setTag = async (userId) => {
    const positionTag = positionTags[userId];
    if (!positionTag || !positionTag.trim()) return;
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/assign-position-tag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, positionTag }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ошибка установки должности");
      }

      setPositionTags((prev) => ({ ...prev, [userId]: "" }));
      refreshUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="user-management-container">
      <h3 className="user-management-title">Управление пользователями</h3>
      {error && <p className="user-management-error">{error}</p>}
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.user_id} className={`user-item ${user.role === 'admin' ? 'admin-user' : ''}`}>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-role">Роль: {user.role}</span>
              <span className="user-position">Должность: {user.position_tag || "без должности"}</span>
            </div>
            <div className="user-actions">
              {user.role !== "admin" && (
                <button className="make-admin-btn" onClick={() => makeAdmin(user.user_id)}>Сделать админом</button>
              )}
              {user.role === "admin" && user.user_id !== currentUserId && (
                <button className="revoke-admin-btn" onClick={() => revokeAdmin(user.user_id)}>Снять админку</button>
              )}
              {user.user_id !== currentUserId && (
                <button className="remove-user-btn" onClick={() => removeUser(user.user_id)}>Удалить из чата</button>
              )}
              
            </div>
            <div className="position-control">
                <input
                  type="text"
                  className="position-input"
                  placeholder="Установить должность"
                  value={positionTags[user.user_id] || ""}
                  onChange={(e) => handlePositionTagChange(user.user_id, e.target.value)}
                />
                <button className="set-position-btn" onClick={() => setTag(user.user_id)}>Установить</button>
              </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function UserManagement({ chatId }) {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    if (!chatId) return;
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка загрузки пользователей");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  }, [chatId, token]);

  useEffect(() => {
    fetchUsers();
  }, [chatId, fetchUsers]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <AddUserForm chatId={chatId} onUserAdded={fetchUsers} />
      <UserList chatId={chatId} users={users} refreshUsers={fetchUsers} />
    </div>
  );
}
