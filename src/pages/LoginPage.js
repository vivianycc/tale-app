import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import LoginSignupForm from "../components/LoginSignupForm";

const StyledPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm();

  useEffect(() => {
    if (user) {
      navigate(state?.path || "/");
    }
  }, [user]);

  const onSubmit = (data) => {
    const { email, password } = data;
    setIsLoading(true);
    login(email, password)
      .then(() => navigate(state?.path || "/"))
      .catch((error) => {
        switch (error.code) {
          case "auth/network-request-failed":
            alert("網路連線失敗，請確認網路狀態後再試");
            break;
          case "auth/wrong-password":
            alert("密碼錯誤");
            break;
          case "auth/user-not-found":
            alert("使用者不存在");
            break;
          case "auth/invalid-password":
            alert("密碼至少 6 個字元");
            break;
          case "auth/invalid-email":
            alert("信箱格式不正確");
            break;
          default:
            alert(error.message);
            return "";
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <StyledPage>
      <LoginSignupForm
        formType="login"
        register={register}
        errors={errors}
        isValid={isValid}
        isLoading={isLoading}
        onSubmit={handleSubmit(onSubmit)}
      />
    </StyledPage>
  );
}
