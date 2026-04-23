# 網紅頁配管家 (Influencer Campaign Manager)

一個管理網紅 / 業配 (頁配) 案件的完整網站：
- 📝 每個案子的基本資料、時程、收入、支出
- 📎 上傳發票 / 收據作為成本佐證 (jpg / png / webp / pdf / heic)
- 💰 自動計算每案淨利、毛利率、本月收支
- 📅 月曆 + 時間軸雙檢視，掌握所有排程與截止日
- 🔒 多用戶登入，資料完全隔離

## 技術

Next.js 14 (App Router) + TypeScript + Prisma + SQLite + NextAuth v5 + Tailwind CSS

## 安裝與啟動

需要 Node.js 18.17+。

```bash
# 1. 安裝依賴
npm install

# 2. 建立資料庫 (會自動生成 prisma/dev.db)
npx prisma migrate dev --name init

# 3. 啟動開發伺服器
npm run dev
```

打開瀏覽器：http://localhost:3000

> 第一次使用請先到 `/register` 建立帳號。

## 環境變數 (.env)

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<請產生一組隨機字串>"
AUTH_TRUST_HOST=true
```

產生 AUTH_SECRET (任一方式)：
```bash
openssl rand -base64 32
# 或 Node 內建：
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 目錄結構

```
src/
├── app/
│   ├── (app)/              # 登入後區域
│   │   ├── layout.tsx      # Sidebar
│   │   ├── dashboard/      # 總覽
│   │   ├── campaigns/      # 案件列表、新增、詳情、編輯
│   │   └── calendar/       # 月曆 + 時間軸
│   ├── api/
│   │   ├── auth/           # NextAuth
│   │   ├── register/
│   │   ├── campaigns/      # CRUD
│   │   ├── expenses/       # PATCH / DELETE
│   │   ├── upload/         # 發票上傳
│   │   └── files/          # 受保護的發票下載
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── components/             # Sidebar, CampaignForm, ExpenseManager, CalendarView ...
├── lib/                    # prisma.ts, auth.ts, money.ts, status.ts
└── middleware.ts           # 保護所有路由
prisma/schema.prisma
uploads/                    # 發票實體檔案 (首次上傳時自動建立)
```

## 資料模型

- **User**: id, email, passwordHash, name
- **Campaign**: title, vendor, platform, productUrl, notes, startDate, dueDate, postedDate, paidDate, revenue, revenueStatus (PENDING/RECEIVED), status (PLANNED/IN_PROGRESS/DONE/CANCELLED)
- **Expense**: category, description, amount, spentAt, invoiceFile (指向 `uploads/{userId}/{filename}`)

衍生數值 (即時計算)：
- 每案支出總和、淨利、毛利率
- 本月收入 / 支出 / 淨利
- 待收款清單、7 日內截止清單

## 常用指令

```bash
npm run dev           # 開發
npm run build         # 生產建置
npm run start         # 啟動生產伺服器
npm run db:migrate    # 建立/更新資料庫
npm run db:studio     # 開啟 Prisma Studio 直接看/改資料
```

## 安全性

- 密碼用 bcryptjs (10 rounds) 雜湊後存 DB
- 所有 API 路由與頁面都經過 middleware 驗證，未登入自動導回 `/login`
- 資料查詢一律帶 `where: { userId }`，使用者間完全隔離
- 發票檔案不在 `public/` 下，必須透過 `/api/files/*` 帶 session 才能讀取，且只能讀自己目錄

## 範圍之外 (未來可加)

- 匯出 Excel / PDF 報表
- Email 截止日提醒
- 多幣別
- 雲端檔案儲存 (S3)
- 行動 App
