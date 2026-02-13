# 🚀 KAU Cafeteria — Setup Guide
## No credit card. No billing. Completely free.

---

## PART 1 — JSONBin Setup (you need TWO bins now)

You already have one bin for the menu. Now create a second one for users & tickets.
This is what makes everything work across all devices.

### Your existing bin = MENU bin (keep it)
Go to jsonbin.io → find your existing bin → copy its ID. That's your MENU_BIN_ID.

### Create a second bin = DATA bin
1. Go to jsonbin.io and log in
2. Click "Create Bin"
3. Paste this as the content:
   {"users":[],"tickets":[],"workers":[{"id":"worker1","email":"worker@kau.edu.sa","password":"worker123","name":"Cafeteria Worker"}]}
4. Click "Create Bin"
5. Copy the new Bin ID — this is your DATA_BIN_ID

### Fill in JS/jsonbin-config.js with ALL THREE values:

   window.JSONBIN_CONFIG = {
       API_KEY:     "your-api-key",
       MENU_BIN_ID: "your-menu-bin-id",   ← the OLD bin you already had
       DATA_BIN_ID: "your-new-bin-id"     ← the NEW bin you just created
   };

---

## PART 2 — GitHub Pages Deployment

1. Upload all files to your GitHub repo (Ada6767/KAU-Cafeteria)
   - Make sure index.html is in the ROOT of the repo, not inside a folder
2. Go to Settings → Pages → Branch: main → Save
3. Site goes live at: https://Ada6767.github.io/KAU-Cafeteria

---

## Worker Login Credentials
   Email:    worker@kau.edu.sa
   Password: worker123

---

## Daily Menu Update
Go to: yoursite/admin/index.html
Select date → Add dishes → Save

