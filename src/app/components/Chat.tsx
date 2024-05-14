'use client'
import { onSnapshot, collection, doc, addDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa';
import { db } from '../firebase';
import { useAppContext } from '@/context/AppContext';

type Message = {
  text: string;
  sender: string;
  createdAt: Timestamp;
}

const Chat = () => {
  const { selectedRoom } = useAppContext();
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);


  //各Roomにおけるメッセージを取得
  useEffect(() => {
    if (selectedRoom) {
      const fetchMessages = async () => {
        const roomDocRef = collection(db, "rooms", selectedRoom);
        const messageCollectionRef = collection(roomDocRef, "messages");

        const q = query(messageCollectionRef, orderBy("createdAt"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
          setMessages(newMessages);
        });

        return () => {
          unsubscribe();
        }
      }
      fetchMessages();
    }

  }, [selectedRoom]);

  const sendMessage = async () => {
    if (inputMessage.trim()) return;

    const messageDate = {
      text: inputMessage,
      sender: "user",
      createdAt: serverTimestamp,
    }


    //メッセージをFirestoreに保存する
    const roomDocRef = doc(db, "rooms", "VmqKPEuzS3ccVUOTSs7U6OA3Drs1");
    const messageCollectionRef = collection(roomDocRef, "messages")
    await addDoc(messageCollectionRef, messageDate);
  }

  return (
    <div className='bg-gray-300 h-full p-4 flex flex-col'>
      <h1 className='text-2xl text-white font-semibold mb-4'>Room 1</h1>
      <div className='flex-grow overflow-y-auto mb-4'>
        <div className='text-right'>
          <div className='bg-blue-500 inline-block rounded px-4 py-2 mb-2'>
            <p className='text-white font-medium'>Hello</p>
          </div>
        </div>
        <div className='text-left'>
          <div className='bg-green-500 inline-block rounded px-4 py-2 mb-2'>
            <p className='text-white font-medium'>How are you</p>
          </div>
        </div>
      </div>
      <div className='flex-shrink-0 relative'>
        <input type='text'
          placeholder='Send a Message'
          className='border-2 rounded w-full pr-10 focus:outline-none p-2 '
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button className='absolute inset-y-0 right-4 flex items-center'
          onClick={() => sendMessage()}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  )
}

export default Chat