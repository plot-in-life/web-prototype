// web/static/js/dice-modal-logic.js
function setupDiceRollModal(options) {
    const {
        modalTitle,
        checkText,
        rollLogic, // This function will return { display: '...', data: '...', index: ..., total: ... }
        updatePage // This function will update the page with the result.
    } = options;

    const modalElement = document.getElementById('diceRollModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalTitleEl = document.getElementById('diceRollModalLabel');
    const modalCheckInfo = document.getElementById('dice-check-info');
    const modalDiceContainer = document.getElementById('dice-animation-container');
    const modalResultDisplay = document.getElementById('dice-result-display');
    const modalRollBtn = document.getElementById('roll-button');

    const diceFaces = [
        '<i class="bi bi-dice-1-fill"></i>', '<i class="bi bi-dice-2-fill"></i>',
        '<i class="bi bi-dice-3-fill"></i>', '<i class="bi bi-dice-4-fill"></i>',
        '<i class="bi bi-dice-5-fill"></i>', '<i class="bi bi-dice-6-fill"></i>'
    ];

    return new Promise((resolve) => {
        modalTitleEl.textContent = modalTitle;
        modalCheckInfo.textContent = checkText;
        modalResultDisplay.innerHTML = '';
        modalResultDisplay.classList.remove('visible');
        modalRollBtn.disabled = false;
        modalDiceContainer.innerHTML = diceFaces[5]; // Default face
        modal.show();

        const handleRoll = async () => {
            modalRollBtn.disabled = true;
            modalDiceContainer.classList.add('dice-rolling');

            const animationInterval = setInterval(() => {
                modalDiceContainer.innerHTML = diceFaces[Math.floor(Math.random() * 6)];
            }, 100);

            setTimeout(async () => {
                clearInterval(animationInterval);
                modalDiceContainer.classList.remove('dice-rolling');

                const result = await rollLogic();

                // Update page specific elements if updatePage is provided
                if (updatePage) {
                    updatePage(result);
                }

                modalResultDisplay.innerHTML = result.display;
                modalResultDisplay.classList.add('visible');

                // Update dice face based on result (for stats, use an average or specific stat)
                if (result.total > 0 && result.index !== undefined) {
                    const faceIndex = Math.min(5, Math.max(0, Math.ceil((result.index + 1) * 6 / result.total) - 1));
                    modalDiceContainer.innerHTML = diceFaces[faceIndex];
                } else {
                    modalDiceContainer.innerHTML = diceFaces[Math.floor(Math.random() * 6)]; // Fallback random
                }

                modalRollBtn.disabled = false;
                setTimeout(() => {
                    modal.hide();
                    modalRollBtn.removeEventListener('click', handleRoll); // Remove event listener after use
                    resolve(result.data); // Resolve with the actual data
                }, 2000);

            }, 1500); // Animation duration
        };

        modalRollBtn.addEventListener('click', handleRoll, { once: true });
    });
}