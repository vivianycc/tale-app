import React, { useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getFirebase } from "../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import FoodRecordItem from "../components/FoodRecordItem";

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;
  padding: 32px;
  background-color: var(--neutral-100);

  h1 {
    font-size: 24px;
    color: var(--neutral-700);
    text-align: left;
    margin-bottom: 32px;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    input {
      width: 100%;
    }
    .portion-input {
      display: flex;
      align-items: center;
      gap: 16px;
      .input {
        flex: 1;
      }
    }
  }
`;

export default function AddFoodRecordPage() {
  const [form, setForm] = useState({
    portion: 30,
    time: dayjs().format("HH:mm"),
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { brand, product, flavor, calories, id, currentPet, date } =
    location.state || {};
  const { firestore } = getFirebase();
  const { user } = useAuth();

  if (!location.state) {
    return <Navigate to="/" replace />;
  }

  const diaryDoc = doc(
    firestore,
    "users",
    user.uid,
    "pets",
    currentPet,
    "diaries",
    date
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newRecord = {
      foodBrand: brand,
      foodProduct: product,
      foodFlavor: flavor,
      foodId: id,
      calories: calories,
      portion: form.portion,
      time: form.time,
    };

    const docSnap = await getDoc(diaryDoc);
    if (docSnap.data()?.foodRecord) {
      dayjs.extend(customParseFormat);
      const prevRecord = docSnap.data().foodRecord;
      const newRecords = [...prevRecord, newRecord].sort((a, b) =>
        dayjs(a.time, "HH:mm").isAfter(dayjs(b.time, "HH:mm")) ? 1 : -1
      );

      setDoc(diaryDoc, { foodRecord: newRecords }, { merge: true }).then(
        navigate("/")
      );
    } else {
      setDoc(diaryDoc, { foodRecord: [newRecord] }, { merge: true }).then(
        navigate("/")
      );
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <StyledPage>
      <form onSubmit={handleSubmit}>
        <h1>加入以下紀錄</h1>
        <FoodRecordItem
          info={{
            foodBrand: brand,
            foodProduct: product,
            foodFlavor: flavor,
            foodId: id,
            calories: calories,
            portion: form.portion,
            time: form.time,
          }}
        />
        <Input
          type="time"
          name="time"
          onChange={handleChange}
          value={form.time}
        />
        <div className="portion-input">
          <Input
            type="number"
            name="portion"
            onChange={handleChange}
            value={form.portion}
          />
          <p>公克</p>
        </div>
        <Button.Group>
          <Button
            label="取消"
            variant="secondary"
            onClick={() => navigate("/")}
          />
          <Button type="submit" label="送出" />
        </Button.Group>
      </form>
    </StyledPage>
  );
}
