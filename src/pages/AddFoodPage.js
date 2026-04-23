import { useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Rating } from "@geist-ui/core";
import { getFirebase } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Textarea from "../components/Textarea";
import Button from "../components/Button";
import {
  NutritionChartCard,
  BasicInfoCard,
  IngredientCard,
  AdditivesCard,
  OtherElementsCard,
} from "../components/FoodNutrition";

const StyledPage = styled.div`
  min-height: 100vh;
  padding: 32px;
  background-color: var(--neutral-100);

  form {
    display: grid;
    gap: 16px;
    max-width: 1100px;
    margin: 0 auto;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .review-card {
    background: #fff;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .brand {
    font-size: 13px;
    color: var(--neutral-500);
    margin: 0;
    letter-spacing: 1px;
  }

  .field-label {
    font-size: 13px;
    color: var(--neutral-500);
    margin: 0 0 4px;
    letter-spacing: 1px;
  }

  .textarea {
    width: 100%;
    height: 120px;
  }

  .form-actions {
    margin-top: 8px;
    display: flex;
    justify-content: center;

    @media (min-width: 768px) {
      grid-column: 1 / -1;
    }
  }
  .form-actions .button-group {
    width: 100%;
    max-width: 400px;
  }
`;
export default function AddFoodPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    brand,
    id,
    currentPet,
    comment: prevComment,
    rating: prevRating,
  } = state || {};
  const [rating, setRating] = useState(prevRating || 0);
  const [, setRatingLocked] = useState(false);
  const [comment, setComment] = useState(prevComment || "");
  const { user } = useAuth();
  const { firestore } = getFirebase();

  if (!state) {
    return <Navigate to="/foods" replace />;
  }
  if (!user) {
    return <StyledPage>載入中...</StyledPage>;
  }

  const foodDoc = doc(
    firestore,
    "users",
    user.uid,
    "pets",
    currentPet,
    "foods",
    id,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newFood = {
      food: { ...state },
      rating: rating,
      comment: comment,
    };
    setDoc(foodDoc, newFood, { merge: true });

    navigate("/foods");
  };
  return (
    <StyledPage>
      <form onSubmit={handleSubmit}>
        <div className="col">
          <div className="review-card">
            <p className="brand">{brand}</p>
            <div>
              <p className="field-label">評分</p>
              <Rating
                onLockedChange={setRatingLocked}
                value={rating}
                onValueChange={setRating}
              />
            </div>
            <div>
              <p className="field-label">評語</p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <IngredientCard {...state} />
          {AdditivesCard(state)}
        </div>
        <div className="col">
          {NutritionChartCard(state)}
          <BasicInfoCard {...state} />
          <OtherElementsCard {...state} />
        </div>
        <div className="form-actions">
          <Button.Group>
            <Button
              label="取消"
              variant="secondary"
              onClick={() => navigate("/foods")}
            />
            <Button label="加入" type="submit" />
          </Button.Group>
        </div>
      </form>
    </StyledPage>
  );
}
