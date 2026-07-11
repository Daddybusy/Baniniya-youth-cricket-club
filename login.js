import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then((cred) => {
      if(email === "shyamsmiritiyuwacricketclub@gmail.com") {
         window.location.href = "admin.html";
      } else {
         window.location.href = "index.html";
      }
    })
    .catch(err => showToast(err.message, "error"));
});

document.getElementById("forgot-pass").addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  if(!email) return showToast("Provide your execution email in the input area first.", "error");
  sendPasswordResetEmail(auth, email)
    .then(() => showToast("Password reset matrix communication vector sent to email.", "success"))
    .catch(err => showToast(err.message, "error"));
});

function showToast(m, t="info") {
  const c = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast ${t}`;
  el.innerHTML = `<span>${m}</span>`;
  c.appendChild(el);
  setTimeout(() => el.classList.add("active"), 10);
  setTimeout(() => { el.classList.remove("active"); setTimeout(() => el.remove(), 400); }, 3500);
}
