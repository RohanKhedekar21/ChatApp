import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import SetAvatar from './pages/SetAvatar';
import Call from './pages/Call';

export default function App() {
  return <Routes>
    <Route path='/register' element={<Register />} />
    <Route path='/login' element={<Login />} />
    <Route path='/setAvatar' element={<SetAvatar />} />
    <Route path='/' element={<Chat />} />
  </Routes>
}