# tofu

# 藤原豆腐店訂單系統 

一個模擬小型商家（頭文字D 藤原豆腐店）的 **訂單系統**，  
包含「客戶端下單 / 電話查詢」與「後台管理」功能。

---

## Live Demo

- **Client（客戶端）**  
  [https://tofu-7d64.onrender.com](https://tofu-7d64.onrender.com)

- **Dashboard（後台）**  
  [https://tofu-7d64.onrender.com/users/login](https://tofu-7d64.onrender.com/users/login)

>  Render free 方案可能需要 **20–40 seconds** 冷啟動喚醒 (cold start).

---

## 技術棧

- Frontend: EJS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Deployment: Render

---

## 功能

### 客戶端
- 顧客端下單：數量加減介面，即時計算總金額
- 防過勞機制：後端實作時段訂單上限（每小時2筆），確保配送品質（不讓拓海過勞）
- 訂單追蹤：顧客憑電話號碼即可查詢歷史訂單與即時配送狀態

### 後台
- CRUD 完整實作：查看所有訂單、更新配送狀態、刪除過期紀錄

---

## 備註
- 本專案為學習與展示用途
- 重點放在 系統設計、資料驗證與前後端整合。# tofu
