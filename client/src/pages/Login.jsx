import Button from "../components/Button";
import Input from "../components/Input";

function Login() {
  return (
    <>
      <h1>Đăng nhập</h1>

      <Input placeholder="Email" />

      <br />
      <br />

      <Input
        type="password"
        placeholder="Mật khẩu"
      />

      <br />
      <br />

      <Button text="Đăng nhập" />
    </>
  );
}

export default Login;