declare const retryWhen: (params: {
    func: (...args: any[]) => Promise<any>;
    when: (err: any, res: any, params: {
        retryCount: number;
    }) => boolean;
    delayGenerator: (params: {
        retryCount: number;
    }) => number;
    argumentsGenerator?: ((err: any, res: any, params: {
        args: any[];
        retryCount: number;
    }) => any[]) | undefined;
}) => (...args: any[]) => Promise<any>;
export default retryWhen;
