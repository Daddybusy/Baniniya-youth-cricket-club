import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  let uBlock = null;
  let isEditing = false;
  
  onAuthStateChanged(auth, async (user) => {
    if(!user) { window.location.href = "login.html"; return; }
    uBlock = user;
    await syncProfileData();
  });

  async function syncProfileData() {
    const snap = await getDoc(doc(db, "registrations", uBlock.uid));
    if(!snap.exists()) { window.location.href = "index.html"; return; }
    const d = snap.data();

    // Map DOM components
    document.getElementById("card-name").innerText = d.fullName;
    document.getElementById("card-id").innerText = d.registrationId;
    document.getElementById("card-role").innerText = d.playingRole;
    document.getElementById("card-village").innerText = d.village;
    
    const statusPill = document.getElementById("card-status-pill");
    statusPill.innerText = d.status;
    if(d.status === "Approved") statusPill.style.color = "#00FF66";
    if(d.status === "Rejected") statusPill.style.color = "#EF4444";

    // Standard Form Data Populate
    document.getElementById("m-name").value = d.fullName;
    document.getElementById("m-age").value = d.age;
    document.getElementById("m-contact").value = d.contact;
    document.getElementById("m-location").value = d.currentLocation;
    document.getElementById("m-address").value = d.permanentAddress;

    // Refresh QR Layout Engine
    const qrDiv = document.getElementById("card-qrcode");
    qrDiv.innerHTML = "";
    new QRCode(qrDiv, { text: `BYCC-VERIFY:${d.registrationId}:${d.uid}`, width: 72, height: 72, colorDark: "#000000", colorLight: "#ffffff" });
  }

  document.getElementById("edit-toggle-btn").addEventListener("click", () => {
    isEditing = !isEditing;
    const fields = ["m-name", "m-age", "m-contact", "m-location", "m-address"];
    fields.forEach(fId => document.getElementById(fId).disabled = !isEditing);
    const saveBtn = document.getElementById("save-profile-btn");
    if(isEditing) saveBtn.classList.remove("hidden"); else saveBtn.classList.add("hidden");
  });

  document.getElementById("profile-edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "registrations", uBlock.uid), {
        fullName: document.getElementById("m-name").value.trim(),
        age: parseInt(document.getElementById("m-age").value),
        contact: document.getElementById("m-contact").value.trim(),
        currentLocation: document.getElementById("m-location").value.trim(),
        permanentAddress: document.getElementById("m-address").value.trim(),
        updatedAt: new Date().toISOString()
      });
      showToast("Security record space modified safely.", "success");
      document.getElementById("edit-toggle-btn").click();
      await syncProfileData();
    } catch(err) { showToast(err.message, "error"); }
  });

  document.getElementById("download-card-btn").addEventListener("click", () => {
    const element = document.getElementById("membership-card-render");
    const opt = { margin: 0, filename: `BYCC_Card_${document.getElementById("card-id").innerText}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 3, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
    html2pdf().set(opt).from(element).save();
  });

  document.getElementById("logout-btn").addEventListener("click", () => { signOut(auth).then(() => window.location.href="login.html"); });
  
  function showToast(m, t="info") {
    const c = document.getElementById("toast-container");
    const el = document.createElement("div"); el.className = `toast ${t}`;
    el.innerHTML = `<span>${m}</span>`; c.appendChild(el);
    setTimeout(() => el.classList.add("active"), 10);
    setTimeout(() => { el.classList.remove("active"); setTimeout(() => el.remove(), 400); }, 3500);
  }
});
