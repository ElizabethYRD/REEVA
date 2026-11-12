
import {
  initializeApp,
  getApp,
  getApps
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  indexedDBLocalPersistence
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
console.log("REEVA profile — project:", app.options.projectId);
console.log("REEVA profile — auth app:", auth.app.name);
console.log("REEVA profile — origin:", window.location.origin);
const db = getFirestore(app);

// Main elements
const profileView = document.querySelector("#profile-view");
const profileEditor = document.querySelector("#profile-editor");
const form = document.querySelector("#profile-form");

const editButton = document.querySelector("#edit-profile");
const cancelButton = document.querySelector("#cancel-edit");
const saveButton = document.querySelector("#save-profile");

// Form fields
const nameInput = document.querySelector("#display-name");
const bannerInput = document.querySelector("#profile-banner");
const bioInput = document.querySelector("#profile-bio");

// Profile display
const nameHeading = document.querySelector("#profile-name");
const emailText = document.querySelector("#profile-email");
const avatar = document.querySelector("#avatar");
const bioView = document.querySelector("#profile-bio-view");
const bannerView = document.querySelector("#profile-banner-view");
const bannerImage = document.querySelector("#profile-banner-image");

// Messages
const statusText = document.querySelector("#profile-status");
const editorStatus = document.querySelector("#editor-status");

let currentUser = null;
let currentProfile = {};

function showStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? "#b00020" : "#386641";
}

function showEditorStatus(message, isError = false) {
  editorStatus.textContent = message;
  editorStatus.style.color = isError ? "#b00020" : "#386641";
}

function showAvatar(name, picture = "") {
  avatar.replaceChildren();

  if (picture) {
    const img = document.createElement("img");
    img.src = picture;
    img.alt = "Profile picture";
    img.referrerPolicy = "no-referrer";

    img.onerror = () => {
      avatar.textContent = (name || "R").trim().charAt(0).toUpperCase();
    };

    avatar.appendChild(img);
  } else {
    avatar.textContent = (name || "R").trim().charAt(0).toUpperCase();
  }
}

function renderProfile() {
  const name =
    currentProfile.name ||
    currentUser?.displayName ||
    currentUser?.email ||
    "REEVA Member";

  nameHeading.textContent = name;
  emailText.textContent = currentUser?.email || "Signed-in account";
  bioView.textContent =
    currentProfile.bio || "Your story will appear here.";

  showAvatar(
    name,
    currentProfile.picture || currentUser?.photoURL || ""
  );

  const banner = currentProfile.banner || "";

  if (banner) {
    bannerImage.src = banner;
    bannerView.hidden = false;

    bannerImage.onerror = () => {
      bannerView.hidden = true;
    };
  } else {
    bannerImage.removeAttribute("src");
    bannerView.hidden = true;
  }
}

function openProfileView() {
  profileEditor.hidden = true;
  profileView.hidden = false;
  showStatus("");
}

function openProfileEditor() {
  if (!currentUser) {
    showStatus("Please sign in to edit your profile.", true);
    return;
  }

  nameInput.value =
    currentProfile.name || currentUser.displayName || "";

  bannerInput.value = currentProfile.banner || "";
  bioInput.value = currentProfile.bio || "";

  showEditorStatus("");
  profileView.hidden = true;
  profileEditor.hidden = false;
}

async function loadProfile(firebaseUser) {
  currentUser = firebaseUser;
  saveButton.disabled = true;
  showStatus("Loading your profile...");

  try {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    currentProfile = userSnap.exists() ? userSnap.data() : {};

    renderProfile();
    openProfileView();
    showStatus("Your profile is ready.");
  } catch (error) {
    console.error("Could not load profile:", error);

    currentProfile = {};
    renderProfile();
    openProfileView();

    showStatus(
      "Could not load saved details. Check your connection and Firestore rules.",
      true
    );
  } finally {
    saveButton.disabled = false;
  }
}

// Open the editor only when requested
editButton.addEventListener("click", openProfileEditor);

// Return to the profile without saving
cancelButton.addEventListener("click", openProfileView);

// Watch Firebase login state
onAuthStateChanged(auth, async (firebaseUser) => {
  console.log(
    "REEVA profile — Firebase user:",
    firebaseUser?.uid ?? null
  );

  if (!firebaseUser) {
    currentUser = null;
    currentProfile = {};

    profileEditor.hidden = true;
    profileView.hidden = false;

    nameHeading.textContent = "Your profile";
    emailText.textContent = "Please sign in to view your account.";
    bioView.textContent = "Sign in to see your profile details.";
    showAvatar("R");
    bannerView.hidden = true;

    showStatus("Please sign in to view your profile.", true);
    return;
  }

  await loadProfile(firebaseUser);
});

// Save profile changes
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    showEditorStatus("Please sign in before saving.", true);
    return;
  }

  const name = nameInput.value.trim();
  const banner = bannerInput.value.trim();
  const bio = bioInput.value.trim();

  if (name.length < 2) {
    showEditorStatus(
      "Please enter a name with at least 2 characters.",
      true
    );
    return;
  }

  if (banner && !/^https?:\/\//i.test(banner)) {
    showEditorStatus(
      "Please enter an image URL beginning with https:// or http://.",
      true
    );
    return;
  }

  saveButton.disabled = true;
  showEditorStatus("Saving your changes...");

  try {
    await updateProfile(currentUser, {
      displayName: name
    });

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        uid: currentUser.uid,
        name,
        email: currentUser.email || "",
        picture: currentUser.photoURL || "",
        banner,
        bio,
        provider:
          currentUser.providerData[0]?.providerId || "password",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    currentProfile = {
      ...currentProfile,
      name,
      banner,
      bio,
      email: currentUser.email || "",
      picture: currentUser.photoURL || ""
    };

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
