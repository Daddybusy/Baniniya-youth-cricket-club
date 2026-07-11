import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  let masterDataSet = [];
  
  onAuthStateChanged(auth, (user) => {
    if(!user || user.email !== "shyamsmiritiyuwacricketclub@gmail.com") {
      alert("Access Denied. Identity fails verification standard for this terminal interface map.");
      window.location.href = "login.html";
    } else {
      initializeLiveSync();
    }
  });

  function initializeLiveSync() {
    onSnapshot(collection(db, "registrations"), (snapshot) => {
      masterDataSet = [];
      snapshot.forEach(doc => { masterDataSet.push(doc.data()); });
      processMetricsAndRender();
    });
  }

  function processMetricsAndRender() {
    // Process analytics loops
    document.getElementById("stat-total").innerText = masterDataSet.length;
    document.getElementById("stat-players").innerText = masterDataSet.filter(x => x.category === "Player").length;
    document.getElementById("stat-seniors").innerText = masterDataSet.filter(x => x.category === "Senior").length;
    document.getElementById("stat-ex").innerText = masterDataSet.filter(x => x.category === "Ex Player").length;
    document.getElementById("stat-supporters").innerText = masterDataSet.filter(x => x.category === "Supporter").length;
    document.getElementById("stat-pending").innerText = masterDataSet.filter(x => x.status === "Pending").length;

    applyFiltersAndPopulateTable();
  }

  // Dynamic Filtering Logic Engine Loop Block
  const sName = document.getElementById("search-name");
  const fVillage = document.getElementById("filter-village");
  const fCategory = document.getElementById("filter-category");
  const fRole = document.getElementById("filter-role");

  [sName, fVillage, fCategory, fRole].forEach(element => {
    element.addEventListener("input", applyFiltersAndPopulateTable);
  });

  function applyFiltersAndPopulateTable() {
    const tbody = document.getElementById("admin-table-runtime-body");
    tbody.innerHTML = "";

    const filtered = masterDataSet.filter(item => {
      const matchName = item.fullName.toLowerCase().includes(sName.value.toLowerCase());
      const matchVillage = fVillage.value === "" || item.village === fVillage.value;
      const matchCategory = fCategory.value === "" || item.category === fCategory.value;
      const matchRole = fRole.value === "" || item.playingRole === fRole.value;
      return matchName && matchVillage && matchCategory && matchRole;
    });

    filtered.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="padding:15px;" class="orbitron-text gold-text">${item.registrationId}</td>
        <td><b>${item.fullName}</b><br><small style="color:var(--muted-text)">${item.email}</small></td>
        <td>${item.category}</td>
        <td>${item.playingRole}</td>
        <td>${item.village}</td>
        <td style="font-weight:700; color:${item.status==='Approved'?'#00FF66':item.status==='Rejected'?'#EF4444':'yellow'}">${item.status}</td>
        <td style="text-align:right; padding-right:20px;">
          <button class="action-icon-btn approve-icon" data-uid="${item.uid}" title="Approve"><i class="fas fa-check-circle"></i></button>
          <button class="action-icon-btn reject-icon" data-uid="${item.uid}" title="Reject"><i class="fas fa-ban"></i></button>
          <button class="action-icon-btn delete-icon" data-uid="${item.uid}" title="Delete Permanently"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    bindActionButtons();
  }

  function bindActionButtons() {
    document.querySelectorAll(".approve-icon").forEach(b => {
      b.addEventListener("click", async () => { await updateStatus(b.dataset.uid, "Approved"); });
    });
    document.querySelectorAll(".reject-icon").forEach(b => {
      b.addEventListener("click", async () => { await updateStatus(b.dataset.uid, "Rejected"); });
    });
    document.querySelectorAll(".delete-icon").forEach(b => {
      b.addEventListener("click", async () => {
        if(confirm("Confirm destructive execution removal request?")) {
          await deleteDoc(doc(db, "registrations", b.dataset.uid));
        }
      });
    });
  }

  async function updateStatus(uid, statusString) {
    await updateDoc(doc(db, "registrations", uid), { status: statusString, updatedAt: new Date().toISOString() });
  }

  // File Export Drivers Engine Matrix
  document.getElementById("exp-excel").addEventListener("click", () => {
    const ws = XLSX.utils.json_to_sheet(masterDataSet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "BYCC_Master_Data.xlsx");
  });

  document.getElementById("exp-csv").addEventListener("click", () => {
    const ws = XLSX.utils.json_to_sheet(masterDataSet);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "BYCC_Master_Data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  document.getElementById("logout-btn").addEventListener("click", () => { signOut(auth).then(() => window.location.href="login.html"); });
});
