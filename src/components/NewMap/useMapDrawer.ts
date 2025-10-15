import { MutableRefObject, useCallback } from 'react';

const useMapDrawer = (drawerRef: MutableRefObject<HTMLDivElement | null>) => {
  const scrollToElementById = useCallback(
    (elementId: string) => {
      const container = drawerRef.current;
      const target = container?.querySelector<HTMLElement>(`#${elementId}`);

      if (container && target) {
        const top = target.offsetTop - container.offsetTop;

        container.scrollTo({
          top,
          behavior: 'smooth',
        });
      }
    },
    [drawerRef]
  );

  const scrollToTop = useCallback(() => {
    drawerRef?.current?.scrollTo(0, 0);
  }, [drawerRef]);

  return {
    scrollToElementById,
    scrollToTop,
  };
};

export default useMapDrawer;
