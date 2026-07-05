# n8n → Buffer workflow

Automate posting approved content to Instagram/TikTok via Buffer.

## Prerequisites

1. Buffer API key + channel IDs in `.env`
2. `docker compose up` with app + n8n running
3. Content must have **public** media URL in `attachments` (not `/uploads/...` alone)

## `.env` variables

```env
N8N_API_KEY=your-n8n-key
BUFFER_API_KEY=your-buffer-key
BUFFER_IG_CHANNEL_ID=6a473ba65ab6d2f1069bd878
BUFFER_TIKTOK_CHANNEL_ID=6a473d135ab6d2f1069bdc4a
APP_PUBLIC_URL=http://localhost:3001
```

Restart n8n after changing env:

```bash
docker compose up -d n8n
```

## Workflow nodes (in order)

```
Schedule Trigger
  → Fetch Due Content (HTTP GET)
  → Split Out (items)
  → Prepare Buffer Posts (Code)
  → Post to Buffer (HTTP POST)
  → Buffer OK? (IF)
      true  → Mark Posted (HTTP PATCH)
      false → (optional) log error
```

---

### 1. Schedule Trigger

- **Trigger interval:** Every 15 minutes (or custom)

---

### 2. Fetch Due Content (HTTP Request)

| Field | Value |
|---|---|
| Method | GET |
| URL | `http://app:3000/api/content/scheduled` |
| Header | `x-api-key` = `{{ $env.N8N_API_KEY }}` |

> Use `http://app:3000` from inside Docker. From host machine use `http://localhost:3001`.

---

### 3. Split Out

| Field | Value |
|---|---|
| Fields To Split Out | `items` |
| Include | No Other Fields |

---

### 4. Prepare Buffer Posts (Code)

- **Mode:** Run Once for **All** Items (not "Each Item" — n8n 2.x only allows one `{ json: {} }` per item in Each mode)
- **Language:** JavaScript
- Paste code from `n8n/code/prepare-buffer-posts.js`

This outputs **one item per platform** (e.g. IG + TikTok = 2 items).

---

### 5. Post to Buffer (Code node — ไม่ใช้ HTTP Request)

HTTP Request node ใน n8n 4.4 ส่ง body/header ผิดบ่อย — ใช้ **Code node** แทน

- **Mode:** Run Once for **All** Items
- Paste code from `n8n/code/post-to-buffer.js`

Code node เรียก `this.helpers.httpRequest()` ไปที่ `https://api.buffer.com` — **อย่าใช้ `fetch()`** (n8n task runner ไม่มี)

> ลบ HTTP Request node เก่าออก แล้วแทนด้วย Code node ชื่อ "Post to Buffer"

---

### 6. Buffer OK? (IF)

| Field | Value |
|---|---|
| Condition | `{{ $json.data.createPost.post.id }}` **exists** |

On **false** branch: Buffer returned an error in `data.createPost.message`.

---

### 7. Mark Posted (HTTP Request)

| Field | Value |
|---|---|
| Method | PATCH |
| URL | `http://app:3000/api/content/{{ $('Prepare Buffer Posts').item.json.contentId }}` |
| Header | `x-api-key` = `{{ $env.N8N_API_KEY }}` |
| Header | `Content-Type` = `application/json` |
| Body | `{ "status": "posted" }` |

> If content has 2 platforms, PATCH may run twice — safe (idempotent).

---

## Test end-to-end

1. Create content in app with:
   - status **approved** (via Admin)
   - `scheduledDate` / `scheduledTime` = now or past
   - platforms: `instagram`, `tiktok`
   - attachment = full public URL (e.g. `https://picsum.photos/id/237/800/800.jpg`)
2. Click **Execute workflow** in n8n
3. Check IG/TikTok for new post
4. Content status should become `posted` in app

## Import workflow JSON

Import `n8n/workflows/content-post-buffer.json` from n8n → **Workflows → Import from File**.

After import, verify `$env` variables are set in docker-compose for n8n.
