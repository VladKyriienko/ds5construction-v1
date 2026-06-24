export function withLoopSlides<T>(items: T[]): {
  slides: T[];
  isSingle: boolean;
  initialIndex: number;
} {
  if (items.length <= 1) {
    return {
      slides: items,
      isSingle: true,
      initialIndex: 0,
    };
  }

  return {
    slides: [items[items.length - 1], ...items, items[0]],
    isSingle: false,
    initialIndex: 1,
  };
}

export function loopRealIndex(
  selectedIndex: number,
  itemCount: number,
  slideCount: number,
  isSingle: boolean,
): number {
  if (isSingle) return 0;
  if (selectedIndex === 0) return itemCount - 1;
  if (selectedIndex === slideCount - 1) return 0;
  return selectedIndex - 1;
}

export function shouldHandleLoopTransitionEnd(
  event: TransitionEvent,
  track: HTMLElement,
): boolean {
  return (
    event.target === track &&
    event.propertyName === 'transform'
  );
}

export function enableLoopTransitions(
  apply: (isTransitioning: boolean) => void,
): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => apply(true));
  });
}

export function handleLoopTransitionEnd(
  selectedIndex: number,
  slideCount: number,
  isSingle: boolean,
  apply: (index: number, isTransitioning: boolean) => void,
  track?: HTMLElement,
): void {
  if (isSingle) return;

  const jump = (index: number) => {
    apply(index, false);
    if (track) void track.offsetHeight;
    enableLoopTransitions(() => apply(index, true));
  };

  if (selectedIndex === 0) {
    jump(slideCount - 2);
    return;
  }

  if (selectedIndex === slideCount - 1) {
    jump(1);
  }
}
