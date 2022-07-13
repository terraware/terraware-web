const getDateDisplayValue = (date: string | number) => new Date(date).toISOString().split('T')[0];
export default getDateDisplayValue;
