import Button from "../components/Button";
import UserCard from "../components/UserCard";
import ActionMenu from "../components/ActionMenu";
import RoomList from "../components/RoomList";
import { useNavigate } from "react-router-dom";

function Lobby() {
    const navigate = useNavigate();
  return (
    <>
      <header>
        <h1>Lobby</h1>
        <p>Chào mừng đến Intellectual Battle</p>
      </header>

      <main>

        <UserCard />
        <hr />

        <ActionMenu />

        <hr />

        <h2>Danh sách phòng</h2>

        <RoomList />

      </main>
    </>
  );
}

export default Lobby;