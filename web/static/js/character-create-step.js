document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 참조 ---
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const summaryBtn = document.getElementById('summary-btn');
    const progressBar = document.getElementById('vertical-progress-bar');

    const stepNumberEls = document.querySelectorAll('.step .step-number');
    const stepDetailEls = document.querySelectorAll('.step .step-detail');
    const contentStepEls = document.querySelectorAll('.content-step');

    // --- 단계별 콘텐츠 요소 ---
    const worldRadios = document.querySelectorAll('input[name="world"]');
    const characterNameInput = document.getElementById('character-name');
    const rollStatsBtn = document.getElementById('roll-stats-btn');
    const rollJobBtn = document.getElementById('roll-job-btn');
    const rollRaceBtn = document.getElementById('roll-race-btn');

    // --- 결과 표시 요소 ---
    const statSpans = {
        strength: document.getElementById('stat-strength'),
        agility: document.getElementById('stat-agility'),
        health: document.getElementById('stat-health'),
        intelligence: document.getElementById('stat-intelligence'),
    };
    const jobResultEl = document.getElementById('job-result');
    const raceResultEl = document.getElementById('race-result');

    // --- 요약 페이지 요소 ---
    const summary = {
        name: document.getElementById('summary-name'),
        world: document.getElementById('summary-world'),
        race: document.getElementById('summary-race'),
        job: document.getElementById('summary-job'),
        strength: document.getElementById('summary-strength'),
        agility: document.getElementById('summary-agility'),
        health: document.getElementById('summary-health'),
        intelligence: document.getElementById('summary-intelligence'),
    };

    // --- 상태 관리 ---
    let currentStep = 0;
    const totalSteps = contentStepEls.length;
    const characterData = {
        world: null,
        name: null,
        stats: { strength: 0, agility: 0, health: 0, intelligence: 0 },
        job: null,
        race: null,
    };

    const jobs = ['전사', '마법사', '도둑', '성직자'];
    const races = ['인간', '난쟁이', '초목족'];

    // --- 함수 ---

    /** UI 전체를 업데이트하는 메인 함수 */
    function updateUI() {
        updateProgressBar();
        updateSidebarSteps();
        updateContentPanels();
        updateNavigationButtons();
        if (currentStep === totalSteps - 1) {
            displaySummary();
        }
    }

    /** 사이드바의 프로그레스 바 높이를 조절 */
    function updateProgressBar() {
        const percent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;
        progressBar.style.height = `${percent}%`;
    }

    /** 사이드바의 스텝 번호 색상을 현재 단계에 맞게 변경 */
    function updateSidebarSteps() {
        stepNumberEls.forEach((el, index) => {
            el.classList.remove('bg-primary', 'bg-secondary', 'bg-success');
            if (index < currentStep) {
                el.classList.add('bg-success'); // 완료된 스텝
            } else if (index === currentStep) {
                el.classList.add('bg-primary'); // 현재 스텝
            } else {
                el.classList.add('bg-secondary'); // 예정된 스텝
            }
        });
    }

    /** 현재 단계에 맞는 콘텐츠 패널을 표시 */
    function updateContentPanels() {
        contentStepEls.forEach((panel, index) => {
            panel.classList.toggle('d-none', index !== currentStep);
        });
    }

    /** 이전/다음 버튼의 활성화 상태와 텍스트를 업데이트 */
    function updateNavigationButtons() {
        prevBtn.disabled = currentStep === 0;

        if (currentStep === totalSteps - 1) {
            summaryBtn.hidden = false;
            nextBtn.hidden = true;
        } else {
            summaryBtn.hidden = true;
            nextBtn.hidden = false;
        }

        // 현재 단계의 유효성 검사를 통과해야만 다음 버튼 활성화
        nextBtn.disabled = !isStepDataValid(currentStep);
    }

    /** 현재 단계의 데이터가 유효한지 확인 */
    function isStepDataValid(stepIndex) {
        switch (stepIndex) {
            case 0: return !!characterData.world;
            case 1: return !!characterData.name && characterData.name.trim() !== '';
            case 2: return characterData.stats.strength > 0; // 주사위를 굴렸는지 확인
            case 3: return !!characterData.job;
            case 4: return !!characterData.race;
            case 5: return true; // 요약 페이지는 항상 유효
            default: return false;
        }
    }

    /** 현재 단계의 데이터를 characterData 객체에 저장 */
    function saveCurrentStepData() {
        switch (currentStep) {
            case 0:
                const selectedWorld = document.querySelector('input[name="world"]:checked');
                if (selectedWorld) characterData.world = selectedWorld.value;
                break;
            case 1:
                characterData.name = characterNameInput.value;
                break;
        }
        // 다른 단계 ��이터는 버튼 클릭 시점에 이미 저장됨
    }

    /** 주사위를 굴리는 유틸리티 함수 */
    function rollDice(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    /** 능력치 주사위를 굴리고 결과를 표시 */
    function handleRollStats() {
        characterData.stats.strength = rollDice(18);
        characterData.stats.agility = rollDice(18);
        characterData.stats.health = rollDice(18);
        characterData.stats.intelligence = rollDice(18);

        statSpans.strength.textContent = characterData.stats.strength;
        statSpans.agility.textContent = characterData.stats.agility;
        statSpans.health.textContent = characterData.stats.health;
        statSpans.intelligence.textContent = characterData.stats.intelligence;

        rollStatsBtn.disabled = true;
        updateNavigationButtons();
    }

    /** 직업 주사위를 굴리고 결과를 표시 */
    function handleRollJob() {
        characterData.job = jobs[rollDice(jobs.length) - 1];
        jobResultEl.textContent = characterData.job;
        jobResultEl.parentElement.classList.remove('d-none');
        rollJobBtn.disabled = true;
        updateNavigationButtons();
    }

    /** 종족 주사위를 굴리고 결과를 표시 */
    function handleRollRace() {
        characterData.race = races[rollDice(races.length) - 1];
        raceResultEl.textContent = characterData.race;
        raceResultEl.parentElement.classList.remove('d-none');
        rollRaceBtn.disabled = true;
        updateNavigationButtons();
    }

    /** 요약 페이지에 캐릭터 정보를 표시 */
    function displaySummary() {
        summary.name.textContent = characterData.name;
        summary.world.textContent = characterData.world;
        summary.race.textContent = characterData.race;
        summary.job.textContent = characterData.job;
        summary.strength.textContent = characterData.stats.strength;
        summary.agility.textContent = characterData.stats.agility;
        summary.health.textContent = characterData.stats.health;
        summary.intelligence.textContent = characterData.stats.intelligence;
    }

    // --- 이벤트 리스너 ---

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

    nextBtn.addEventListener('click', () => {
        saveCurrentStepData();
        if (!isStepDataValid(currentStep)) return;

        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateUI();
        }
    });

    // 각 입력 요소에 이벤트 리스너를 추가하여 다음 버튼 상태를 즉시 업데이트
    worldRadios.forEach(radio => radio.addEventListener('change', () => {
        saveCurrentStepData();
        updateNavigationButtons();
    }));
    characterNameInput.addEventListener('input', () => {
        saveCurrentStepData();
        updateNavigationButtons();
    });

    rollStatsBtn.addEventListener('click', handleRollStats);
    rollJobBtn.addEventListener('click', handleRollJob);
    rollRaceBtn.addEventListener('click', handleRollRace);

    // --- 초기화 ---
    updateUI();
});