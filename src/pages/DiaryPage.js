import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import {
  Calendar,
  Heart,
  Image,
  BookOpen,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "react-feather";
import { Modal, Drawer } from "@geist-ui/core";
import CalendarView from "../components/Calendar";
import IconButton from "../components/IconButton";
import FoodRecordItem from "../components/FoodRecordItem";
import MenuItem from "../components/MenuItem";
import ActionButton from "../components/ActionButton";
import { getFirebase } from "../firebase";
import { onSnapshot, doc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import useCurrentPet from "../hooks/useCurrentPet";

const StyledPage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  .header {
    display: flex;
    align-items: center;
    justify-content: start;

    h1 {
      letter-spacing: 2px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
    }
    .day-stepper {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
    overflow-y: scroll;
    padding-bottom: 128px;
  }
  h2 {
    font-size: 14px;
    font-weight: 500;
  }
  .note {
    padding: 16px 24px;
    background-color: #fff;
    border-radius: 24px;
    white-space: pre-wrap;
    line-height: 1.6;
  }
  .empty-message {
    margin-top: 120px;
    flex: 1;
    color: var(--neutral-300);
    text-align: center;
  }
  .menu-items {
  }
`;

const StyledMenuItem = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

export default function DiaryPage(props) {
  const [selectedDay, setSelectedDay] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedDayData, setSelectedDayData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const navigate = useNavigate();
  const { firestore } = getFirebase();
  const { user } = useAuth();
  const currentPet = useOutletContext();

  useEffect(() => {
    const diaryCol = doc(
      firestore,
      "users",
      user.uid,
      "pets",
      currentPet,
      "diaries",
      selectedDay,
    );

    const unsubscribe = onSnapshot(diaryCol, (doc) => {
      console.log(doc.data());
      if (doc.data()) {
        setSelectedDayData(doc.data());
      } else {
        setSelectedDayData({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedDay, currentPet]);

  const renderEmptyContent = () => {
    return <div className="empty-message">今天還沒有紀錄 </div>;
  };
  const renderContent = () => {
    const { note, foodRecord = [] } = selectedDayData;
    return (
      <>
        {note ? (
          <div className="note">
            {console.log(selectedDayData)}
            {note}
          </div>
        ) : null}
        <h2>食物紀錄</h2>
        {foodRecord.length !== 0 ? (
          foodRecord.map((info) => <FoodRecordItem info={info} />)
        ) : (
          <div className="empty-message">尚未添加食物紀錄</div>
        )}
      </>
    );
  };
  return (
    <StyledPage className="diary">
      <Modal visible={showModal} onClose={() => setShowModal(false)}>
        <CalendarView
          setSelectedDay={setSelectedDay}
          setShowModal={setShowModal}
          selectedDay={selectedDay}
        />
      </Modal>
      <div className="header">
        <h1>{`${dayjs(selectedDay).locale("zh-tw").format("MMMD")}日`}</h1>
        <div className="header-actions">
          <div className="day-stepper">
            <IconButton
              icon={<ChevronLeft size={18} />}
              variant="transparent"
              size="32"
              onClick={() =>
                setSelectedDay(
                  dayjs(selectedDay).subtract(1, "day").format("YYYY-MM-DD"),
                )
              }
            />
            <IconButton
              icon={<ChevronRight size={18} />}
              variant="transparent"
              size="32"
              onClick={() =>
                setSelectedDay(
                  dayjs(selectedDay).add(1, "day").format("YYYY-MM-DD"),
                )
              }
            />
          </div>
          <IconButton
            icon={<Calendar />}
            variant="secondary"
            onClick={() => setShowModal(true)}
          />
        </div>
      </div>
      <div className="content">
        {selectedDayData == null || Object.keys(selectedDayData).length === 0
          ? renderEmptyContent()
          : renderContent()}
      </div>
      <ActionButton onClick={() => setShowDrawer(true)} />
      <Drawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        placement="bottom"
      >
        <StyledMenuItem>
          <MenuItem
            icon={<Heart />}
            label="食物"
            onClick={() =>
              navigate("/foods/search", {
                state: {
                  from: "diary",
                  currentPet: currentPet,
                  date: selectedDay,
                },
              })
            }
          />

          <MenuItem
            icon={<BookOpen />}
            label="日記"
            onClick={() =>
              navigate("diaries/note/add", {
                state: {
                  currentPet: currentPet,
                  date: selectedDay,
                  note: selectedDayData.note,
                },
              })
            }
          />
          {/* <MenuItem icon={<Image />} label="照片" />
          <MenuItem icon={<TrendingUp />} label="數據" /> */}
        </StyledMenuItem>
      </Drawer>
    </StyledPage>
  );
}
