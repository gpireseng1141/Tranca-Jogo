import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Lobby from "./pages/Lobby.jsx";
import Table from "./pages/Table.jsx";
import Result from "./pages/Result.jsx";

export default function App() {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/salas" element={<Lobby />} />
    <Route path="/jogar" element={<Table />} />
    <Route path="/resultado" element={<Result />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}