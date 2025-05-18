import React, { useEffect, useState, useRef  } from "react";
import ChatWindow from "./ChatWindow";
import UserManagement from "./UserManagement";
import { API_URL } from '../config';

export default function ChatDetailsPage({ chatId }) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [chatName, setChatName] = useState("");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [availableHeight, setAvailableHeight] = useState(window.innerHeight);
  const API_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    //тянем чаты
    fetch(`${API_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        //чекаем название нашего
        const currentChat = data.find(chat => String(chat.id) === String(chatId));
        if (currentChat) {
          setChatName("Чат: "+currentChat.name);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [chatId, token]);
  //красиво вставляем без скроллов сайта
  useEffect(() => {
    function updateHeight() {
      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      const headerHeight = header ? header.offsetHeight : 0;
      const footerHeight = footer ? footer.offsetHeight : 0;
      const newHeight = window.innerHeight - headerHeight - footerHeight;
      setAvailableHeight(newHeight);
    }


    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        gap: "20px",
        height: availableHeight,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 3,
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <h2 style={{ paddingLeft: "15px",paddingTop: "15px", marginBottom: "10px" }}>
          {loading ? "Загрузка..." : chatName}
        </h2>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ChatWindow chatId={chatId} userId={userId} token={token} />
        </div>
      </div>
      <div
        style={{
          paddingRight: "15px",
          height: "100%",
          maxWidth:"30%",
          overflowY: "auto",
          minWidth:"25%"
        }}
      >
        <UserManagement chatId={chatId} />
      </div>
    </div>
  );
}
 