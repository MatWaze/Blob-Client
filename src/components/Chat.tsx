import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Chat.css';

interface ChatProps {
    friendId: string;
    username: string;
}

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
}

const Chat: React.FC<ChatProps> = ({ friendId, username }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock loading messages or connecting to WS
    useEffect(() => {
        // In a real app, connect to WS here using friendId
        console.log(`Connecting to chat with ${username} (${friendId})`);
        
        // Mock initial message
        setMessages([
            {
                id: '1',
                senderId: friendId,
                text: `Hey ${user?.username}, let's play!`,
                timestamp: Date.now() - 10000
            }
        ]);

        return () => {
            console.log(`Disconnecting chat with ${username}`);
        };
    }, [friendId, username, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: user.id,
            text: inputText,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        
        // Mock reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                senderId: friendId,
                text: "I'm just a bot for now 🤖",
                timestamp: Date.now()
            }]);
        }, 1000);
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map(msg => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`message ${isMe ? 'me' : 'them'}`}>
                            <div className="message-content">
                                {msg.text}
                            </div>
                            <div className="message-time">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="chat-input-form">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <button type="submit" className="chat-send-btn">Send</button>
            </form>
        </div>
    );
};

export default Chat;
