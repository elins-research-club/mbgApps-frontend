// /frontend/src/pages/meal-planner.js
import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import RecipeItem from "../components/RecipeItem";
import Plate from "../components/Plate";
import NutritionChart from "../components/NutritionChart";
import NutritionLabel from "../components/NutritionLabel";
import ChefNavbar from "../components/ChefNavbar";
import { useRouter } from "next/router";
import {
  getAllRecipes,
  getAllRecommendations,
  getAllMenus,
  getMenuNutritionById,
  getAllMealPlans,
} from "../services/api";
import { goals, classNames } from "../utils/goals";

// ─── Status badge helpers ───────────────────────────────────────────────────
const STATUS_CONFIG = {
  achieved: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "✓",
    label: "Tercapai",
    barColor: "bg-emerald-400",
  },
  close: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    icon: "~",
    label: "Hampir",
    barColor: "bg-amber-400",
  },
  short: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    icon: "↑",
    label: "Kurang",
    barColor: "bg-red-400",
  },
};

const NUTRIENT_LABELS = {
  energi_kkal: { label: "Energi", unit: "kkal" },
  protein_g: { label: "Protein", unit: "g" },
  lemak_g: { label: "Lemak", unit: "g" },
  karbohidrat_g: { label: "Karbohidrat", unit: "g" },
  serat_g: { label: "Serat", unit: "g" },
};

// ─── RecommendationCard ─────────────────────────────────────────────────────
function RecommendationCard({ data, classNames, onApplyPortions, isApplied }) {
  const [expanded, setExpanded] = useState(false);
  const { goal_id, goal_daily, recommendation } = data;
  const className = classNames[parseInt(goal_id)];

  if (!recommendation?.success) return null;

  const { portions, nutritional_achievement, total_weight_g } = recommendation;

  // Overall achievement score
  const nutrients = Object.values(nutritional_achievement);
  const achievedCount = nutrients.filter((n) => n.status === "achieved").length;
  const closeCount = nutrients.filter((n) => n.status === "close").length;
  const shortCount = nutrients.filter((n) => n.status === "short").length;

  const overallStatus =
    achievedCount >= 2 ? "achieved" : closeCount >= 2 ? "close" : "short";

  const cfg = STATUS_CONFIG[overallStatus];

  return (
    <div
      className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden transition-all duration-300`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${cfg.badge}`}
          >
            {cfg.icon}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{className}</p>
            <p className="text-xs text-gray-500">
              {goal_daily.energi_kkal} kkal/hari · {Math.round(total_weight_g)}g
              total sajian
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}
          >
            {cfg.label}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {isApplied ? (
            /* ── Applied success state ── */
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-emerald-700 font-bold text-sm text-center">
                Porsi telah sesuai dengan rekomendasi
              </p>
              <p className="text-gray-400 text-xs text-center">
                Klik &quot;Perbarui Rekomendasi&quot; untuk melihat analisis terbaru
              </p>
              <div className="w-full mt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Porsi yang diterapkan
                </p>
                <div className="space-y-2">
                  {Object.entries(portions).map(([food, portion]) => (
                    <div
                      key={food}
                      className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100"
                    >
                      <span className="text-sm text-gray-700 capitalize font-medium">
                        {food.replace(/([a-z])([A-Z])/g, "$1 $2")}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-bold text-emerald-600">
                          {portion.recommended_grams.toFixed(1)}g
                        </span>
                        <span>·</span>
                        <span>{portion.servings.toFixed(2)}x porsi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Portions Table */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Porsi yang Direkomendasikan
                </p>
                <div className="space-y-2">
                  {Object.entries(portions).map(([food, portion]) => (
                    <div
                      key={food}
                      className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100"
                    >
                      <span className="text-sm text-gray-700 capitalize font-medium">
                        {food.replace(/([a-z])([A-Z])/g, "$1 $2")}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-bold text-orange-500">
                          {portion.recommended_grams.toFixed(1)}g
                        </span>
                        <span>·</span>
                        <span>{portion.servings.toFixed(2)}x porsi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrient Achievement */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Pencapaian Nutrisi per Makan
                </p>
                <div className="space-y-3">
                  {Object.entries(nutritional_achievement).map(
                    ([key, nutrient]) => {
                      const nutrientCfg = STATUS_CONFIG[nutrient.status];
                      const nutrientInfo = NUTRIENT_LABELS[key];
                      const barWidth = Math.min(nutrient.percentage, 100);
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">
                              {nutrientInfo?.label || key}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {nutrient.achieved_per_meal.toFixed(1)} /{" "}
                                {nutrient.goal_per_meal.toFixed(1)}{" "}
                                {nutrientInfo?.unit}
                              </span>
                              <span
                                className={`text-xs font-bold px-1.5 py-0.5 rounded ${nutrientCfg.badge}`}
                              >
                                {nutrient.percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${nutrientCfg.barColor}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Apply Portions Button — hidden when already applied */}
      {onApplyPortions && !isApplied && (
        <button
          onClick={() => onApplyPortions(portions, goal_id)}
          className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Terapkan Porsi Ini ke Piring
        </button>
      )}
      {isApplied && (
        <div className="mt-2 mx-4 mb-4 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-emerald-700 text-xs font-semibold">
            Porsi telah sesuai dengan rekomendasi
          </span>
        </div>
      )}
    </div>
  );
}

// ─── RecommendationSummaryPanel ─────────────────────────────────────────────
function RecommendationSummaryPanel({
  recommendations,
  classNames,
  targetClass,
  onApplyPortions,
  appliedGoalIds,
}) {
  const [activeTab, setActiveTab] = useState("current");

  const currentRec = recommendations.find(
    (r) => parseInt(r.goal_id) === targetClass,
  );
  const allRecs = recommendations;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 px-6 py-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.89 3.89 0 01-1.1.83l-.012.006A3.89 3.89 0 0112 17.5a3.89 3.89 0 01-1.78-.417l-.012-.006a3.89 3.89 0 01-1.1-.83l-.347-.347z"
            />
          </svg>
          Rekomendasi AI
        </h3>
        <p className="text-orange-100 text-sm mt-1">
          Porsi optimal berdasarkan kebutuhan per kelas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "current"
              ? "text-orange-500 border-b-2 border-orange-400 bg-orange-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Kelas Aktif
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "all"
              ? "text-orange-500 border-b-2 border-orange-400 bg-orange-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Semua Kelas
        </button>
      </div>

      <div className="p-4">
        {activeTab === "current" ? (
          currentRec ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                  {classNames[targetClass]}
                </span>
                <span className="text-gray-400 text-xs">
                  {currentRec.goal_daily.energi_kkal} kkal/hari
                </span>
              </div>
              <RecommendationCard
                data={{ ...currentRec, _forceExpanded: true }}
                classNames={classNames}
                onApplyPortions={onApplyPortions}
                isApplied={appliedGoalIds?.has(String(currentRec.goal_id))}
              />
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              Tidak ada rekomendasi untuk kelas ini.
            </p>
          )
        ) : (
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {allRecs.map((rec) => (
              <RecommendationCard
                key={rec.goal_id}
                data={rec}
                classNames={classNames}
                onApplyPortions={onApplyPortions}
                isApplied={appliedGoalIds?.has(String(rec.goal_id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MealPlanItem Component ─────────────────────────────────────────────────
function MealPlanItem({ plan, onShowQR, onLoadPlan }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">{plan.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {classNames[plan.targetClass]} · {formatDate(plan.createdAt)}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            {plan.recipes?.length || 0} resep
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onLoadPlan(plan)}
          className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Muat
        </button>
        <button
          onClick={() => onShowQR(plan)}
          className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          QR
        </button>
      </div>
    </div>
  );
}

// ─── SetMenuItem Component ──────────────────────────────────────────────────
function SetMenuItem({ menu, onEdit, onShowQR, onLoadMenu }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">{menu.nama}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {menu.kategori || "Menu Set"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onLoadMenu(menu)}
          className="flex-1 px-3 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Muat
        </button>
        <button
          onClick={() => onShowQR(menu)}
          className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          QR
        </button>
      </div>
    </div>
  );
}

// QR Modal Component 
function QRModal({ qrCodeUrl, menuName, onClose, onDownload }) {
  if (!qrCodeUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              QR Code Menu Set
            </h2>
            <p className="text-gray-600 mb-2 font-semibold">{menuName}</p>
            <p className="text-sm text-gray-500 mb-6">
              Scan QR code untuk mengakses menu ini
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="mx-auto w-64 h-64 border-4 border-white shadow-lg rounded-lg"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDownload}
              className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download QR
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page
export default function MealPlanner() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [plateRecipes, setPlateRecipes] = useState([]);
  const [targetClass, setTargetClass] = useState(6);
  const [activeId, setActiveId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [planName, setPlanName] = useState("");

  // Set Menu state
  const [menus, setMenus] = useState([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");

  // Meal Plans state
  const [mealPlans, setMealPlans] = useState([]);
  const [isLoadingMealPlans, setIsLoadingMealPlans] = useState(true);
  const [mealPlanSearchQuery, setMealPlanSearchQuery] = useState("");

  // QR Modal state
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [currentMenuName, setCurrentMenuName] = useState("");

  // Recommendation state
  const [recommendations, setRecommendations] = useState(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recError, setRecError] = useState(null);
  const [appliedGoalIds, setAppliedGoalIds] = useState(new Set());

  useEffect(() => {
    if (plateRecipes.length > 0) {
      localStorage.setItem("plateRecipes", JSON.stringify(plateRecipes));
    }
  }, [plateRecipes]);

  useEffect(() => {
    localStorage.setItem("targetClass", targetClass.toString());
  }, [targetClass]);

  useEffect(() => {
    if (planName) {
      localStorage.setItem("planName", planName);
    }
  }, [planName]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPlanName = localStorage.getItem("planName");
    if (savedPlanName) {
      setPlanName(savedPlanName);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const recipeData = await getAllRecipes();
        let recipesArray = Array.isArray(recipeData)
          ? recipeData
          : recipeData?.recipes || [];
        recipesArray = recipesArray.map((recipe) => ({
          ...recipe,
          nutrisi:
            typeof recipe.nutrisi === "string"
              ? JSON.parse(recipe.nutrisi)
              : recipe.nutrisi,
        }));
        setRecipes(recipesArray);
      } catch (error) {
        console.error("Error loading recipes:", error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Fetch menus on mount
  useEffect(() => {
    const fetchMenus = async () => {
      setIsLoadingMenus(true);
      try {
        const menuData = await getAllMenus();
        console.log("Fetched menus:", menuData);
        setMenus(Array.isArray(menuData) ? menuData : []);
      } catch (error) {
        console.error("Error loading menus:", error);
        setMenus([]);
      } finally {
        setIsLoadingMenus(false);
      }
    };
    fetchMenus();
  }, []);

  // Fetch meal plans on mount
  useEffect(() => {
    const fetchMealPlans = async () => {
      setIsLoadingMealPlans(true);
      try {
        const response = await getAllMealPlans();
        console.log("Fetched meal plans:", response);

        // Handle different response structures
        let plansArray = [];
        if (response?.data && Array.isArray(response.data)) {
          plansArray = response.data;
        } else if (response?.mealPlans && Array.isArray(response.mealPlans)) {
          plansArray = response.mealPlans;
        } else if (Array.isArray(response)) {
          plansArray = response;
        }

        setMealPlans(plansArray);
      } catch (error) {
        console.error("Error loading meal plans:", error);
        setMealPlans([]);
      } finally {
        setIsLoadingMealPlans(false);
      }
    };
    fetchMealPlans();
  }, []);

  // ── Recommendation handler ────────────────────────────────────────────────
  const handleGetRecommendations = async () => {
    if (plateRecipes.length === 0) return;

    setIsLoadingRecs(true);
    setRecError(null);
    setRecommendations(null);
    setAppliedGoalIds(new Set());

    try {
      // Build the payload: keyed by name slug, nutrition fields flattened
      const currentFoods = plateRecipes.reduce((acc, r) => {
        // Convert recipe name to slug: lowercase, strip spaces/special chars
        const key = (r.nama || "")
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9]/g, "");

        const nutrisi = r.nutrisi || {};
        const gramasi = (r.total_gramasi || 100) * (r.quantity || 1);

        acc[key] = {
          gramasi: parseFloat(gramasi.toFixed(1)),
          kategori_makanan: r.kategori || "",
          energi_kkal: parseFloat(nutrisi.energi_kkal) || 0,
          protein_g: parseFloat(nutrisi.protein_g) || 0,
          lemak_g: parseFloat(nutrisi.lemak_g) || 0,
          karbohidrat_g: parseFloat(nutrisi.karbohidrat_g) || 0,
          serat_g: parseFloat(nutrisi.serat_g) || 0,
        };

        return acc;
      }, {});

      const data = await getAllRecommendations(currentFoods);
      setRecommendations(data);
    } catch (error) {
      setRecError(error.message || "Gagal mendapatkan rekomendasi. Coba lagi.");
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleApplyPortions = (portions, goalId) => {
    setPlateRecipes((prev) =>
      prev.map((recipe) => {
        const slug = (recipe.nama || "")
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9]/g, "");
        const match = portions[slug];
        if (match) {
          return { ...recipe, quantity: parseFloat(match.servings.toFixed(2)) };
        }
        return recipe;
      }),
    );
    // Mark this goal as applied instead of clearing recommendations
    setAppliedGoalIds((prev) => new Set([...prev, String(goalId)]));
  };

  // ── Load Menu handler ──────────────────────────────────────────────────────
  const handleLoadMenu = async (menu) => {
    try {
      console.log("Loading menu:", menu);

      // Get menu details with nutrition info
      const menuData = await getMenuNutritionById(menu.id);
      console.log("Menu data:", menuData);

      if (!menuData || !menuData.rincian_per_bahan) {
        alert("Data menu tidak lengkap");
        return;
      }

      // Map menu items to recipes
      const menuRecipes = menuData.rincian_per_bahan
        .filter((item) => item.resep_id) // Only include items with recipe ID
        .map((item) => {
          // Find the full recipe data from our recipes array
          const fullRecipe = recipes.find((r) => r.id === item.resep_id);

          if (fullRecipe) {
            return {
              ...fullRecipe,
              quantity: 1,
            };
          }

          // If not found in recipes array, create from menu data
          return {
            id: item.resep_id,
            nama: item.nama_resep,
            kategori: item.kategori || "",
            total_gramasi: item.gramasi || 100,
            nutrisi: {
              energi_kkal: item.energi_kkal || 0,
              protein_g: item.protein_g || 0,
              lemak_g: item.lemak_g || 0,
              karbohidrat_g: item.karbohidrat_g || 0,
              serat_g: item.serat_g || 0,
            },
            quantity: 1,
          };
        });

      setPlateRecipes(menuRecipes);
      setPlanName(menu.nama || ""); // Set the plan name to menu name
      setRecommendations(null); // Reset recommendations when loading new menu
    } catch (error) {
      console.error("Error loading menu:", error);
      alert("Gagal memuat menu: " + error.message);
    }
  };

  // ── Show QR handler ────────────────────────────────────────────────────────
  const handleShowQR = async (menu) => {
    try {
      // First load the menu to the plate
      await handleLoadMenu(menu);

      // Generate QR code URL (you can encode the menu ID or a full URL)
      const baseUrl = window.location.origin;
      const menuUrl = `${baseUrl}/meal-planner?menuId=${menu.id}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;

      setQrCodeUrl(qrUrl);
      setCurrentMenuName(menu.nama);
      setShowQRModal(true);
    } catch (error) {
      console.error("Error showing QR:", error);
      alert("Gagal menampilkan QR code: " + error.message);
    }
  };

  // ── Download QR handler ────────────────────────────────────────────────────
  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `menu-qr-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Gagal mengunduh QR code. Silakan coba lagi.");
    }
  };

  // ── Load Meal Plan handler ─────────────────────────────────────────────────
  const handleLoadMealPlan = (plan) => {
    try {
      console.log("Loading meal plan:", plan);

      // Get recipes from the meal plan
      const planRecipes = plan.recipes || [];

      if (planRecipes.length === 0) {
        alert("Meal plan ini tidak memiliki resep");
        return;
      }

      // Map meal plan recipes to plate format
      const mappedRecipes = planRecipes.map((planRecipe) => {
        // Find the full recipe data from our recipes array
        const fullRecipe = recipes.find((r) => r.id === planRecipe.id);

        if (fullRecipe) {
          return {
            ...fullRecipe,
            quantity: planRecipe.quantity || 1,
          };
        }

        // If not found, use the data from the meal plan
        return {
          id: planRecipe.id,
          nama: planRecipe.nama,
          kategori: planRecipe.kategori || "",
          total_gramasi: planRecipe.total_gramasi || 100,
          nutrisi: planRecipe.nutrisi || {},
          quantity: planRecipe.quantity || 1,
        };
      });

      setPlateRecipes(mappedRecipes);
      setTargetClass(plan.targetClass || 6); // Set the target class from the plan
      setPlanName(plan.name || ""); // Set the plan name
      setRecommendations(null); // Reset recommendations when loading new plan
    } catch (error) {
      console.error("Error loading meal plan:", error);
    }
  };

  // ── Show QR for Meal Plan ──────────────────────────────────────────────────
  const handleShowMealPlanQR = (plan) => {
    try {
      // First load the plan to the plate
      handleLoadMealPlan(plan);

      // Generate QR code URL for the saved meal plan
      const baseUrl = window.location.origin;
      const planUrl = `${baseUrl}/saved-meal-plan/${plan.id}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(planUrl)}`;

      setQrCodeUrl(qrUrl);
      setCurrentMenuName(plan.name);
      setShowQRModal(true);
    } catch (error) {
      console.error("Error showing meal plan QR:", error);
      alert("Gagal menampilkan QR code: " + error.message);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && over.id === "plate") {
      if (Array.isArray(recipes)) {
        const recipe = recipes.find((r) => r.id === parseInt(active.id));
        if (recipe && !plateRecipes.find((r) => r.id === recipe.id)) {
          setPlateRecipes([...plateRecipes, { ...recipe, quantity: 1 }]);
        }
      }
    }
    setActiveId(null);
  };

  const removeFromPlate = (recipeId) => {
    setPlateRecipes(plateRecipes.filter((r) => r.id !== recipeId));
    // Reset recommendations when plate changes
    setRecommendations(null);
  };

  const increaseQuantity = (recipeId) => {
    setPlateRecipes(
      plateRecipes.map((r) =>
        r.id === recipeId
          ? { ...r, quantity: parseFloat(((r.quantity || 1) + 0.1).toFixed(2)) }
          : r,
      ),
    );
  };

  const decreaseQuantity = (recipeId) => {
    setPlateRecipes(
      plateRecipes.map((r) =>
        r.id === recipeId && (r.quantity || 1) > 0.1
          ? { ...r, quantity: parseFloat(((r.quantity || 1) - 0.1).toFixed(2)) }
          : r,
      ),
    );
  };

  const updateQuantity = (recipeId, newQuantity) => {
    setPlateRecipes(
      plateRecipes.map((r) =>
        r.id === recipeId ? { ...r, quantity: newQuantity } : r,
      ),
    );
  };

  const handleQuantityBlur = (recipeId, currentQuantity) => {
    const quantity = parseFloat(currentQuantity);
    if (currentQuantity === "" || isNaN(quantity) || quantity <= 0) {
      setPlateRecipes(
        plateRecipes.map((r) =>
          r.id === recipeId ? { ...r, quantity: 1 } : r,
        ),
      );
    } else {
      setPlateRecipes(
        plateRecipes.map((r) =>
          r.id === recipeId
            ? { ...r, quantity: parseFloat(quantity.toFixed(2)) }
            : r,
        ),
      );
    }
  };

  const getPlateNutritionData = () => {
    const aggregated = aggregateNutrients();
    const target = goals[targetClass];
    const totalGramasi = plateRecipes.reduce((sum, recipe) => {
      return sum + (recipe.total_gramasi || 0) * (recipe.quantity || 1);
    }, 0);
    const calculatePercentage = (actual, goal) => {
      if (!goal) return 0;
      return ((actual / goal) * 100).toFixed(1) + "%";
    };
    return {
      takaran_saji_g: totalGramasi || 100,
      informasi_nilai_gizi: {
        energi_kkal: aggregated.energi_kkal,
        lemak_g: aggregated.lemak_g,
        protein_g: aggregated.protein_g,
        karbohidrat_g: aggregated.karbohidrat_g,
        serat_g: aggregated.serat_g,
        natrium_mg: aggregated.natrium_mg || 0,
        kalium_mg: aggregated.kalium_mg || 0,
        kalsium_mg: aggregated.kalsium_mg || 0,
        besi_mg: aggregated.besi_mg || 0,
        vitamin_c_mg: aggregated.vitamin_c_mg || 0,
      },
      persen_akg: {
        lemak_g: calculatePercentage(aggregated.lemak_g, target.lemak_g),
        protein_g: calculatePercentage(aggregated.protein_g, target.protein_g),
        karbohidrat_g: calculatePercentage(
          aggregated.karbohidrat_g,
          target.karbohidrat_g,
        ),
        serat_g: calculatePercentage(aggregated.serat_g, target.serat_g),
        natrium_mg: calculatePercentage(
          aggregated.natrium_mg || 0,
          target.natrium_mg,
        ),
        kalium_mg: calculatePercentage(
          aggregated.kalium_mg || 0,
          target.kalium_mg,
        ),
        kalsium_mg: calculatePercentage(
          aggregated.kalsium_mg || 0,
          target.kalsium_mg,
        ),
        besi_mg: calculatePercentage(
          aggregated.besi_mg || 0,
          target.besi_mg,
        ),
        vitamin_c_mg: calculatePercentage(
          aggregated.vitamin_c_mg || 0,
          target.vitamin_c_mg,
        ),
      },
    };
  };

  const aggregateNutrients = () => {
    return plateRecipes.reduce(
      (acc, recipe) => {
        const nutrisi = recipe.nutrisi || {};
        const quantity = recipe.quantity || 1;
        acc.energi_kkal += (parseFloat(nutrisi.energi_kkal) || 0) * quantity;
        acc.protein_g += (parseFloat(nutrisi.protein_g) || 0) * quantity;
        acc.karbohidrat_g +=
          (parseFloat(nutrisi.karbohidrat_g) || 0) * quantity;
        acc.lemak_g += (parseFloat(nutrisi.lemak_g) || 0) * quantity;
        acc.serat_g += (parseFloat(nutrisi.serat_g) || 0) * quantity;
        acc.natrium_mg += (parseFloat(nutrisi.natrium_mg) || 0) * quantity;
        acc.kalium_mg += (parseFloat(nutrisi.kalium_mg) || 0) * quantity;
        acc.kalsium_mg += (parseFloat(nutrisi.kalsium_mg) || 0) * quantity;
        acc.besi_mg += (parseFloat(nutrisi.besi_mg) || 0) * quantity;
        acc.vitamin_c_mg += (parseFloat(nutrisi.vitamin_c_mg) || 0) * quantity;
        return acc;
      },
      {
        energi_kkal: 0,
        protein_g: 0,
        karbohidrat_g: 0,
        lemak_g: 0,
        serat_g: 0,
        natrium_mg: 0,
        kalium_mg: 0,
        kalsium_mg: 0,
        besi_mg: 0,
        vitamin_c_mg: 0,
      },
    );
  };

  const activeRecipe =
    Array.isArray(recipes) && activeId
      ? recipes.find((r) => r.id === parseInt(activeId))
      : null;

  const filteredRecipes = recipes.filter((recipe) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      recipe.nama?.toLowerCase().includes(query) ||
      recipe.kategori?.toLowerCase().includes(query)
    );
  });

  const filteredMenus = menus.filter((menu) => {
    if (!menuSearchQuery.trim()) return true;
    const query = menuSearchQuery.toLowerCase();
    return (
      menu.nama?.toLowerCase().includes(query) ||
      menu.kategori?.toLowerCase().includes(query)
    );
  });

  const filteredMealPlans = mealPlans.filter((plan) => {
    if (!mealPlanSearchQuery.trim()) return true;
    const query = mealPlanSearchQuery.toLowerCase();
    return (
      plan.name?.toLowerCase().includes(query) ||
      classNames[plan.targetClass]?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col min-h-screen">
      <ChefNavbar />

      <div className="flex-grow bg-gray-50">
        {/* Page Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Buat dan Lihat Set Menu
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Seret menu ke piring untuk melihat total nutrisi
                </p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors"
              >
                ← Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="max-w-[1600px] mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <div className="lg:col-span-1">
                {/* Menu Tersedia */}
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Menu Tersedia
                  </h2>
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {isLoading ? (
                      <p className="text-gray-500 text-center py-8">
                        Memuat resep...
                      </p>
                    ) : !Array.isArray(recipes) || recipes.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Belum ada resep tersimpan. Silakan tambah resep baru di
                        Dashboard.
                      </p>
                    ) : filteredRecipes.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Tidak ada resep yang cocok dengan pencarian{" "}
                        {searchQuery}
                      </p>
                    ) : (
                      filteredRecipes.map((recipe) => (
                        <RecipeItem key={recipe.id} recipe={recipe} />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Plate Area - Middle */}
              <div className="lg:col-span-2 flex flex-col">
                <Plate
                  recipes={plateRecipes}
                  planName={planName}
                  onPlanNameChange={setPlanName}
                  onRemove={removeFromPlate}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onUpdateQuantity={updateQuantity}
                  onQuantityBlur={handleQuantityBlur}
                />
              </div>

              {/* Set Menu Tersedia - Right */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    Set Menu Tersedia
                  </h2>
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari meal plan..."
                        value={mealPlanSearchQuery}
                        onChange={(e) => setMealPlanSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      {mealPlanSearchQuery && (
                        <button
                          onClick={() => setMealPlanSearchQuery("")}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {isLoadingMealPlans ? (
                      <p className="text-gray-500 text-center py-8">
                        Memuat meal plans...
                      </p>
                    ) : !Array.isArray(mealPlans) || mealPlans.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Belum ada meal plan tersimpan.
                      </p>
                    ) : filteredMealPlans.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Tidak ada meal plan yang cocok dengan pencarian
                      </p>
                    ) : (
                      filteredMealPlans.map((plan) => (
                        <MealPlanItem
                          key={plan.id}
                          plan={plan}
                          onShowQR={() => handleShowMealPlanQR(plan)}
                          onLoadPlan={() => handleLoadMealPlan(plan)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section: shown only when plate has items */}
            {plateRecipes.length > 0 && (
              <div>
                {/* Action Buttons Row */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {/* View Details Button */}
                  <button
                    onClick={() => router.push("/meal-details")}
                    className="px-6 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors font-medium shadow-md flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Lihat Detail Bahan & Nutrisi
                  </button>

                  {/* ── AI Recommendation Button ── */}
                  <button
                    onClick={handleGetRecommendations}
                    disabled={isLoadingRecs}
                    className={`px-6 py-3 rounded-lg font-medium shadow-md flex items-center gap-2 transition-all duration-200
                      ${
                        isLoadingRecs
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : recommendations
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                      }`}
                  >
                    {isLoadingRecs ? (
                      <>
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Memuat Rekomendasi...
                      </>
                    ) : recommendations ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Perbarui Rekomendasi
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.89 3.89 0 01-1.1.83l-.012.006A3.89 3.89 0 0112 17.5a3.89 3.89 0 01-1.78-.417l-.012-.006a3.89 3.89 0 01-1.1-.83l-.347-.347z"
                          />
                        </svg>
                        Dapatkan Rekomendasi AI
                      </>
                    )}
                  </button>
                </div>

                {/* Error message */}
                {recError && (
                  <div className="mb-6 mx-auto max-w-xl bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {recError}
                  </div>
                )}

                {/* Nutrition Label + Chart — always side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Nutrition Label */}
                  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                    <div className="flex items-center justify-between mb-4 w-full">
                      <h3 className="text-lg font-bold text-orange-500">
                        Total Nilai Gizi
                      </h3>
                      <select
                        value={targetClass}
                        onChange={(e) =>
                          setTargetClass(parseInt(e.target.value))
                        }
                        className="px-4 py-2 border border-orange-300 bg-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium"
                      >
                        <option value={1}>TK A</option>
                        <option value={2}>TK B</option>
                        <option value={3}>SD Kelas 1</option>
                        <option value={4}>SD Kelas 2</option>
                        <option value={5}>SD Kelas 3</option>
                        <option value={6}>SD Kelas 4</option>
                        <option value={7}>SD Kelas 5</option>
                        <option value={8}>SD Kelas 6</option>
                        <option value={9}>SMP Kelas 1</option>
                        <option value={10}>SMP Kelas 2</option>
                        <option value={11}>SMP Kelas 3</option>
                        <option value={12}>SMA Kelas 1</option>
                        <option value={13}>SMA Kelas 2</option>
                        <option value={14}>SMA Kelas 3</option>
                      </select>
                    </div>
                    <div className="transform scale-95">
                      <NutritionLabel
                        data={getPlateNutritionData()}
                        goals={goals}
                        classGrade={targetClass}
                        isMini={false}
                      />
                    </div>
                    <p className="text-xs text-orange-600 mt-3 text-center">
                      <span className="font-semibold">ℹ️</span> Persentase
                      berdasarkan kebutuhan harian {classNames[targetClass]}.
                      Grafik menampilkan 1/3 kebutuhan harian.
                    </p>
                  </div>

                  {/* Nutrition Chart */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Grafik Nutrisi
                    </h2>
                    <NutritionChart
                      nutrients={aggregateNutrients()}
                      targetClass={targetClass}
                    />
                  </div>
                </div>

                {/* ── Recommendations Panel — full width row below ── */}
                {recommendations?.combinedSaran && (
                  <div className="mt-6">
                    <RecommendationSummaryPanel
                      recommendations={recommendations.combinedSaran}
                      classNames={classNames}
                      targetClass={targetClass}
                      onApplyPortions={handleApplyPortions}
                      appliedGoalIds={appliedGoalIds}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DragOverlay>
            {activeRecipe ? (
              <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-4 shadow-lg opacity-80">
                <RecipeItem recipe={activeRecipe} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* QR Code Modal */}
        {showQRModal && (
          <QRModal
            qrCodeUrl={qrCodeUrl}
            menuName={currentMenuName}
            onClose={() => setShowQRModal(false)}
            onDownload={downloadQRCode}
          />
        )}
      </div>
    </div>
  );
}
