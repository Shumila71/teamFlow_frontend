import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatListPage from "../components/ChatListPage";
import ChatDetailsPage from "../components/ChatDetailsPage";

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // чекаем на авторизацию
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // если вдруг что не так
  if (!token) {
    return null;
  }

  //при переходе в чат
  if (chatId) {
    return <ChatDetailsPage chatId={chatId} />;
  }

  // список чата по дефолту
  return <ChatListPage />;
}