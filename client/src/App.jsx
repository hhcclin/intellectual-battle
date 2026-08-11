import { Routes, Route } from "react-router-dom";
import Game from "./pages/Game";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Lobby from "./pages/Lobby";
import CreateRoom from "./pages/CreateRoom";
import Room from "./pages/Room";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/room/:roomId/game" element={<Game />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/lobby" element={<Lobby />} />

      <Route path="/create-room" element={<CreateRoom />} />

      <Route path="/room/:roomId" element={<Room />} />

      {/* fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;