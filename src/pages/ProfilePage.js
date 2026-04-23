import React from "react";
import { useAuth } from "../hooks/useAuth";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { usePets } from "../hooks/usePets";
import Nav from "../components/Nav";
import Button from "../components/Button";
import PetItem from "../components/PetItem";

const StyledPage = styled.div`
  height: 100vh;
  margin-top: 56px;
  position: relative;
  flex: 1;
  .pet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h2 {
      font-size: 18px;
      font-weight: 400;
    }
  }
  .pets-body {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .empty-message {
      padding: 32px;
      text-align: center;
      color: var(--neutral-500);
    }
  }
  .logout-btn {
    width: 100%;
    position: absolute;
    bottom: 16px;
  }
`;

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { pets } = usePets(user.uid);

  const handleLogout = () => {
    logout().then(() => navigate("/login"));
  };

  const handleCreatePet = () => {
    navigate("/pets/create");
  };
  const handleEditPet = (pet) => {
    navigate("/pets/edit", { state: { pet: pet } });
    console.log(pet);
  };

  const Loading = () => {
    return <div>Loading</div>;
  };
  if (pets === null) {
    return <Loading />;
  }

  return (
    <StyledPage>
      <div className="pet-header">
        <h2>我的寵物</h2>
        <Button
          onClick={handleCreatePet}
          label="新增寵物"
          variant="secondary"
        />
      </div>
      <div className="pets-body">
        {Object.keys(pets).length === 0 ? (
          <div className="empty-message">沒有寵物資料，快新增一個吧</div>
        ) : (
          Object.values(pets).map((pet) => (
            <PetItem
              key={pet.name}
              pet={pet}
              bg
              action={() => handleEditPet(pet)}
            />
          ))
        )}
      </div>
      <Button
        onClick={handleLogout}
        label="登出"
        variant="warning"
        className="logout-btn"
      />
    </StyledPage>
  );
}
