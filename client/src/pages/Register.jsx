import Input from "../components/Input";
import Button from "../components/Button";

function Register() {
  return (
    <>
      <header>
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản Intellectual Battle</p>
      </header>

      <main>

        <Input placeholder="Tên người dùng" />

        <br />
        <br />

        <Input placeholder="Email" />

        <br />
        <br />

        <Input
          type="password"
          placeholder="Mật khẩu"
        />

        <br />
        <br />

        <Input
          type="password"
          placeholder="Nhập lại mật khẩu"
        />

        <br />
        <br />

        <Button text="Tạo tài khoản" />

      </main>
    </>
  );
}

export default Register;