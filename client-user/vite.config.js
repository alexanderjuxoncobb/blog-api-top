import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});

// //TODO:
// 1. have three types.normal, user who can comment and author who can post and admin who can do all + delete anyone's post
// 2. so i need to make a client for admin.and i need to change some of these routes exitCode.I p[robably need an admin tag for me ?]

// also, try adding an auth so that a user can only delete theior own posts. but an admin can delete any post. we should implement storing posts on aws maybe?

// note: good claude chat under the caching user dtaa for faster removeLocalizedDigits. use that as the basis for building this out.

// note: need to`:
// front end to look nicer
// include nextJS ?
// then build and set up the admin side of the app
