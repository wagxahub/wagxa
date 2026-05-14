import { createBrowserRouter } from "react-router-dom";
import { Root } from "./pages/Root";

// 🔐 AUTH
import Login from "../pages/Login";

// 📄 PAGES
import { HomePage } from "./pages/HomePage";
import { Dashboard } from "./pages/Dashboard";
import { Wallet } from "./pages/Wallet";
import { Game } from "./pages/Game";
import { Predictions } from "./pages/Predictions";
import { VIPTasks } from "./pages/VIPTasks";
import { DailyRewards } from "./pages/DailyRewards";
import { DailyRebate } from "./pages/DailyRebate";
import { Referrals } from "./pages/Referrals";
import { Profile } from "./pages/Profile";
import { Upgrade } from "./pages/Upgrade";
import { Settings } from "./pages/Settings";
import { Notifications } from "./pages/Notifications";
import { Leaderboard } from "./pages/Leaderboard";

import { DicePool } from "./pages/DicePool";
import { WheelGame } from "./pages/WheelGame";
import { CrashGame } from "./pages/CrashGame";
import { PvPWheel } from "./pages/PvPWheel";
import PvPCoinFlip from "./pages/PvPCoinFlip";

import WelcomeBonus from "./pages/WelcomeBonus";
import BonusSuccess from "./pages/BonusSuccess";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,

    children: [
      // 🏠 LANDING PAGE
      { index: true, Component: HomePage },

      // 🔐 AUTH
      { path: "login", Component: Login },

      // 💰 MAIN DASHBOARD
      { path: "wallet", Component: Wallet },
      { path: "dashboard", Component: Dashboard },

      // 🎮 GAME PAGES
      { path: "game", Component: Game },
      { path: "dice-pool", Component: DicePool },
      { path: "wheel-game", Component: WheelGame },
      { path: "crash-game", Component: CrashGame },

      { path: "pvp-wheel", Component: PvPWheel },
      { path: "pvp-coinflip", Component: PvPCoinFlip },

      // 🧠 FEATURES
      { path: "predictions", Component: Predictions },
      { path: "vip-tasks", Component: VIPTasks },
      { path: "daily-rewards", Component: DailyRewards },
      { path: "daily-rebate", Component: DailyRebate },

      // 👤 ACCOUNT
      { path: "referrals", Component: Referrals },
      { path: "profile", Component: Profile },
      { path: "upgrade", Component: Upgrade },
      { path: "settings", Component: Settings },
      { path: "notifications", Component: Notifications },
      { path: "leaderboard", Component: Leaderboard },

      // 🎁 BONUS FLOW
      { path: "welcome-bonus", Component: WelcomeBonus },
      { path: "bonus-success", Component: BonusSuccess },
    ],
  },
]);
