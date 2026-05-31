# Install Einthusan TV as a Web App

Add **Einthusan TV** to your home screen on iOS or Android for a full-screen, app-like experience (no browser chrome).

**Requirements**

- Site served over **HTTPS** (required for install prompts and secure playback)
- Icons and manifest are included in `public/` — no extra setup needed after deploy

---

## iOS (iPhone / iPad) — Safari

1. Open **Safari** and go to your site (e.g. `https://einthusan.mainframe.website`)
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Edit the name if you like, then tap **Add**

The app opens in standalone mode with the red play icon. Use **Sign In** to sync My List and Continue Watching across devices.

**Tips**

- `apple-touch-icon` (180×180) is at `/icons/apple-touch-icon.png`
- Status bar uses black-translucent style for a cinematic look
- If video doesn’t resume, open the title from **Continue Watching** on the home page

---

## Android — Chrome

1. Open **Chrome** and go to your site
2. Tap the **⋮** menu (top right)
3. Tap **Install app** or **Add to Home screen**
   - On some devices you may see an banner: **Add Einthusan TV to Home screen**
4. Confirm **Install**

The PWA uses `manifest.webmanifest` with `display: standalone` and theme color `#141414`.

**Tips**

- Chrome may cache the manifest — hard-refresh once after a new deploy
- For **Samsung Internet**, use Menu → **Add page to** → **Home screen**

---

## Android — Other browsers

| Browser | Steps |
|---------|--------|
| **Firefox** | Menu → **Install** (if offered) or bookmark to home screen |
| **Edge** | Menu → **Add to phone** → **Install** |
| **Samsung Internet** | Menu → **Add page to** → **Home screen** |

---

## Verify install assets

After deploy, these URLs should load:

| Asset | URL |
|-------|-----|
| Web manifest | `/manifest.webmanifest` |
| Icon 192 | `/icons/icon-192.png` |
| Icon 512 | `/icons/icon-512.png` |
| Apple touch icon | `/icons/apple-touch-icon.png` |

Test manifest in Chrome DevTools → **Application** → **Manifest**.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No “Install” option | Ensure HTTPS; visit site twice; check manifest loads without 404 |
| Wrong icon on iOS | Clear Safari cache; re-add to home screen |
| App opens in browser tab | Remove old shortcut; re-install after HTTPS is active |
| Login doesn’t persist | Allow site data / cookies for your domain |

---

## Optional: enable IMDb metadata

Movie pages show ratings, cast, and runtime when the API has an OMDB key:

```bash
cd worker
npx wrangler secret put OMDB_API_KEY   # free key: https://www.omdbapi.com/apikey.aspx
npx wrangler secret put AUTH_SECRET    # random string for production auth
```

Get a free API key at [omdbapi.com](https://www.omdbapi.com/apikey.aspx).
