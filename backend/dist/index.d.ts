declare class Server {
    private app;
    private readonly PORT;
    private readonly NODE_ENV;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    private connectDatabase;
    start(): Promise<void>;
    private setupGracefulShutdown;
}
declare const server: Server;
export default server;
//# sourceMappingURL=index.d.ts.map