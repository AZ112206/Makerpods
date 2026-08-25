document.addEventListener("DOMContentLoaded", () => {
  const continueButton = document.getElementById("continue-btn");
  const welcomeCard = document.querySelector(".welcome-card");

  continueButton.addEventListener("click", () => {
    welcomeCard.classList.add("page-exit");
    setTimeout(() => {
      window.location.href = "../Sign Up Pt 1 (Main Menu)/Sign Up Pt 1.html";
    }, 280);
  });
});
