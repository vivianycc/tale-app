import React from "react";
import styled from "styled-components";
import { Tag } from "@geist-ui/core";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 20px;
`;

const SectionTitle = styled.p`
  font-size: 13px;
  color: var(--neutral-500);
  margin: 0 0 12px;
  letter-spacing: 1px;
`;

const MetaGrid = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  row-gap: 8px;
  column-gap: 16px;
  font-size: 14px;
  margin: 0;

  dt {
    color: var(--neutral-500);
  }
  dd {
    color: var(--neutral-700);
    margin: 0;
    text-align: right;
  }
`;

const AdditiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 16px;
  font-size: 14px;

  .row {
    display: flex;
    justify-content: space-between;
    color: var(--neutral-700);
  }
  .row .label {
    color: var(--neutral-500);
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChartCard = styled(Card)`
  padding: 16px 8px 16px;
`;

const NUTRITION_LABELS = {
  water: "水分",
  protein: "蛋白質",
  fat: "脂肪",
  carbonhydrate: "碳水",
  ash: "灰分",
  fibre: "纖維",
  calcium: "鈣",
  phosphorus: "磷",
};

const COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f97316",
  "#a78bfa",
  "#f472b6",
  "#94a3b8",
  "#2dd4bf",
];

const FOOD_TYPE_LABELS = {
  complete: "主食",
  treat: "零食",
  complementary: "副食",
  supplement: "保健品",
};

const asArray = (v) =>
  Array.isArray(v)
    ? v
    : typeof v === "string" && v
      ? v
          .split(/[、,]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

const buildChartData = (f) =>
  Object.entries({
    water: f.water,
    protein: f.protein,
    fat: f.fat,
    carbonhydrate: f.carbonhydrate,
    ash: f.ash,
    fibre: f.fibre,
    calcium: f.calcium,
    phosphorus: f.phosphorus,
  })
    .filter(([, v]) => typeof v === "number" && v > 0)
    .map(([k, v]) => ({ name: NUTRITION_LABELS[k], value: v }));

const hasAdditives = (f) =>
  [f.vitd3, f.taurine, f.zinc, f.manganese, f.iodine, f.vite].some(
    (v) => typeof v === "number" && v > 0,
  );

export function NutritionChartCard(food) {
  const data = buildChartData(food);
  if (data.length === 0) return null;
  return (
    <ChartCard>
      <SectionTitle>營養比例 (%)</SectionTitle>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={40}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "var(--neutral-700)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function BasicInfoCard({
  brand,
  product,
  flavor,
  foodType,
  origin,
  weight,
  calories,
}) {
  return (
    <Card>
      <SectionTitle>基本資料</SectionTitle>
      <MetaGrid>
        {brand && (
          <>
            <dt>品牌</dt>
            <dd>{brand}</dd>
          </>
        )}
        {product && (
          <>
            <dt>產品</dt>
            <dd>{product}</dd>
          </>
        )}
        {flavor && (
          <>
            <dt>口味</dt>
            <dd>{flavor}</dd>
          </>
        )}
        {foodType && (
          <>
            <dt>種類</dt>
            <dd>{FOOD_TYPE_LABELS[foodType] || foodType}</dd>
          </>
        )}
        {origin && (
          <>
            <dt>產地</dt>
            <dd>{origin}</dd>
          </>
        )}
        {weight ? (
          <>
            <dt>重量</dt>
            <dd>{weight} g</dd>
          </>
        ) : null}
        {calories ? (
          <>
            <dt>熱量</dt>
            <dd>{calories} kcal</dd>
          </>
        ) : null}
      </MetaGrid>
    </Card>
  );
}

export function IngredientCard({ ingredient }) {
  const list = asArray(ingredient);
  if (list.length === 0) return null;
  return (
    <Card>
      <SectionTitle>主要成分</SectionTitle>
      <p
        style={{
          color: "var(--neutral-700)",
          lineHeight: 1.6,
          fontSize: 14,
          margin: 0,
        }}
      >
        {list.join("、")}
      </p>
    </Card>
  );
}

const AdditiveRow = ({ label, value, unit }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="row">
      <span className="label">{label}</span>
      <span>
        {value}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
};

export function AdditivesCard(food) {
  if (!hasAdditives(food)) return null;
  return (
    <Card>
      <SectionTitle>每公斤營養添加</SectionTitle>
      <AdditiveGrid>
        <AdditiveRow label="維生素 D3" value={food.vitd3} unit="IU" />
        <AdditiveRow label="維生素 E" value={food.vite} unit="IU" />
        <AdditiveRow label="牛磺酸" value={food.taurine} unit="mg" />
        <AdditiveRow label="鋅" value={food.zinc} unit="mg" />
        <AdditiveRow label="錳" value={food.manganese} unit="mg" />
        <AdditiveRow label="碘" value={food.iodine} unit="mg" />
      </AdditiveGrid>
    </Card>
  );
}

export function OtherElementsCard({ nonMeatElement }) {
  const list = asArray(nonMeatElement);
  if (list.length === 0) return null;
  return (
    <Card>
      <SectionTitle>其他添加</SectionTitle>
      <Chips>
        {list.map((el, i) => (
          <Tag key={i} type="lite">
            {el}
          </Tag>
        ))}
      </Chips>
    </Card>
  );
}

export default function FoodNutrition(food) {
  return (
    <Stack>
      {NutritionChartCard(food)}
      <BasicInfoCard {...food} />
      <IngredientCard {...food} />
      {AdditivesCard(food)}
      <OtherElementsCard {...food} />
    </Stack>
  );
}
