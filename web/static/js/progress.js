$(document).ready(() => {
    initProgress();
});

function initProgress() {
    // 각 .progress 요소에 대해 반복
    $('.progress').each((_, progressElement) => {
        const $progress = $(progressElement); // 현재 progress 요소 래핑
        const $items = $progress.find('> li'); // 현재 progress의 li 항목들 선택
        const $activeItem = $items.filter('.active'); // 'active' 클래스를 가진 항목 선택
        let $lastProgressItem = $items.filter('.last-progress'); // 'last-progress' 클래스를 가진 항목 선택

        // .last-progress 클래스가 없으면 마지막 li 요소를 기본값으로 사용
        if ($lastProgressItem.length === 0) {
            $lastProgressItem = $items.last();
        }

        // ::before (전체 진행률 바) 높이 설정
        if ($lastProgressItem.length > 0) {
            const beforeHeight = $lastProgressItem[0].offsetTop + 20; // step 중앙까지
            $progress.css('--progress-before-height', `${beforeHeight}px`);
        } else {
            // li 항목이 하나도 없는 경우
            $progress.css('--progress-before-height', '0px');
        }

        // 현재 활성화된 항목까지의 모든 항목에 'end' 클래스 추가
        const activeIndex = $items.index($activeItem);
        $items.slice(0, activeIndex).addClass('end');
        $items.slice(activeIndex + 1).removeClass('end'); // 활성화된 항목 이후의 'end' 클래스 제거

        // ::after (활성 진행률 바) 높이 설정
        if ($activeItem.length > 0) {
            // 활성화된 항목의 상단 위치를 기준으로 진행 바 높이 설정
            let progressHeight;

            if (activeIndex === $items.length - 1) {
                // 마지막 항목: step 하단까지
                progressHeight = $activeItem[0].offsetTop + 30;
            } else {
                // 다른 항목들: step 중앙까지
                progressHeight = $activeItem[0].offsetTop + 20;
            }
            $progress.css('--progress-height', `${progressHeight}px`);
        } else {
            // 활성화된 항목이 없으면 진행 바 높이를 0으로 설정
            $progress.css('--progress-height', '0px');
        }
    });
}
