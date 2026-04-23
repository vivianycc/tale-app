import { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { Drawer, Input, Modal, Tabs, Rating } from "@geist-ui/core";
import { Search } from "react-feather";
import { getFirebase } from "../firebase";
import { onSnapshot, collection } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Nav from "../components/Nav";
import FoodItem from "../components/FoodItem";
import ActionButton from "../components/ActionButton";
import {
  NutritionChartCard,
  BasicInfoCard,
  IngredientCard,
  AdditivesCard,
  OtherElementsCard,
} from "../components/FoodNutrition";
import Button from "../components/Button";

const StyledFoodPage = styled.div`
  height: 100%;
  .items {
    height: 100%;
    padding-bottom: 128px;
    overflow: scroll;
  }
  .tabs.food-tabs {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .content {
    flex: 1;
    overflow: scroll;
    padding-bottom: 104px;
  }
  .rating.food-rating {
    pointer-events: none;
    .icon-box {
      pointer-events: none;
    }
  }
`;

const ModalGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: start;
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const MyReviewCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .section-title {
    font-size: 13px;
    color: var(--neutral-500);
    letter-spacing: 1px;
  }
  .comment {
    font-size: 14px;
    color: var(--neutral-700);
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
  }
  .comment-empty {
    font-size: 14px;
    color: var(--neutral-400);
    font-style: italic;
    margin: 0;
  }
  .food-rating,
  .food-rating .icon-box {
    pointer-events: none;
  }
`;

export default function FoodPage() {
  const [foods, setFoods] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const currentPet = useOutletContext();

  const navigate = useNavigate();
  const { user } = useAuth();
  const { firestore } = getFirebase();

  useEffect(() => {
    const foodCol = collection(
      firestore,
      "users",
      user.uid,
      "pets",
      currentPet,
      "foods"
    );
    const unsubscribe = onSnapshot(foodCol, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setFoods(data);
    });

    return () => {
      unsubscribe();
    };
  }, [currentPet, user.uid]);

  const filteredFood = (foodType) => {
    console.log(foodType);
    return foods.filter((food) => food.food.foodType === foodType);
  };

  const handleClose = (event) => {
    setShowModal(false);
    setSelectedFood(null);
  };

  const handleEdit = (food) => {
    console.log(currentPet, food);
    navigate("/foods/add", {
      state: {
        ...food.food,
        currentPet: currentPet,
        rating: food.rating,
        comment: food.comment,
      },
    });
  };

  const renderFoodItem = (foodData) => {
    return foodData.map((item) => (
      <FoodItem
        key={item.id}
        {...item}
        onClick={() => {
          setSelectedFood(item);
          setShowModal(true);
        }}
      />
    ));
  };

  return (
    <StyledFoodPage>
      <h1>食物目錄</h1>
      <Tabs initialValue="1" hideDivider className="food-tabs">
        <Tabs.Item label="全部" value="1">
          <div className="items">
            {foods.map((food) => (
              <FoodItem
                key={food.id}
                {...food}
                onClick={() => {
                  setSelectedFood(food);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        </Tabs.Item>
        <Tabs.Item label="主食" value="2">
          {renderFoodItem(filteredFood("complete"))}
        </Tabs.Item>
        <Tabs.Item label="副食" value="3">
          {renderFoodItem(filteredFood("complementary"))}
        </Tabs.Item>
        <Tabs.Item label="零食" value="4">
          {renderFoodItem(filteredFood("treat"))}
        </Tabs.Item>
        <Tabs.Item label="保健品" value="5">
          {renderFoodItem(filteredFood("supplement"))}
        </Tabs.Item>
      </Tabs>

      {selectedFood && (
        <Modal visible={showModal} onClose={handleClose} width="min(720px, 92vw)">
          {console.log(selectedFood)}
          <Modal.Subtitle>{selectedFood.food.brand}</Modal.Subtitle>
          <Modal.Title>{selectedFood.food.flavor}</Modal.Title>
          <Modal.Content>
            <ModalGrid>
              <div className="col">
                <MyReviewCard>
                  <p className="section-title">我的評價</p>
                  <Rating
                    value={selectedFood.rating}
                    className="food-rating"
                    locked={true}
                  />
                  {selectedFood.comment ? (
                    <p className="comment">{selectedFood.comment}</p>
                  ) : (
                    <p className="comment-empty">尚未填寫評語</p>
                  )}
                </MyReviewCard>
                <IngredientCard {...selectedFood.food} />
                {AdditivesCard(selectedFood.food)}
              </div>
              <div className="col">
                {NutritionChartCard(selectedFood.food)}
                <BasicInfoCard {...selectedFood.food} />
                <OtherElementsCard {...selectedFood.food} />
              </div>
            </ModalGrid>
          </Modal.Content>
          <Button label="修改評價" onClick={() => handleEdit(selectedFood)} />
        </Modal>
      )}

      <ActionButton onClick={() => setShowDrawer(true)} />
      <Drawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        placement="bottom"
      >
        <Link to="./search" state={{ from: "foods", currentPet: currentPet }}>
          <Input icon={<Search />} placeholder="搜尋食物名稱" />
        </Link>
        <Link to="./create">
          <Button label="創建食物" />
        </Link>
      </Drawer>
      <Nav />
    </StyledFoodPage>
  );
}
