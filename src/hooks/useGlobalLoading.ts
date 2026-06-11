/**
 * 모든 API mutation의 로딩 상태를 통합 관리하는 훅
 * MainPage에서 화면 전체 로딩 스피너를 표시할 때 사용
 * 
 * 주의: 이 훅은 useMutation을 호출하므로, 같은 mutation을 여러 곳에서 사용하면
 * 상태가 제대로 추적되지 않을 수 있습니다. MainPage에서만 사용하세요.
 */
export function useGlobalLoading() {
  // MainPage에서 직접 mutation을 호출하고 그 상태를 추적
  // useMutation을 여기서 호출하면 매번 새로운 객체가 생성됨
  // 따라서 이 훅은 사용하지 않고, 직접 mutation 훅을 사용하는 것을 권장
  
  // 임시로 빈 상태 반환 - 실제 사용은 MainPage에서 직접 mutation 상태를 추적
  return {
    isLoading: false,
    soldout: false,
    active: false,
    pause: false,
    release: false,
  };
}