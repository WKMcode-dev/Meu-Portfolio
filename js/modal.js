function openModal(id) {
  document.getElementById(id).style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

window.onclick = function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Detecta qual botão foi clicado
document.querySelectorAll(".doc-button").forEach(button => {
  button.addEventListener("click", function () {
    const modalId = this.getAttribute("data-modal");
    openModal(modalId);
  });
});