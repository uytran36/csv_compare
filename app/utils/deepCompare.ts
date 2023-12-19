const sortObjectKeys = (obj: Record<string, any>): Record<string, any> => {
    return Object.keys(obj)
      .sort()
      .reduce((result: Record<string, any>, key: string) => {
        result[key] = obj[key];
        return result;
      }, {});
  };
  
  export const deepCompareObjects = (
    obj1: Record<string, any>,
    obj2: Record<string, any>
  ): boolean => {
    const sortedObj1 = sortObjectKeys(obj1);
    const sortedObj2 = sortObjectKeys(obj2);
  
    return JSON.stringify(sortedObj1) === JSON.stringify(sortedObj2);
  };
  