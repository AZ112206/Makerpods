document.addEventListener("DOMContentLoaded", () => {
  const continueButton = document.getElementById("continue-btn");
  const welcomeCard = document.querySelector(".welcome-card");

  continueButton.addEventListener("click", () => {
    welcomeCard.classList.add("page-exit");
    setTimeout(() => {
      window.location.href = "../../Welcome Page/Dashboard/Adult Dashboard/Adult Dashboard.html";
    }, 280);
  });
});
