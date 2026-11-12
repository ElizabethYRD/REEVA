import {
  initializeApp,
  getApp,
  getApps
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpBhZW9L8hKYwFR9kJycRSbi6nadZPJ9c",
  authDomain: "reeva-9b01f.firebaseapp.com",
  projectId: "reeva-9b01f",
  storageBucket: "reeva-9b01f.firebasestorage.app",
  messagingSenderId: "574458340001",
  appId: "1:574458340001:web:572bffafb007be40fd86e0"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (s) => document.querySelector(s);

/* ---------- Elements ---------- */
const profileView = $("#profile-view");
const profileEditor = $("#profile-editor");
const form = $("#profile-form");

const editButton = $("#edit-profile");
const logoutButton = $("#logout-btn");
const cancelButton = $("#cancel-edit");
const saveButton = $("#save-profile");

const nameInput = $("#display-name");
const locationInput = $("#profile-location");
const linkInput = $("#profile-link");
const bioInput = $("#profile-bio");
const bioCounter = $("#bio-counter");
const interestPicker = $("#interest-picker");

const nameHeading = $("#profile-name");
const emailText = $("#profile-email");
const avatar = $("#avatar");
const metaList = $("#profile-meta");
const bioView = $("#profile-bio-view");
const interestsBlock = $("#interests-block");
const interestsView = $("#profile-interests");
const bannerView = $("#profile-banner-view");
const bannerImage = $("#profile-banner-image");

const editBanner = $("#edit-banner");
const editBannerImg = $("#edit-banner-img");
const bannerFile = $("#banner-file");
const bannerPick = $("#banner-pick");
const bannerRemove = $("#banner-remove");
const bannerPos = $("#banner-pos");
const bannerPosWrap = $("#banner-pos-wrap");

const editAvatar = $("#edit-avatar");
const avatarFile = $("#avatar-file");
const avatarPick = $("#avatar-pick");
const avatarRemove = $("#avatar-remove");

const statusText = $("#profile-status");
const editorStatus = $("#editor-status");

const INTERESTS = [
  "Upcycled Clothing", "Sustainable Fashion", "Vintage", "Streetwear",
  "DIY & Sewing", "Accessories", "Denim", "Thrifting"
];
const MAX_INTERESTS = 5;

let currentUser = null;
let currentProfile = {};

/* Pending edits: undefined = unchanged, "" = removed, string = new image */
let pendingPhoto;
let pendingBanner;
let selectedInterests = [];

/* ---------- Helpers ---------- */
function showStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? "#b00020" : "#386641";
}

function showEditorStatus(message, isError = false) {
  editorStatus.textContent = message;
  editorStatus.style.color = isError ? "#b00020" : "#386641";
}

function initial(name) {
  return (name || "R").trim().charAt(0).toUpperCase() || "R";
}

function paintAvatar(el, name, picture) {
  el.replaceChildren();
  if (picture) {
    const img = document.createElement("img");
    img.src = picture;
    img.alt = "Profile picture";
    img.referrerPolicy = "no-referrer";
    img.onerror = () => { el.textContent = initial(name); };
    el.appendChild(img);
  } else {
    el.textContent = initial(name);
  }
}

function paintBanner(box, img, src, pos = 50) {
  if (src) {
    img.src = src;
    img.style.objectPosition = `50% ${pos}%`;
    box.classList.remove("empty");
    img.onerror = () => box.classList.add("empty");
  } else {
    img.removeAttribute("src");
    box.classList.add("empty");
  }
}

function safeUrl(value) {
  try {
    const u = new URL(value);
    return /^https?:$/.test(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
}

function metaItem(text, href) {
  const li = document.createElement("li");
  if (href) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = text;
    li.append(a);
  } else {
    li.textContent = text;
  }
  return li;
}

function memberSince() {
  const ts = currentProfile.createdAt;
  const d = ts?.toDate
    ? ts.toDate()
    : currentUser?.metadata?.creationTime
      ? new Date(currentUser.metadata.creationTime)
      : null;
  return d && !isNaN(d)
    ? d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";
}

/* ---------- Image processing (resize + compress in the browser) ---------- */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}

function encode(canvas, maxChars) {
  let q = 0.88;
  let out = canvas.toDataURL("image/jpeg", q);
  while (out.length > maxChars && q > 0.4) {
    q -= 0.08;
    out = canvas.toDataURL("image/jpeg", q);
  }
  return out;
}

async function processImage(file, kind) {
  if (!file.type.startsWith("image/")) throw new Error("not-image");
  if (file.size > 15 * 1024 * 1024) throw new Error("too-big");

  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";

  if (kind === "avatar") {
    // Square crop from the center
    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;
    canvas.width = canvas.height = 360;
    ctx.fillRect(0, 0, 360, 360);
    ctx.drawImage(img, sx, sy, size, size, 0, 0, 360, 360);
    return encode(canvas, 90000);
  }

  // Banner: keep the whole picture, limit its size
  let scale = Math.min(1, 1400 / img.width, 800 / img.height);
  let out = "";
  for (let i = 0; i < 4; i++) {
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    out = encode(canvas, 380000);
    if (out.length <= 380000) break;
    scale *= 0.8;
  }
  return out;
}

function imageErrorMessage(err) {
  if (err.message === "not-image") return "Please choose an image file (JPG, PNG, WebP).";
  if (err.message === "too-big") return "That image is too large. Please choose one under 15 MB.";
  return "We could not read that image. Try a different one.";
}

/* ---------- Render ---------- */
function renderProfile() {
  const name =
    currentProfile.name || currentUser?.displayName || currentUser?.email || "REEVA Member";

  nameHeading.textContent = name;
  emailText.textContent = currentUser?.email || "Signed-in account";
  bioView.textContent = currentProfile.bio || "Your story will appear here.";

  paintAvatar(avatar, name, currentProfile.photo || currentUser?.photoURL || "");
  paintBanner(bannerView, bannerImage, currentProfile.banner || "", currentProfile.bannerPos ?? 50);

  metaList.replaceChildren();
  if (currentProfile.role === "designer") {
    const studio = currentProfile.designerProfile?.studio;
    metaList.append(metaItem("🧵 Designer" + (studio ? " · " + studio : "")));
  } else if (currentProfile.role === "client") {
    metaList.append(metaItem("🛍 Client"));
  }
  if (currentProfile.location) metaList.append(metaItem("📍 " + currentProfile.location));
  const link = safeUrl(currentProfile.link || "");
  if (link) metaList.append(metaItem("🔗 " + new URL(link).hostname.replace(/^www\./, ""), link));
  const since = memberSince();
  if (since) metaList.append(metaItem("✦ Member since " + since));

  const tags = Array.isArray(currentProfile.interests) ? currentProfile.interests : [];
  interestsView.replaceChildren();
  tags.forEach((t) => {
    const s = document.createElement("span");
    s.className = "chip";
    s.textContent = t;
    interestsView.append(s);
  });
  interestsBlock.hidden = tags.length === 0;
}

function renderSignedOut() {
  nameHeading.textContent = "Your profile";
  emailText.textContent = "Please sign in to view your account.";
  bioView.textContent = "Sign in to see your profile details.";
  paintAvatar(avatar, "R", "");
  paintBanner(bannerView, bannerImage, "");
  metaList.replaceChildren();
  interestsBlock.hidden = true;
  editButton.hidden = true;
  logoutButton.hidden = true;

  const a = document.createElement("a");
  a.className = "pf-btn";
  a.href = "index.html";
  a.textContent = "Go to REEVA to sign in";
  a.id = "signin-link";
  if (!$("#signin-link")) $(".pf-actions").append(a);
}

function openProfileView() {
  profileEditor.hidden = true;
  profileView.hidden = false;
  showStatus("");
}

/* ---------- Editor ---------- */
function renderInterestPicker() {
  interestPicker.replaceChildren();
  INTERESTS.forEach((label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = label;
    b.setAttribute("aria-pressed", selectedInterests.includes(label));
    b.addEventListener("click", () => {
      if (selectedInterests.includes(label)) {
        selectedInterests = selectedInterests.filter((t) => t !== label);
      } else if (selectedInterests.length >= MAX_INTERESTS) {
        showEditorStatus(`You can pick up to ${MAX_INTERESTS} styles.`, true);
        return;
      } else {
        selectedInterests.push(label);
      }
      showEditorStatus("");
      renderInterestPicker();
    });
    interestPicker.append(b);
  });
}

function refreshEditorPreviews() {
  const name = nameInput.value || currentProfile.name || currentUser?.displayName || "R";
  const photo = pendingPhoto !== undefined
    ? pendingPhoto
    : (currentProfile.photo || "");
  paintAvatar(editAvatar, name, photo || currentUser?.photoURL || "");

  const banner = pendingBanner !== undefined ? pendingBanner : (currentProfile.banner || "");
  paintBanner(editBanner, editBannerImg, banner, Number(bannerPos.value));
  bannerPosWrap.hidden = !banner;
}

function openProfileEditor() {
  if (!currentUser) {
    showStatus("Please sign in to edit your profile.", true);
    return;
  }

  pendingPhoto = undefined;
  pendingBanner = undefined;

  nameInput.value = currentProfile.name || currentUser.displayName || "";
  locationInput.value = currentProfile.location || "";
  linkInput.value = currentProfile.link || "";
  bioInput.value = currentProfile.bio || "";
  bannerPos.value = currentProfile.bannerPos ?? 50;
  bioCounter.textContent = `${bioInput.value.length} / 300`;
  selectedInterests = Array.isArray(currentProfile.interests) ? [...currentProfile.interests] : [];

  renderInterestPicker();
  refreshEditorPreviews();
  showEditorStatus("");
  profileView.hidden = true;
  profileEditor.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Load ---------- */
async function loadProfile(firebaseUser) {
  currentUser = firebaseUser;
  saveButton.disabled = true;
  editButton.hidden = false;
  logoutButton.hidden = false;
  $("#signin-link")?.remove();
  showStatus("Loading your profile...");

  try {
    const snap = await getDoc(doc(db, "users", firebaseUser.uid));
    currentProfile = snap.exists() ? snap.data() : {};
    renderProfile();
    openProfileView();
    showStatus("");
  } catch (error) {
    console.error("Could not load profile:", error);
    currentProfile = {};
    renderProfile();
    openProfileView();
    showStatus("Could not load saved details. Check your connection and Firestore rules.", true);
  } finally {
    saveButton.disabled = false;
  }
}

/* ---------- Events ---------- */
editButton.addEventListener("click", openProfileEditor);
cancelButton.addEventListener("click", openProfileView);

logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Sign out failed:", error);
    showStatus("Could not log out. Please try again.", true);
  }
});

bioInput.addEventListener("input", () => {
  bioCounter.textContent = `${bioInput.value.length} / 300`;
});
nameInput.addEventListener("input", refreshEditorPreviews);
bannerPos.addEventListener("input", refreshEditorPreviews);

avatarPick.addEventListener("click", () => avatarFile.click());
bannerPick.addEventListener("click", () => bannerFile.click());

avatarRemove.addEventListener("click", () => {
  pendingPhoto = "";
  refreshEditorPreviews();
});
bannerRemove.addEventListener("click", () => {
  pendingBanner = "";
  refreshEditorPreviews();
});

async function handleFile(input, kind) {
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  showEditorStatus("Processing your image...");
  try {
    const data = await processImage(file, kind);
    if (kind === "avatar") pendingPhoto = data;
    else pendingBanner = data;
    refreshEditorPreviews();
    showEditorStatus("Image ready. Don't forget to save your changes.");
  } catch (err) {
    showEditorStatus(imageErrorMessage(err), true);
  }
}
avatarFile.addEventListener("change", () => handleFile(avatarFile, "avatar"));
bannerFile.addEventListener("change", () => handleFile(bannerFile, "banner"));

onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) {
    currentUser = null;
    currentProfile = {};
    profileEditor.hidden = true;
    profileView.hidden = false;
    renderSignedOut();
    showStatus("Please sign in to view your profile.", true);
    return;
  }
  await loadProfile(firebaseUser);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    showEditorStatus("Please sign in before saving.", true);
    return;
  }

  const name = nameInput.value.trim();
  const location = locationInput.value.trim();
  const rawLink = linkInput.value.trim();
  const bio = bioInput.value.trim();

  if (name.length < 2) {
    showEditorStatus("Please enter a name with at least 2 characters.", true);
    return;
  }

  let link = "";
  if (rawLink) {
    link = safeUrl(rawLink);
    if (!link) {
      showEditorStatus("Please enter a link beginning with https://", true);
      return;
    }
  }

  const photo = pendingPhoto !== undefined ? pendingPhoto : (currentProfile.photo || "");
  const banner = pendingBanner !== undefined ? pendingBanner : (currentProfile.banner || "");
  const pos = Number(bannerPos.value);

  saveButton.disabled = true;
  showEditorStatus("Saving your changes...");

  try {
    await updateProfile(currentUser, { displayName: name });

    const data = {
      uid: currentUser.uid,
      name,
      email: currentUser.email || "",
      photo,
      banner,
      bannerPos: pos,
      location,
      link,
      interests: selectedInterests,
      bio,
      provider: currentUser.providerData[0]?.providerId || "password",
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });

    currentProfile = { ...currentProfile, ...data };
    renderProfile();
    openProfileView();
    showStatus("Your changes have been saved.");
  } catch (error) {
    console.error("Could not save profile:", error);
    showEditorStatus(
      "Could not save changes. Check your connection and Firestore rules.",
      true
    );
  } finally {
    saveButton.disabled = false;
  }
});
