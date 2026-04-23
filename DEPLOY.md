# 上線部署手冊（Vercel + Neon + Blob）

按順序做，從頭到尾約 15–20 分鐘。

---

## ⚠️ 先確認

你需要：
- GitHub 帳號（免費）
- Vercel 帳號（免費）
- 一組你要用的管理員帳號密碼（等下要在網站上自己註冊第一個）

我已經幫你改過的事（**不用手動做**）：
- ✅ Prisma 從 SQLite 換成 PostgreSQL
- ✅ 發票上傳改用 Vercel Blob（雲端儲存）
- ✅ `package.json` build script 會自動跑 `prisma db push` 建 schema
- ✅ 產生了一組新的 AUTH_SECRET
- ✅ `.env.example` 說明所有環境變數

---

## Step 1. 把程式碼推到 GitHub（5 分鐘）

在 `C:\Users\combo\hanhan` 資料夾打開 PowerShell 或 Git Bash，執行：

```bash
cd /c/Users/combo/hanhan

# 初始化 git repo
git init
git add .
git commit -m "initial commit: ready for Vercel deploy"

# 在 GitHub 建一個新的 private repo (例如叫 hanhan)
# https://github.com/new
# 建好後複製它給你的 URL，類似 https://github.com/你的帳號/hanhan.git

git branch -M main
git remote add origin https://github.com/你的帳號/hanhan.git
git push -u origin main
```

---

## Step 2. 在 Vercel Import 專案（2 分鐘）

1. 打開 https://vercel.com/new
2. 找到剛推上去的 `hanhan` repo，點「Import」
3. **先不要按 Deploy** — 還需要設環境變數
4. 展開 **Environment Variables** 區塊，暫時什麼都不加（下一步處理）
5. 點擊畫面上方的 **Storage** 分頁（或直接按 Deploy 讓它失敗後再設，兩種都行）

> 如果 Vercel 讓你先 Deploy 才能看到 Storage 分頁，按 Deploy 讓它跑 — 第一次會失敗（因為還沒資料庫），不用擔心，繼續下一步。

---

## Step 3. 綁 Neon Postgres（3 分鐘）

在 Vercel 專案頁面：

1. 左邊側欄 → **Storage** → **Create Database**
2. 選 **Neon (Postgres)** → **Continue**
3. 取個名字（例如 `hanhan-db`）、選 **Region** = `Singapore (sin1)` 或 `Tokyo (hnd1)`（離台灣近）
4. Plan 選 **Free** → **Create**
5. 建好後 Vercel 會跳出「Connect Project」→ 勾你的 `hanhan` 專案 → **Connect**

👉 這會自動把 `DATABASE_URL`、`DATABASE_URL_UNPOOLED` 等變數寫進你的環境變數（檢查 Project → Settings → Environment Variables 應該看到）。

---

## Step 4. 綁 Vercel Blob（2 分鐘）

還在 Storage 頁面：

1. **Create** → 選 **Blob** → **Continue**
2. 取名 `hanhan-blob` → **Create**
3. Connect Project → 勾 `hanhan` → **Connect**

👉 會自動寫入 `BLOB_READ_WRITE_TOKEN` 環境變數。

---

## Step 5. 加 AUTH_SECRET（1 分鐘）

到 **Project → Settings → Environment Variables**，新增兩個：

| Name | Value | Environments |
|---|---|---|
| `AUTH_SECRET` | `fhmnmvW4mGx+cZlpLHhS6XeAf4D2/1vTSqgd+GZo/+s=` | Production, Preview, Development 都勾 |
| `AUTH_TRUST_HOST` | `true` | Production, Preview, Development 都勾 |

> ⚠️ 如果有洩漏疑慮，用這行在本機重產一組：
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```

---

## Step 6. 重新 Deploy（2 分鐘）

1. 回到專案首頁 → **Deployments** 分頁
2. 最上面一筆 → 右邊 **⋯** → **Redeploy**（取消勾選 "Use existing Build Cache"）
3. 等 2–3 分鐘看 build log

成功會長這樣（重點片段）：
```
Running "prisma db push..."
The database is already in sync with the Prisma schema.
Creating an optimized production build...
Build Completed in /vercel/output
```

---

## Step 7. 進網站、註冊你的帳號（1 分鐘）

1. Deployment 成功後點 **Visit** → 拿到網址 `https://hanhan-xxxx.vercel.app`
2. 自動導到 `/login` → 點 **註冊**
3. 建立你自己的管理員帳號
4. 登入後進 `/dashboard` — 上線完成 🎀

---

## Step 8.（建議）關閉公開註冊

現在網站任何人都能註冊。建立完自己帳號後，建議關掉：

最簡單的做法 — 直接把 `/register` 頁面和 `/api/register` 改成 404：

**選項 A. 手動改程式碼**（我可以幫你做，告訴我就好）
- 在 `src/app/register/page.tsx` 第一行加 `import { notFound } from "next/navigation";` 和 `notFound();`
- 在 `src/app/api/register/route.ts` 的 `POST` 一開始 return 404

**選項 B. 之後需要開新帳號就再打開**，平常關著就好。

---

## 日常維運

### 備份資料
- **資料庫**：Neon 控制台有「Branching」功能，可以隨時複製一份。也可以從 Neon Dashboard 匯出 SQL。
- **發票檔案**：Vercel Blob Dashboard 可以一個個下載，或寫腳本批次下。

### 查看 log
Vercel 專案 → **Logs** 分頁，即時 runtime log。

### 改 code 上線
```bash
# 本機改完
git add .
git commit -m "whatever"
git push
# Vercel 自動偵測、自動部署，約 2 分鐘後新版生效
```

### 本機開發連到 Neon
1. Neon Dashboard 複製 `Connection string`
2. 貼到本機 `.env` 的 `DATABASE_URL=` 後面
3. `npm run dev`
4. 現在你本機改 code 會直接讀寫 Neon 上的正式資料 — 小心操作！
    （進階：在 Neon 開一個 dev branch 給本機用，不會動到正式資料）

---

## 常見錯誤

| 錯誤訊息 | 原因 | 解法 |
|---|---|---|
| `DATABASE_URL is not set` | 忘記綁 Neon 或環境變數沒同步到環境 | Step 3，或 Redeploy 一次 |
| `Invalid prisma.client` on deploy | build 時 `prisma generate` 沒跑 | 已在 `postinstall` 自動跑，通常不會遇到 |
| 登入成功但立刻被踢回 login | `AUTH_SECRET` 沒設 或 `AUTH_TRUST_HOST` 沒設 | Step 5 |
| 發票上傳 500 錯誤 | Blob token 沒設 | Step 4 |
| 頁面白畫面 | build 失敗了 — 看 Deployments log | 把 error 貼給我 |

---

## 成本預估

全部在 Vercel + Neon 免費額度內，**月費 US$0**：

| 服務 | 免費額度 | 你的實際用量（估） |
|---|---|---|
| Vercel Hobby | 100 GB-Hr 函式執行 + 100 GB 頻寬 | 個人用 < 5% |
| Neon Postgres | 0.5 GB 儲存 + 190 小時 compute | 用 10 年都用不完 |
| Vercel Blob | 1 GB 儲存 + 5 GB 頻寬/月 | 每月新增 100 張發票約 50 MB |

有疑問就貼 error 訊息給我，會最快。
