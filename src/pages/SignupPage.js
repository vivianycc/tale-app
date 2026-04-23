import React, { useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { setDoc, doc } from "firebase/firestore";
import { getFirebase } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import LoginSignupForm from "../components/LoginSignupForm";

const StyledPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
export default function SignUpPage() {
  const { signup, user } = useAuth();
  const { firestore } = getFirebase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const onSubmit = (data) => {
    const { email, password } = data;
    setIsLoading(true);
    signup(email, password)
      .then((user) =>
        setDoc(doc(firestore, "users", user.uid), {
          name: user.displayName,
        })
      )
      .then(() => navigate("/pets/create"))
      .catch((error) => {
        switch (error.code) {
          case "auth/network-request-failed":
            alert("網路連線失敗，請確認網路狀態後再試");
            break;
          case "auth/invalid-password":
            alert("密碼至少 6 個字元");
            break;
          case "auth/invalid-email":
            alert("信箱格式不正確");
            break;
          case "auth/email-already-in-use":
            alert("信箱已有人使用");
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
        formType="signup"
        register={register}
        errors={errors}
        isValid={isValid}
        isLoading={isLoading}
        onSubmit={handleSubmit(onSubmit)}
      />
    </StyledPage>
  );
}
