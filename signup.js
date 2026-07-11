import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value.trim();
  const pass = document.getElementById("signup-password").value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then((userCredential) => {
      sendEmailVerification(userCredential.user).then(() => {
        showToast("System verification transmission emitted. Check your inbox.", "success");
        setTimeout(() => { window.location.href = "index.html"; }, 2500);
      });
    })
    .catch(err => showToast(err.message, "error"));
});

function showToast(m, t="info") {
  const c = document.getElementById("toast-container");
  const el = document.createElement("div"); el.className = `toast ${t}`;
  el.innerHTML = `<span>${m}</span>`; c.appendChild(el);
  setTimeout(() => el.classList.add("active"), 10);
  setTimeout(() => { el.classList.remove("active"); setTimeout(() => el.remove(), 400); }, 3500);
}
