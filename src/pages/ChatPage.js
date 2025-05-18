import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatListPage from "../components/ChatListPage";
import ChatDetailsPage from "../components/ChatDetailsPage";

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Проверяем авторизацию при монтировании компонента
    if (!token) {
      navigate("/login"); // Редирект на страницу входа
    }
  }, [token, navigate]);

  // Если пользователь не авторизован, показываем null (редирект уже сработает)
  if (!token) {
    return null;
  }

  // Если выбран конкретный чат — показываем детали
  if (chatId) {
    return <ChatDetailsPage chatId={chatId} />;
  }

  // Иначе — просто список чатов
  return <ChatListPage />;
}