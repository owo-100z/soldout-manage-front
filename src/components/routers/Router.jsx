import { Routes, Route } from 'react-router-dom';
import Home from "@/views/Home";
import Admin from '@/views/Admin';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/soldout-manage-front/admin" element={<Admin />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}