import { Routes, Route } from 'react-router-dom';
import Home from "@/views/Home";
import Admin from '@/views/Admin';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}