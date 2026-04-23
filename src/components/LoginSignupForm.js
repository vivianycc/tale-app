import React, { useRef } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Input from "./Input";
import Button from "./Button";
import Logotype from "../assets/logotype.svg";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 40px;
  width: 100%;
  max-width: 425px;
  img {
    width: 60vw;
    max-width: 200px;
    padding: 24px;
    margin: 0 auto;
  }

  p {
    font-size: 14px;
    color: var(--neutral-500);
    text-align: center;
  }
`;

export default function LoginSignupForm({
  onSubmit,
  formType = "signup",
  register,
  errors,
  isValid,
  isLoading = false,
}) {
  // console.log("email ref", emailRef);
  const emailPattern =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  return (
    <StyledForm onSubmit={onSubmit}>
      <img src={Logotype} alt="logotype" />
      <Input
        label="電子信箱"
        name="email"
        placeholder="請輸入電子信箱"
        error={errors?.email}
        {...register("email", {
          required: true,
          pattern: { value: emailPattern, message: "信箱格式不正確" },
        })}
        variant={errors?.email ? "warning" : "primary"}
      />

      <Input
        label="密碼"
        name="password"
        placeholder="請輸入密碼"
        type="password"
        error={errors?.password}
        {...register("password", {
          required: true,
          minLength: { value: 6, message: "密碼長度至少 6 個字母或數字" },
        })}
        variant={errors?.email ? "warning" : "primary"}
      />

      <Button
        type="submit"
        variant={isValid && !isLoading ? "primary" : "disabled"}
        label={isLoading ? "處理中..." : formType === "login" ? "登入" : "建立帳號"}
      />
      {formType === "login" ? (
        <p>
          尚未建立帳號？前往<Link to="/signup">建立帳號</Link>
        </p>
      ) : (
        <p>
          已有帳號？前往<Link to="/login">登入</Link>
        </p>
      )}
    </StyledForm>
  );
}
