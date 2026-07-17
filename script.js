const year = document.querySelector("#year");
const topButton = document.querySelector(".top-button");

if (year) year.textContent = new Date().getFullYear();
if (topButton) {
  topButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
