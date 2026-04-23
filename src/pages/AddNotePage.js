import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";
import Textarea from "../components/Textarea";
import { getFirebase } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

const StyledPage = styled.div`
  display: flex;
  align-items: center;
  height: 100vh;
  padding: 32px;
  background-color: var(--neutral-100);

  h1 {
    color: (--neutral-700);
    font-size: 24px;
    margin-bottom: 16px;
  }
  form {
    width: 100%;
  }
  .textarea {
    margin-bottom: 16px;
  }
`;

export default function AddNotePage() {
  const { state } = useLocation();
  const { currentPet, date, note: prevNote } = state || {};
  const [note, setNote] = useState(prevNote || "");
  const navigate = useNavigate();
  const { firestore } = getFirebase();
  const { user } = useAuth();

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const docRef = doc(
    firestore,
    "users",
    user.uid,
    "pets",
    currentPet,
    "diaries",
    date
  );
  // console.log("users", user.uid, "pets", currentPet, "diaries", date);

  const handleChange = (e) => {
    setNote(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setDoc(docRef, { note: note }, { merge: true }).then(() => navigate("/"));
  };
  return (
    <StyledPage>
      <form onSubmit={handleSubmit}>
        <h1>新增日記</h1>
        <Textarea value={note} onChange={handleChange} />
        <Button.Group>
          <Button
            label="取消"
            variant="secondary"
            onClick={() => navigate("/")}
          />
          <Button label="送出" type="submit" />
        </Button.Group>
      </form>
    </StyledPage>
  );
}
