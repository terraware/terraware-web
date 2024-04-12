import { Methodology } from 'src/types/documentProducer/Methodology';
import { memoize } from 'src/utils/memoize';

export const getMethodologyName = memoize((methodologyId: number, methodologies: Methodology[] | undefined): string => {
  const methodology = (methodologies || []).find((_methodology) => _methodology.id === methodologyId);
  if (!methodology) {
    return '';
  }
  return methodology.name;
});
