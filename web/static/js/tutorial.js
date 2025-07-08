document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const tutorialSteps = document.querySelectorAll('.tutorial-step');
    const diceRollModal = new bootstrap.Modal(document.getElementById('diceRollModal'));
    const diceCheckInfo = document.getElementById('dice-check-info');
    const diceResultDisplay = document.getElementById('dice-result-display');
    const rollButton = document.getElementById('roll-button');
    const diceAnimationContainer = document.getElementById('dice-animation-container');

    const diceFaces = [
        '<i class="bi bi-dice-1-fill"></i>',
        '<i class="bi bi-dice-2-fill"></i>',
        '<i class="bi bi-dice-3-fill"></i>',
        '<i class="bi bi-dice-4-fill"></i>',
        '<i class="bi bi-dice-5-fill"></i>',
        '<i class="bi bi-dice-6-fill"></i>'
    ];

    let characterData = JSON.parse(localStorage.getItem('characterCreation')) || {};
    let currentStep = 'world'; // Initial step

    const stepConfigs = {
        world: {
            rollType: 'selection',
            pageButtonId: 'roll-dice-btn-world',
            modalTitle: '세계관 결정',
            checkText: '어떤 세계에서 모험을 시작할까요?',
            storageProperty: 'world',
            nextButtonId: 'next-step-btn-world',
            jsonPath: '../static/json/worlds.json',
            nameElementId: 'world-name',
            descriptionElementId: 'world-description',
            infoContainerId: 'world-info'
        },
        name: {
            storageProperty: 'name',
            nextButtonId: 'next-step-btn-name',
            formId: 'name-form',
            inputElementId: 'characterName'
        },
        stats: {
            rollType: 'stats',
            pageButtonId: 'roll-stats-btn',
            modalTitle: '능력치 결정',
            checkText: '캐릭터의 능력치를 결정합니다.',
            storageProperty: 'stats',
            nextButtonId: 'next-step-btn-stats',
            statIds: ['strength', 'dexterity', 'intelligence', 'wisdom'],
            formId: 'stats-form'
        },
        class: {
            rollType: 'selection',
            pageButtonId: 'roll-dice-btn-class',
            modalTitle: '직업 결정',
            checkText: '캐릭터의 직업은 무엇이 될까요?',
            storageProperty: 'class',
            nextButtonId: 'next-step-btn-class',
            jsonPath: '../static/json/classes.json',
            nameElementId: 'class-name',
            descriptionElementId: 'class-description',
            infoContainerId: 'class-info'
        },
        race: {
            rollType: 'selection',
            pageButtonId: 'roll-dice-btn-race',
            modalTitle: '종족 결정',
            checkText: '캐릭터의 종족은 무엇이 될까요?',
            storageProperty: 'race',
            nextButtonId: 'next-step-btn-race',
            jsonPath: '../static/json/races.json',
            nameElementId: 'race-name',
            descriptionElementId: 'race-description',
            infoContainerId: 'race-info'
        },
        summary: {
            // Summary step doesn't have roll or next button logic in the same way
        }
    };

    const stepsOrder = ['world', 'name', 'stats', 'class', 'race', 'summary'];

    function saveCharacterData() {
        localStorage.setItem('characterCreation', JSON.stringify(characterData));
        updateSidebar();
    }

    function showStep(stepId) {
        tutorialSteps.forEach(step => {
            if (step.id === `step-${stepId}`) {
                step.style.display = 'block';
            } else {
                step.style.display = 'none';
            }
        });
        currentStep = stepId;
        updateSidebar();
        // Scroll to top of the main content area when step changes
        mainContent.scrollTop = 0;
    }

    function updateSidebar() {
        const progressItems = document.querySelectorAll('.progress > li');
        progressItems.forEach((item, index) => {
            const stepKey = stepsOrder[index];
            const isStepComplete = characterData.hasOwnProperty(stepKey) || (stepKey === 'summary' && stepsOrder.indexOf(currentStep) > stepsOrder.indexOf('race'));
            const isActiveStep = stepKey === currentStep;
            const stepResultElement = item.querySelector('.step-result');

            item.classList.remove('active', 'end');

            if (isActiveStep) {
                item.classList.add('active');
            } else if (isStepComplete) {
                item.classList.add('end');
            }

            // Update step result display
            if (stepResultElement) {
                let resultText = '';
                switch (stepKey) {
                    case 'world':
                        resultText = characterData.world ? characterData.world.name : '';
                        break;
                    case 'name':
                        resultText = characterData.name || '';
                        break;
                    case 'stats':
                        if (characterData.stats) {
                            const stats = characterData.stats;
                            resultText = `힘: ${stats.strength}, 민첩: ${stats.dexterity}, 지능: ${stats.intelligence}, 지혜: ${stats.wisdom}`;
                        }
                        break;
                    case 'class':
                        resultText = characterData.class ? characterData.class.name : '';
                        break;
                    case 'race':
                        resultText = characterData.race ? characterData.race.name : '';
                        break;
                    case 'summary':
                        resultText = '완료'; // Or a more descriptive text if needed
                        break;
                }
                stepResultElement.textContent = resultText;
            }
        });
        initProgress(); // Call initProgress to update the bar height
    }

    function goToNextStep() {
        const currentIndex = stepsOrder.indexOf(currentStep);
        if (currentIndex < stepsOrder.length - 1) {
            showStep(stepsOrder[currentIndex + 1]);
        }
    }

    

    // Setup for Selection and Stats Roll
    async function setupRollLogic(config) {
        const pageButton = document.getElementById(config.pageButtonId);
        const nextButton = document.getElementById(config.nextButtonId);

        if (pageButton) {
            pageButton.onclick = () => {
                diceCheckInfo.textContent = config.checkText;
                diceResultDisplay.textContent = '';
                rollButton.textContent = '주사위를 굴립니다!';
                rollButton.onclick = async () => {
                    rollButton.disabled = true;
                    diceResultDisplay.textContent = ''; // Clear previous result
                    diceResultDisplay.classList.remove('visible');
                    diceAnimationContainer.innerHTML = diceFaces[5]; // Default face
                    diceAnimationContainer.classList.add('dice-rolling');

                    const animationInterval = setInterval(() => {
                        diceAnimationContainer.innerHTML = diceFaces[Math.floor(Math.random() * 6)];
                    }, 100);

                    setTimeout(async () => {
                        clearInterval(animationInterval);
                        diceAnimationContainer.classList.remove('dice-rolling');

                        let result;
                        if (config.rollType === 'selection') {
                            const response = await fetch(config.jsonPath);
                            const items = await response.json();
                            const randomIndex = Math.floor(Math.random() * items.length);
                            const selectedItem = items[randomIndex];
                            result = {
                                display: selectedItem.name,
                                data: selectedItem,
                                index: randomIndex, // For dice face calculation
                                total: items.length // For dice face calculation
                            };
                        } else if (config.rollType === 'stats') {
                            const stats = {};
                            let display = [];
                            let totalValue = 0;
                            config.statIds.forEach(id => {
                                const value = Math.floor(Math.random() * 11) + 8; // 8-18
                                stats[id] = value;
                                totalValue += value;
                                let formattedId;
                                switch(id) {
                                    case 'strength': formattedId = '힘'; break;
                                    case 'dexterity': formattedId = '민첩'; break;
                                    case 'intelligence': formattedId = '지능'; break;
                                    case 'wisdom': formattedId = '지혜'; break;
                                    case 'constitution': formattedId = '체력'; break;
                                    case 'charisma': formattedId = '매력'; break;
                                    case 'luck': formattedId = '행운'; break;
                                    default: formattedId = id;
                                }
                                display.push(`${formattedId}: ${value}`);
                            });
                            result = {
                                display: display.join(', '),
                                data: stats,
                                index: totalValue, // For dice face calculation
                                total: 18 * config.statIds.length // For dice face calculation
                            };
                        }

                        diceResultDisplay.textContent = result.display;
                        diceResultDisplay.classList.add('visible');

                        // Update dice face based on result (for stats, use an average or specific stat)
                        if (config.rollType === 'selection' && result.total > 0) {
                            const faceIndex = Math.min(5, Math.max(0, Math.ceil((result.index + 1) * 6 / result.total) - 1));
                            diceAnimationContainer.innerHTML = diceFaces[faceIndex];
                        } else if (config.rollType === 'stats' && result.total > 0) {
                            const averageValue = result.index / config.statIds.length;
                            const faceIndex = Math.min(5, Math.max(0, Math.ceil(averageValue / 3.34) - 1)); // Scale 8-18 to 1-6
                            diceAnimationContainer.innerHTML = diceFaces[faceIndex];
                        } else {
                            diceAnimationContainer.innerHTML = diceFaces[Math.floor(Math.random() * 6)]; // Fallback random
                        }


                        characterData[config.storageProperty] = result.data;
                        saveCharacterData();
                        if (nextButton) {
                            nextButton.classList.remove('disabled');
                        }
                        rollButton.disabled = false;
                        // Optionally hide modal after a delay
                        setTimeout(() => diceRollModal.hide(), 2000);

                    }, 1500); // Animation duration
                };
                diceRollModal.show();
            };
        }

        if (nextButton) {
            nextButton.onclick = goToNextStep;
        }
    }

    // Specific step setups
    // World Step
    setupRollLogic(stepConfigs.world);

    // Name Step
    const nameForm = document.getElementById(stepConfigs.name.formId);
    const characterNameInput = document.getElementById(stepConfigs.name.inputElementId);
    const nextNameButton = document.getElementById(stepConfigs.name.nextButtonId);

    if (nameForm) {
        nameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (characterNameInput.value.trim() !== '') {
                characterData[stepConfigs.name.storageProperty] = characterNameInput.value.trim();
                saveCharacterData();
                goToNextStep();
            } else {
                alert('캐릭터 이름을 입력해주세요.');
            }
        });
    }
    // Pre-fill name if already set
    if (characterData.name && characterNameInput) {
        characterNameInput.value = characterData.name;
        nextNameButton.classList.remove('disabled');
    }


    // Stats Step
    setupRollLogic(stepConfigs.stats);
    const statsForm = document.getElementById(stepConfigs.stats.formId);
    const nextStatsButton = document.getElementById(stepConfigs.stats.nextButtonId);

    if (statsForm) {
        statsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (characterData.stats) { // Check if stats have been rolled
                goToNextStep();
            } else {
                alert('먼저 능력치 주사위를 굴려주세요.');
            }
        });
    }
    // Pre-fill stats if already set
    if (characterData.stats) {
        stepConfigs.stats.statIds.forEach(id => {
            const inputEl = document.getElementById(id);
            if (inputEl) {
                inputEl.value = characterData.stats[id];
            }
        });
        if (nextStatsButton) {
            nextStatsButton.classList.remove('disabled');
        }
    }


    // Class Step
    setupRollLogic(stepConfigs.class);

    // Race Step
    setupRollLogic(stepConfigs.race);

    // Summary Step
    function updateSummary() {
        document.getElementById('summary-name').textContent = characterData.name || '미정';
        document.getElementById('summary-world').textContent = characterData.world ? characterData.world.name : '미정';
        document.getElementById('summary-race').textContent = characterData.race ? characterData.race.name : '미정';
        document.getElementById('summary-class').textContent = characterData.class ? characterData.class.name : '미정';
        if (characterData.stats) {
            const stats = characterData.stats;
            document.getElementById('summary-stats').textContent = `힘: ${stats.strength}, 민첩: ${stats.dexterity}, 지능: ${stats.intelligence}, 지혜: ${stats.wisdom}`;
        } else {
            document.getElementById('summary-stats').textContent = '미정';
        }
    }

    // Initial load
    const initialStep = stepsOrder.find(step => !characterData.hasOwnProperty(step)) || 'summary';
    showStep(initialStep);
    if (initialStep === 'summary') {
        updateSummary();
    }
});