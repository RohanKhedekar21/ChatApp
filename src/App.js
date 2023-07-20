import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import SetAvatar from './pages/SetAvatar';

const CallComponent = lazy(() => import('./pages/Call'));

export default function App() {
  
  return <Routes>
    <Route path='/register' element={<Register />} />
    <Route path='/login' element={<Login />} />
    <Route path='/setAvatar' element={<SetAvatar />} />
    <Route path='/' element={<Chat />} />
    <Route path='/call' element={<CallComponent />} />
  </Routes>
}