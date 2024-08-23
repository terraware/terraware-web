import { SectionVariableWithValues } from 'src/types/documentProducer/Variable';

export const getContainingSections =
  (variableId: number) =>
  (acc: string[], currentVal: SectionVariableWithValues): string[] => {
    const newAcc = [...acc];

    if (
      currentVal.parentSectionNumber &&
      currentVal?.values?.some((val) => val.type === 'SectionVariable' && val.variableId === variableId)
    ) {
      newAcc.push(currentVal.parentSectionNumber);
    }

    currentVal.children.forEach((childSection) => {
      const childContainingSections = getContainingSections(variableId)([], childSection as SectionVariableWithValues);
      newAcc.push(...childContainingSections);
    });

    return newAcc;
  };
