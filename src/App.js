import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ProvideAuth } from "./hooks/useAuth";
import { usePets } from "./hooks/usePets";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import FoodPage from "./pages/FoodPage";
import StatsPage from "./pages/StatsPage";
import FoodSearch from "./pages/FoodSearch";
import CreateFoodPage from "./pages/CreateFoodPage";
import AddFoodPage from "./pages/AddFoodPage";
import DiaryPage from "./pages/DiaryPage";
import AddFoodRecordPage from "./pages/AddFoodRecordPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePetPage from "./pages/CreatePetPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CreateFirstPetPage from "./pages/CreateFirstPetPage";

function App() {
  const [foods, setFoods] = useState([]);
  const [stats, setStats] = useState([
    // {
    //   date: "2022-06-15",
    //   weight: 4.1,
    //   heartRate: 120,
    //   breathRate: 45,
    // },
    // {
    //   date: "2022-06-18",
    //   weight: 4.15,
    //   heartRate: 123,
    //   breathRate: 43,
    // },
    // {
    //   date: "2022-08-20",
    //   weight: 4.18,
    //   heartRate: 133,
    //   breathRate: 30,
    // },
  ]);
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
            <Route
              path="stats"
              element={<StatsPage stats={stats} setStats={setStats} />}
            />
          </Route>
          <Route
            path="profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="foods/create" element={<CreateFoodPage />} />
          <Route
            path="foods/records/add"
            element={
              <AddFoodRecordPage
                diaries={diaries}
                addfoodRecordHandler={setDiaries}
              />
            }
          />
          <Route
            path="/foods/add"
            element={<AddFoodPage foods={foods} addFoodHandler={setFoods} />}
          />
          <Route path="foods/search" element={<FoodSearch foods={foods} />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route
            path="pets/create"
            element={
              <RequireAuth>
                <CreatePetPage />
              </RequireAuth>
            }
          />
          <Route
            path="signup/setup"
            element={
              <RequireAuth>
                <CreateFirstPetPage />
              </RequireAuth>
            }
          />
        </Routes>
      </ProvideAuth>
    </div>
  );
}

export default App;
