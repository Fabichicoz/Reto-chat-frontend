import  { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000");

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    socket.on("Mensaje", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("Notificaciónes", (notif) => {
      setMessages((prev) => [...prev, { text: notif, type: "Notificaciónes" }]);
    });

    socket.on("Historia", (history) => {
      setMessages(history);
    });

    return () => {
      socket.off("Mensaje");
      socket.off("Notificación");
      socket.off("Historia");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const msg = { text: message, type: "text" };
      socket.emit("Mensaje", msg);
      setMessages((prev) => [...prev, msg]);
      setMessage("");
    }
  };

  const sendImage = async () => {
    if (image) {
      const formData = new FormData();
      formData.append("imagen", image);
      try {
        const res = await axios.post("http://localhost:3000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const imageUrl = res.data.imageUrl;
        const msg = { text: imageUrl, type: "imagen" };
        socket.emit("Mensaje", msg);
        setMessages((prev) => [...prev, msg]);
        setImage(null);
      } catch (error) {
        console.error("Error uploading imagen", error);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {/* Encabezado */}
        <div className="chat-header">
          <h1>Chat en Vivo</h1>
          <p>Bienvenidos</p>
        </div>
  
        {/* Mensajes */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            msg.type === "text" ? (
              <div key={index} className="chat-bubble">{msg.text}</div>
            ) : msg.type === "image" ? (
              <div key={index} className="chat-image-container">
                <img
                  src={`http://localhost:3000${msg.text}`}
                  alt="Uploaded"
                  className="chat-image"
                />
              </div>
            ) : (
              <p key={index} className="chat-notification">{msg.text}</p>
            )
          ))}
        </div>
  
        {/* Input y Botones */}
        <div className="chat-input-container">
          <div className="input-section">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              className="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage} className="btn-primary">Enviar</button>
          </div>
          <div className="input-section">
            <label className="btn-secondary">
              Subir Imagen
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden-input"
              />
            </label>
            <button onClick={sendImage} className="btn-primary">Enviar Imagen</button>
          </div>
          <button
            onClick={() => setMessage("")}
            className="btn-danger"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  );  
};
  
  
export default App;
