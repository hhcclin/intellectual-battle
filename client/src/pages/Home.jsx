import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Button
        text="Đăng nhập"
        onClick={() => navigate("/login")}
      />

      <Button
        text="Đăng ký"
        onClick={() => navigate("/register")}
      />
    </>
  );
}

export default Home;