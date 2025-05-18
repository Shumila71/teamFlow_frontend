import React, { useEffect, useState, useRef } from "react";
import socket from "../utils/socket";
import EmojiPicker from "emoji-picker-react";
import { API_URL } from '../config';

export default function ChatWindow({ chatId, userId, token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  //фикс разных типов
  const numericUserId = Number(userId);

  //смайлы
  const [pickerPosition, setPickerPosition] = useState({ bottom: 0, left: 0 });
  const emojiButtonRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const openTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  //меняем позицию отображения стикеров
  useEffect(() => {
  if (showEmojiPicker && emojiButtonRef.current) {
    const buttonRect = emojiButtonRef.current.getBoundingClientRect();
    setPickerPosition({
      bottom: window.innerHeight - buttonRect.top + 3, 
      left: buttonRect.left - 10
    });
  }
}, [showEmojiPicker]);
  useEffect(() => {
    socket.connect();
    socket.emit("joinChat", chatId);

    fetch(`${API_URL}/api/messages/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        scrollToBottom();
      })
      .catch(() => {
        setMessages([]);
      });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.emit("leaveChat", chatId);
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [chatId, token]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("sendMessage", {
      chatId,
      senderId: userId,
      text: input.trim(),
      replyTo: null,
    });
    setInput("");
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const togglePicker = () => {
    if (showEmojiPicker) {
      // если закрываем, просто закрываем сразу
      clearTimeout(openTimeoutRef.current);
      setShowEmojiPicker(false);
    } else {
      // если открываем — с задержкой
      openTimeoutRef.current = setTimeout(() => {
        if (emojiButtonRef.current) {
          const buttonRect = emojiButtonRef.current.getBoundingClientRect();
          setPickerPosition({
            bottom: window.innerHeight - buttonRect.top + 3,
            left: buttonRect.left - 10,
          });
          setShowEmojiPicker(true);
        }
      }, 100); 
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const messageStyles = (senderId) => ({
    display: "flex",
    flexDirection: "column",
    maxWidth: "70%",
    padding: "8px 12px",
    borderRadius: "12px",
    marginBottom: "8px",
    wordBreak: "break-word",
    alignSelf: senderId === numericUserId ? "flex-end" : "flex-start",
    backgroundColor: senderId === numericUserId ? "#007bff" : "#e9ecef",
    color: senderId === numericUserId ? "white" : "black",
    border: senderId === numericUserId ? "none" : "1px solid #ddd",
  });

  return (
    <div className="chat-window" style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <div
        className="messages"
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((m) => (
          <div key={m.id} style={messageStyles(m.sender_id)}>
            {m.sender_id !== numericUserId && (
              <div style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "0.9em" }}>
                {m.username} {m.position_tag && ` (${m.position_tag})`}
              </div>
            )}
            {m.text}
            <div
              style={{
                fontSize: "0.7em",
                color: m.sender_id !== numericUserId ? "rgba(12, 13, 14, 0.7)" : "#999",
                textAlign: "right",
                marginTop: "4px",
              }}
            >
              {formatTime(m.timestamp || new Date().toISOString())}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPicker && (
        <div
          style={{
            position: 'fixed',
            bottom: `${pickerPosition.bottom}px`,
            left: `${pickerPosition.left}px`,
            zIndex: 1000,
          }}
        >
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            width={300}
            height={350}
          />
        </div>
      )}

      <div
        className="input-area"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px",
        }}
      >
        <button
          ref={emojiButtonRef}
          onClick={togglePicker}
          style={{
            "padding-left": "3px",
            border: "none",
            cursor: "pointer",
            fontSize: "22px",
            height: "36px",
            width:"36px",
            lineHeight: "36px",
          }}
        >😊</button>

        <input
          type="text"
          placeholder="Введите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{
            flexGrow: 1,
            padding: "8px",
            borderRadius: "20px",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "8px 16px",
            marginLeft: "8px",
            borderRadius: "20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Отправить
        </button>
      </div>
    </div>
  );
}
