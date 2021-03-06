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

describe("retryWhen argument: when", () => {
  it("can get correct arguments", async () => {
    const func = (n: number) => {
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
  });
});

describe("retryWhen argument: argumentsGenerator", () => {
  it("can get correct arguments", async () => {
    const mockFunc = jest.fn();
    const func = (n: number) => {
      mockFunc(n);
      return new Promise((resolve, reject) =>
        n <= 1 ? reject(n) : resolve(n)
      );
    };
    const mockArgsGen = jest.fn();
    const argumentsGenerator = (
      err: any,
      res: any,
      params: {
        args: any[];
        retryCount: number;
      }
    ) => {
      mockArgsGen(err, res, params);
      return [params.retryCount];
    };
    const when = (err: any, res: any, params: { retryCount: number }) =>
      params.retryCount <= 3;
    const executor = retryWhen({
      func,
      when,
      argumentsGenerator,
      delayGenerator: () => DEFAULT_DELAY,
    });
    await executor(0);
    expect(mockArgsGen.mock.calls).toEqual([
      [0, undefined, { args: [0], retryCount: 1 }],
      [1, undefined, { args: [1], retryCount: 2 }],
      [undefined, 2, { args: [2], retryCount: 3 }],
    ]);
    expect(mockArgsGen).toBeCalledTimes(3);
  });
});

describe("retryWhen", () => {
  it("can get return after retries", async () => {
    const mockFunc = jest.fn();
    const func = (n: number) => {
      mockFunc(n);
      return new Promise((resolve, reject) => (n < 3 ? reject(n) : resolve(n)));
    };

    const executor = retryWhen({
      func,
      when: (err, res, { retryCount }) => err != null,
      argumentsGenerator: (err, res, { retryCount }) => [retryCount],
      delayGenerator: () => DEFAULT_DELAY,
    });

    const ret = await executor(0);
    expect(ret).toBe(3);
    expect(mockFunc.mock.calls).toEqual([[0], [1], [2], [3]]);
  });

  it("can get error after retires", async () => {
    const mockFunc = jest.fn();
    const func = (n: number) => {
      mockFunc(n);
      return new Promise((resolve, reject) => reject(`Error: ${n}`));
    };

    const executor = retryWhen({
      func,
      when: (err, res, { retryCount }) => retryCount <= 3,
      argumentsGenerator: (err, res, { retryCount }) => [retryCount],
      delayGenerator: () => DEFAULT_DELAY,
    });

    try {
      await executor(0);
    } catch (err) {
      expect(err).toBe("Error: 3");
    }
    expect(mockFunc.mock.calls).toEqual([[0], [1], [2], [3]]);
  });
});
