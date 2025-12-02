import { api } from "./api.js";

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const pwd = document.getElementById("password").value.trim();

  try {
    const response = await api.login(pwd);

    if (response.success) {
      loginError.classList.add("hidden");
      // Stocker le token si nécessaire
      sessionStorage.setItem("adminToken", response.token);
      window.location.href = "admin-gestion.html";
    }
  } catch (error) {
    loginError.classList.remove("hidden");
  }
});
