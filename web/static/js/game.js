// game.js
document.addEventListener('DOMContentLoaded', () => {
    const historyLogContent = document.getElementById('history-log-content');
    const choiceButtonsContainer = document.getElementById('choice-buttons');
    const tutorialExitButton = document.getElementById('tutorial-exit');
    
    
    let scenarioData;
    let currentSceneId;

    fetch('../static/json/tutorial-scenario.json')
        .then(response => response.json())
        .then(data => {
            scenarioData = data;
            currentSceneId = scenarioData.startScene;
            renderScene(currentSceneId);
        })
        .catch(error => {
            console.error('Error loading scenario:', error);
            historyLogContent.innerHTML = '<p class="text-danger">시나리오를 불러오는 데 실패했습니다.</p>';
        });

    function renderScene(sceneId) {
        const scene = scenarioData.scenes[sceneId];
        if (!scene) {
            showTutorialEnd();
            return;
        }

        const narrationElement = document.createElement('div');
        narrationElement.className = 'gm-narration';
        narrationElement.innerHTML = `<p class="fw-bold">게임 마스터:</p><p>${scene.text}</p>`;
        historyLogContent.appendChild(narrationElement);
        
        choiceButtonsContainer.innerHTML = '';
        if (scene.choices && scene.choices.length > 0) {
            scene.choices.forEach(choice => {
                const button = document.createElement('button');
                button.className = 'btn btn-outline-primary';
                button.textContent = choice.text;
                button.onclick = () => handleChoice(choice);
                choiceButtonsContainer.appendChild(button);
            });
        } else {
            showTutorialEnd();
        }
        
        historyLogContent.parentElement.scrollTop = historyLogContent.parentElement.scrollHeight;
    }

    async function handleChoice(choice) {
        let rollResult = null;
        if (choice.check) {
            const rollLogic = async () => {
                const finalRoll = Math.floor(Math.random() * 20) + 1; // D20 roll
                return {
                    display: finalRoll.toString(),
                    data: finalRoll,
                    index: finalRoll, // For dice face calculation
                    total: 20 // For dice face calculation (D20)
                };
            };

            rollResult = await setupDiceRollModal({
                modalTitle: `${choice.check.stat} 체크`,
                checkText: `${choice.check.stat} 능력치 체크가 필요합니다.`,
                rollLogic: rollLogic,
                updatePage: (result) => {
                    // No specific page update needed here, as result is used in proceedWithChoice
                }
            });
        }
        proceedWithChoice(choice, rollResult);
    }

    function proceedWithChoice(choice, rollResult) {
        const actionElement = document.createElement('div');
        actionElement.className = 'player-action';
        actionElement.innerHTML = `<p class="fw-bold">당신의 ���택:</p><p><em>${choice.text}</em></p>`;
        if (rollResult !== null) {
            actionElement.innerHTML += `<small class="text-muted">${choice.check.stat} 체크: 주사위 결과 <strong>${rollResult}</strong></small>`;
        }
        historyLogContent.appendChild(actionElement);

        currentSceneId = choice.nextSceneId;
        renderScene(currentSceneId);
    }
    
    function showTutorialEnd() {
        choiceButtonsContainer.innerHTML = '<p class="text-muted">이야기의 한 분기가 마무리되었습니다.</p>';
        tutorialExitButton.classList.remove('d-none');
    }
});
