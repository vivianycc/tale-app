import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ProvideAuth } from "./hooks/useAuth";
import { CurrentPetProvider } from "./hooks/useCurrentPet";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import FoodPage from "./pages/FoodPage";
import StatsPage from "./pages/StatsPage";
import DiaryPage from "./pages/DiaryPage";
import SearchFoodPage from "./pages/SearchFoodPage";
import CreateFoodPage from "./pages/CreateFoodPage";
import AddFoodPage from "./pages/AddFoodPage";
import AddFoodRecordPage from "./pages/AddFoodRecordPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CreatePetPage from "./pages/CreatePetPage";
import EditPetPage from "./pages/EditPetPage";
import AddNotePage from "./pages/AddNotePage";

function App() {
  const [foods, setFoods] = useState([]);
  const [diaries, setDiaries] = useState([
    {
      date: "2022/10/01",
      note: "今天好像特別有活力！",
      foodRecord: [],
      photos: [],
    },
    {
      date: "2022/10/02",
      note: "今天好像特別有活力！",
      foodRecord: [],
      photos: [],
    },
    {
      date: "2022/10/03",
      note: "今天好像特別有活力！",
      foodRecord: [],
      photos: [],
    },
    {
      date: "2022/10/07",
      note: "今天好像特別有活力！",
      foodRecord: [
        {
          foodBrand: "魔力喵",
          foodProduct: "精緻時光主食罐",
          foodFlavor: "鮭魚＆火雞",
          foodId: "12345",
          calories: 96,
          portion: 30,
          time: "08:30am",
        },
        {
          foodBrand: "魔力喵",
          foodProduct: "精緻時光主食罐",
          foodFlavor: "鮭魚＆火雞",
          foodId: "12345",
          calories: 96,
          portion: 30,
          time: "08:30am",
        },
        {
          foodBrand: "魔力喵",
          foodProduct: "精緻時光主食罐",
          foodFlavor: "鮭魚＆火雞",
          foodId: "12345",
          calories: 96,
          portion: 30,
          time: "08:30am",
        },
        {
          foodBrand: "魔力喵",
          foodProduct: "精緻時光主食罐",
          foodFlavor: "鮭魚＆火雞",
          foodId: "12345",
          calories: 96,
          portion: 30,
          time: "08:30am",
        },
        {
          foodBrand: "魔力喵",
          foodProduct: "精緻時光主食罐",
          foodFlavor: "鮭魚＆火雞",
          foodId: "12345",
          calories: 96,
          portion: 30,
          time: "08:30am",
        },
        {
          foodBrand: "魔力喵",
          foodProduct: "精緻時光主食罐",
          foodFlavor: "鮭魚＆火雞",
          foodId: "12345",
          calories: 96,
          portion: 30,
          time: "08:30am",
        },
      ],
      photos: [],
    },
  ]);

  return (
    <div className="App">
      <ProvideAuth>
        <CurrentPetProvider>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            >
              <Route index element={<DiaryPage diaries={diaries} />} />
              <Route path="foods" element={<FoodPage foods={foods} />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route
              path="foods/create"
              element={
                <RequireAuth>
                  <CreateFoodPage />
                </RequireAuth>
              }
            />
            <Route
              path="foods/records/add"
              element={
                <RequireAuth>
                  <AddFoodRecordPage
                    diaries={diaries}
                    addfoodRecordHandler={setDiaries}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="diaries/note/add"
              element={
                <RequireAuth>
                  <AddNotePage />
                </RequireAuth>
              }
            />
            <Route
              path="/foods/add"
              element={
                <RequireAuth>
                  <AddFoodPage foods={foods} addFoodHandler={setFoods} />
                </RequireAuth>
              }
            />
            <Route
              path="foods/search"
              element={
                <RequireAuth>
                  <SearchFoodPage foods={foods} />
                </RequireAuth>
              }
            />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route
              path="pets/edit"
              element={
                <RequireAuth>
                  <EditPetPage />
                </RequireAuth>
              }
            />
            <Route
              path="pets/create"
              element={
                <RequireAuth>
                  <CreatePetPage />
                </RequireAuth>
              }
            />
          </Routes>
        </CurrentPetProvider>
      </ProvideAuth>
    </div>
  );
}

export default App;
