import retryWhen from "../index";

const DEFAULT_DELAY = 300;

describe("retryWhen argument: func", () => {
  it("be called correct times", async () => {
    const func = jest.fn();
    const executor = retryWhen({
      func: func,
      when: (err, res, { retryCount }) => retryCount <= 3,
      delayGenerator: () => DEFAULT_DELAY,
    });

    await executor();
    expect(func).toBeCalledTimes(4);
  });

  it("can be an async function", async () => {
    const mockFunc = jest.fn();
    const func = () =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          mockFunc();
          resolve(undefined);
        }, DEFAULT_DELAY)
      );
    const executor = retryWhen({
      func: func,
      when: (err, res, { retryCount }) => retryCount <= 3,
      delayGenerator: () => DEFAULT_DELAY,
    });

    await executor();
    expect(mockFunc).toBeCalledTimes(4);
  });
});

describe("retryWhen argument when", () => {
  it("can get correct arguments", async () => {
    const mockFunc = jest.fn();
    const func = (n: number) => {
      mockFunc(n);
      return new Promise((resolve, reject) =>
        n <= 1 ? reject(n) : resolve(n)
      );
    };
    const argumentsGenerator = (
      err: any,
      res: any,
      params: {
        args: any[];
        retryCount: number;
      }
    ) => [params.retryCount];
    const mockWhen = jest.fn();
    const when = (err: any, res: any, params: { retryCount: number }) => {
      mockWhen(err, res, params);
      return params.retryCount <= 3;
    };
    const executor = retryWhen({
      func,
      when,
      argumentsGenerator,
      delayGenerator: () => DEFAULT_DELAY,
    });
    await executor(0);
    expect(mockWhen.mock.calls).toEqual([
      [0, undefined, { retryCount: 1 }],
      [1, undefined, { retryCount: 2 }],
      [undefined, 2, { retryCount: 3 }],
      [undefined, 3, { retryCount: 4 }],
    ]);
    expect(mockWhen).toBeCalledTimes(4);
    expect(mockFunc).toBeCalledTimes(4);
  });
});
