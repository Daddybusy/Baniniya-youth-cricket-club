import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { runTransaction, doc, collection, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-step");
  const dots = document.querySelectorAll(".step-dot");
  const progressBar = document.getElementById("reg-progress");
  const loader = document.getElementById("loader-wrapper");
  const navDashboardBtn = document.getElementById("nav-dashboard-btn");
  const logoutBtn = document.getElementById("logout-btn");
  let currentUser = null;
  let currentStep = 1;

  // Initialize GSAP Loader Animation Escape
  gsap.to(loader, { opacity: 0, duration: 0.6, delay: 1, onComplete: () => loader.classList.add("hidden") });

  // Security Observer Interface
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      document.getElementById("email-address").value = user.email;
      logoutBtn.classList.remove("hidden");
      navDashboardBtn.classList.remove("hidden");
      checkExistingRegistration(user.uid);
    } else {
      window.location.href = "login.html";
    }
  });

  async function checkExistingRegistration(uid) {
    const docRef = doc(db, "registrations", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      showToast("Redirecting to dashboard profile space...", "success");
      setTimeout(() => { window.location.href = "member.html"; }, 1500);
    }
  }

  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => { window.location.href = "login.html"; });
  });

  navDashboardBtn.addEventListener("click", () => { window.location.href = "member.html"; });

  // Navigation Logic Controller
  document.querySelectorAll(".btn-next").forEach(btn => {
    btn.addEventListener("click", () => {
      if (validateStep(currentStep)) {
        currentStep++;
        updateStepUI();
      } else {
        showToast("Please fully complete all parameters on this page.", "error");
      }
    });
  });

  document.querySelectorAll(".btn-prev").forEach(btn => {
    btn.addEventListener("click", () => {
      currentStep--;
      updateStepUI();
    });
  });

  function validateStep(step) {
    if (step === 1) {
      return document.getElementById("full-name").value.trim() !== "" &&
             document.getElementById("age").value.trim() !== "" &&
             document.getElementById("contact-number").value.trim() !== "";
    }
    if (step === 5) {
      return document.getElementById("current-location").value.trim() !== "";
    }
    if (step === 6) {
      return document.getElementById("permanent-address").value.trim() !== "";
    }
    return true;
  }

  function updateStepUI() {
    steps.forEach(step => step.classList.remove("active-step"));
    dots.forEach(dot => dot.classList.remove("active"));
    
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add("active-step");
    for (let i = 0; i < currentStep; i++) {
      dots[i].classList.add("active");
    }
    
    const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;
    progressBar.style.width = `${progressPercent}%`;

    if (currentStep === 7) {
      compileReviewData();
    }
  }

  function compileReviewData() {
    const board = document.getElementById("review-board");
    board.innerHTML = `
      <div class="review-item"><span>Full Name</span><span>${document.getElementById("full-name").value}</span></div>
      <div class="review-item"><span>Age</span><span>${document.getElementById("age").value}</span></div>
      <div class="review-item"><span>Contact</span><span>${document.getElementById("contact-number").value}</span></div>
      <div class="review-item"><span>Category</span><span>${document.querySelector('input[name="category"]:checked').value}</span></div>
      <div class="review-item"><span>Playing Role</span><span>${document.querySelector('input[name="playing-role"]:checked').value}</span></div>
      <div class="review-item"><span>Actively Playing</span><span>${document.querySelector('input[name="currently-playing"]:checked').value}</span></div>
      <div class="review-item"><span>Current Location</span><span>${document.getElementById("current-location").value}</span></div>
      <div class="review-item"><span>Village</span><span>${document.getElementById("village").value}</span></div>
    `;
  }

  // Atomic Firestore Transaction Framework for Guaranteed Incremental Unique IDs
  document.getElementById("registration-multi-step").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    loader.classList.remove("hidden");
    gsap.to(loader, { opacity: 1, duration: 0.3 });

    const counterRef = doc(db, "counters", "registrations");
    const registrationRef = doc(db, "registrations", currentUser.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        let nextId = 1;
        
        if (counterSnap.exists()) {
          nextId = counterSnap.data().currentValue + 1;
        }
        
        const paddedId = String(nextId).padStart(4, '0');
        const generatedRegId = `BYCC${paddedId}`;

        const payload = {
          uid: currentUser.uid,
          registrationId: generatedRegId,
          fullName: document.getElementById("full-name").value.trim(),
          age: parseInt(document.getElementById("age").value),
          contact: document.getElementById("contact-number").value.trim(),
          email: currentUser.email,
          category: document.querySelector('input[name="category"]:checked').value,
          playingRole: document.querySelector('input[name="playing-role"]:checked').value,
          currentlyPlaying: document.querySelector('input[name="currently-playing"]:checked').value,
          currentLocation: document.getElementById("current-location").value.trim(),
          municipality: document.getElementById("municipality").value,
          ward: document.getElementById("ward-number").value,
          village: document.getElementById("village").value,
          permanentAddress: document.getElementById("permanent-address").value.trim(),
          status: "Pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        transaction.set(registrationRef, payload);
        transaction.set(counterRef, { currentValue: nextId }, { merge: true });
      });

      showToast("Atomic Sequence ID secured. Registration success!", "success");
      setTimeout(() => { window.location.href = "member.html"; }, 2000);

    } catch (err) {
      console.error(err);
      showToast(`Transaction Failure: ${err.message}`, "error");
      gsap.to(loader, { opacity: 0, duration: 0.3, onComplete: () => loader.classList.add("hidden") });
    }
  });

  function showToast(msg, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("active"), 50);
    setTimeout(() => {
      toast.classList.remove("active");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
});
