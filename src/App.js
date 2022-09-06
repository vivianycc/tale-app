import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FoodPage from "./pages/FoodPage";
import StatsPage from "./pages/StatsPage";
import FoodSearch from "./pages/FoodSearch";
import CreateFoodPage from "./pages/CreateFoodPage";
import AddFoodPage from "./pages/AddFoodPage";
import DiaryPage from "./pages/DiaryPage";

function App() {
  const [currentPet, setCurrentPet] = useState({
    name: "canele",
    info: {
      species: "cat",
      breed: "mix",
      birthday: "2020/10/15",
      weight: 4.0,
      photoUrl: "...",
      neutered: true, //結紮
      sex: "f",
      chipNum: 1234,
    },
  });
  const [foods, setFoods] = useState([]);
  const [stats, setStats] = useState([
    {
      date: "2022-06-15",
      weight: 4.1,
      heartRate: 120,
      breathRate: 45,
    },
    {
      date: "2022-06-18",
      weight: 4.15,
      heartRate: 123,
      breathRate: 43,
    },
    {
      date: "2022-08-20",
      weight: 4.18,
      heartRate: 133,
      breathRate: 30,
    },
  ]);

  useEffect(() => {
    const foods = JSON.parse(localStorage.getItem("foods"));
    if (foods.length) {
      setFoods(foods);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("foods", JSON.stringify(foods));
  }, [foods]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />}>
          <Route index element={<DiaryPage />} />
          <Route path="foods" element={<FoodPage foods={foods} />} />
          <Route
            path="stats"
            element={<StatsPage stats={stats} setStats={setStats} />}
          />
        </Route>
        <Route path="foods/create" element={<CreateFoodPage />} />
        <Route
          path="/foods/add"
          element={<AddFoodPage foods={foods} addFoodHandler={setFoods} />}
        />
        <Route path="foods/search" element={<FoodSearch foods={foods} />} />
      </Routes>
    </div>
  );
}

export default App;
