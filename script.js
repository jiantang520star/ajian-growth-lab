const year = document.querySelector("#year");
const topButton = document.querySelector(".top-button");

year.textContent = new Date().getFullYear();

topButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
