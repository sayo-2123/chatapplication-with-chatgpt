'use client'
import { onSnapshot, collection, doc, addDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa';
import { db } from '../firebase';
import { useAppContext } from '@/context/AppContext';
import OpenAI from 'openai';
import LoadingIcons from 'react-loading-icons';

type Message = {
  text: string;
  sender: string;
  createdAt: Timestamp;
}

const Chat = () => {

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
    dangerouslyAllowBrowser: true
  });
  const { selectedRoom } = useAppContext();
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  //各Roomにおけるメッセージを取得
  useEffect(() => {
    if (selectedRoom) {
      const fetchMessages = async () => {
        const roomDocRef = doc(db, "rooms", selectedRoom);
        const messagesCollectionRef = collection(roomDocRef, "messages");

        const q = query(messagesCollectionRef, orderBy("createdAt"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
          setMessages(newMessages);
        });

        return () => {
          unsubscribe();
        };
      };

      fetchMessages();
    }
  }, [selectedRoom]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageDate = {
      text: inputMessage,
      sender: "user",
      createdAt: serverTimestamp(),
    }

    //メッセージをFirestoreに保存する
    const roomDocRef = doc(db, "rooms", selectedRoom!);
    const messageCollectionRef = collection(roomDocRef, "messages")
    await addDoc(messageCollectionRef, messageDate);

    setInputMessage("");
    setIsLoading(true);

    //openAIからの返信
    const gpt3Response = await openai.chat.completions.create({
      messages: [{ role: "user", content: inputMessage }],
      model: 'gpt-3.5-turbo',
    });

    setIsLoading(false);

    const botResponse = gpt3Response.choices[0].message.content;
    await addDoc(messageCollectionRef, {
      text: botResponse,
      sender: "bot",
      createdAt: serverTimestamp(),
    })
  }

  return (
    <div className='bg-gray-300 h-full p-4 flex flex-col'>
      <h1 className='text-2xl text-white font-semibold mb-4'>Room 1</h1>
      <div className='flex-grow overflow-y-auto mb-4'>
        {messages.map((message, index) => (
          <div key={index}
            className={message.sender === "user" ? "text-right" : "text-left"}
          >
            <div className={message.sender === "user"
              ? "bg-blue-500 inline-block rounded px-4 py-2 mb-2"
              : "bg-green-500 inline-block rounded px-4 py-2 mb-2"
            }
            >
              <p className='text-white'>{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && <LoadingIcons.TailSpin />}
      </div>

      <div className='flex-shrink-0 relative'>
        <input type='text'
          placeholder='Send a Message'
          className='border-2 rounded w-full pr-10 focus:outline-none p-2 '
          onChange={(e) => setInputMessage(e.target.value)}
          value={inputMessage}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button className='absolute inset-y-0 right-4 flex items-center'
          onClick={() => sendMessage()}>
          <FaPaperPlane />
        </button>
      </div>
    </div >
  )
}

export default Chat;