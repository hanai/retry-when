const retryWhen = (params: {
  func: (...args: any[]) => Promise<any>;
  when: (
    err: any,
    res: any,
    params: {
      retryCount: number;
    }
  ) => boolean;
  delayGenerator: (params: { retryCount: number }) => number;
  argumentsGenerator?: (
    err: any,
    res: any,
    params: {
      args: any[];
      retryCount: number;
    }
  ) => any[];
}) => {
  const { func, when, argumentsGenerator, delayGenerator } = params;

  let retryCount = 0;

  const executor = async (...args: any[]) => {
    let err, res;
    try {
      res = await func(...args);
    } catch (e) {
      err = e;
    }
    retryCount += 1;
    const needRetry = when(err, res, { retryCount });

    if (needRetry) {
      const delay = delayGenerator({ retryCount: retryCount });
      const newArgs = argumentsGenerator
        ? argumentsGenerator(err, res, { args, retryCount })
        : args;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          executor(...newArgs)
            .then(resolve)
            .catch(reject);
        }, delay);
      });
    } else {
      if (err !== undefined) {
        throw err;
      } else {
        return res;
      }
    }
  };

  return executor;
};

export default retryWhen;
