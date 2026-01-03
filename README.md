# TAMAKOECHI 🥚

這是一個使用 React + TypeScript + Vite 製作的網頁版塔麻可吉 (Tamagotchi)。
復古的像素風格，搭配粉紅果凍質感的機身設計。

🔗 **線上試玩**: [點擊這裡前往 GitHub Pages](https://bbskiz0405.github.io/TAMAKOE/)

---

## 📅 開發進度日誌 (Dev Log)

### ✅ 已完成 (2026-01-03)
*   **環境建置**: 
    *   [x] 初始化 Vite + React + TypeScript 專案。
    *   [x] 設定 `vite.config.ts` (base path) 以支援 GitHub Pages。
*   **核心遊戲邏輯**:
    *   [x] **狀態系統**: 實作飽食度 (Hunger)、快樂度 (Happiness)、生命值 (Health)。
    *   [x] **生命週期**: 蛋 (Egg) -> 幼年 (Child) -> 成年 (Adult) -> 死亡 (Dead)。
    *   [x] **互動功能**: 餵食 (Feed)、玩耍 (Play)、打掃 (Clean)、治療 (Heal)。
    *   [x] **排泄機制**: 隨機大便，不清理會扣血。
*   **介面設計 (UI/UX)**:
    *   [x] **風格**: 實作「粉紅果凍」復古機身與像素 (Pixel Art) 風格。
    *   [x] **動畫**: 寵物跳動動畫、按鈕按壓回饋。
    *   [x] **字體**: 引入 Google Fonts `Press Start 2P` 像素字體。
*   **部署與版控**:
    *   [x] 設定 `gh-pages` 自動部署腳本。
    *   [x] 整理 Git 分支 (Master 為開發主線, gh-pages 為發布線)。

---

## 🚀 待辦事項 (To-Do List)
*這些是下次開發可以考慮的方向：*

1.  **💾 存檔功能 (Data Persistence)**
    *   目前重新整理網頁，寵物就會重置。
    *   目標：使用 `localStorage` 將寵物狀態存起來，讓它在你關掉視窗後還能「活著」。
2.  **🔊 音效 (Sound Effects)**
    *   加入 8-bit 的按鈕音效、進食聲、進化音效。
3.  **🌙 睡眠模式 (Sleep Mode)**
    *   加入關燈功能，讓寵物睡覺（暫停飢餓度下降）。
4.  **🌲 更多進化路線**
    *   根據照顧的好壞（例如大便沒清的次數），進化成不同的成年型態。

---

## 🛠️ 如何開始 (Setup)

1. 安裝依賴:
   ```bash
   npm install
   ```
2. 啟動本地開發伺服器:
   ```bash
   npm run dev
   ```
3. 部署到 GitHub Pages:
   ```bash
   npm run deploy
   ```