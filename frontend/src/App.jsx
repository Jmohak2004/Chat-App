// client/src/App.jsx
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Connect to the server. Change the URL if your server is hosted elsewhere.
const socket = io('http://localhost:3000');

function App() {
  // State management
  const [name, setName] = useState('');
  const [hasName, setHasName] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // Effect to handle incoming messages
  useEffect(() => {
    // Listen for messages from the server
    socket.on('chat_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Load initial messages
    socket.on('load_messages', (loadedMessages) => {
      setMessages(loadedMessages);
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off('chat_message');
      socket.off('load_messages');
    };
  }, []);

  // Effect to scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setHasName(true);
    }
  };

  const handleMessageSend = (e) => {
    e.preventDefault();
    if (currentMessage.trim() && name) {
      // Send message to the server
      socket.emit('chat_message', {
        author: name,
        content: currentMessage,
      });
      setCurrentMessage(''); // Clear input field
    }
  };

  // Render name input screen if name is not set
  if (!hasName) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <form
          onSubmit={handleNameSubmit}
          className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">Enter Your Name</h1>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name..."
            autoFocus
          />
          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  // Render chat interface
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">MERN Chat</h1>
        <p className="text-center text-sm text-gray-400">Welcome, {name}!</p>
      </header>

      {/* Message List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.author === name ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.author === name
                  ? 'bg-blue-600 rounded-br-none'
                  : 'bg-gray-700 rounded-bl-none'
              }`}
            >
              <p className="font-bold text-sm">{msg.author}</p>
              <p className="text-white">{msg.content}</p>
              <p className="text-right text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for auto-scrolling */}
      </main>

      {/* Message Input Form */}
      <footer className="bg-gray-800 p-4">
        <form onSubmit={handleMessageSend} className="flex space-x-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            className="flex-1 px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;