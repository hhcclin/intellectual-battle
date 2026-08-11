import Button from "./Button";
import { useNavigate } from "react-router-dom";

function ActionMenu() {

  const navigate = useNavigate();

  return (
    <>
      <Button
        text="Tạo phòng"
        onClick={() => navigate("/create-room")}
      />

      <br />
      <br />

      <Button text="Tìm phòng" />

      <br />
      <br />

      <Button text="Lịch sử" />

      <br />
      <br />

      <Button text="Hồ sơ" />
    </>
  );
}

export default ActionMenu;