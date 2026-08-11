import Button from "./Button";
import { useNavigate } from "react-router-dom";

function RoomFooter({game}) {
  const navigate = useNavigate();

  return (
    <footer>
      <hr />

      <Button
        text="🚪 Rời phòng"
        onClick={() => navigate("/lobby")}
      />
    </footer>
  );
}

export default RoomFooter;