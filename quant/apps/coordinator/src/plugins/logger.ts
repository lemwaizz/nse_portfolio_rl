import { wrap } from "@bogeychan/elysia-logger";
import { pino } from "pino";

function isPinoPrettyAvailable(): boolean {
  try {
    require.resolve("pino-pretty");
    return true;
  } catch {
    return false;
  }
}

const nodeEnvIsDev = process.env.NODE_ENV === "development";
export const logger = pino({
  serializers: {
    user: (user) => ({
      id: user?.id,
      role: user?.role,
    }),
    session: (session) => ({
      id: session?.id,
      ipAddress: session?.ipAddress,
    }),
    set: () => undefined,
    qi: () => undefined,
    auth: () => undefined,
    headers: (header) => ({
      host: header?.host,
      ["user-agent"]: header?.["user-agent"],
      origin: header?.origin,
      referer: header?.referer,
    }),
    body: () => undefined,
    request: () => undefined,
    response: () => undefined,
    db: () => undefined,
    server: () => undefined,
    eventPublisher: () => undefined,
    priceService: () => undefined,
    activeAddressesMemoryCache: () => undefined,
    queueDb: () => undefined,
    walletSweeperEventPublisher: () => undefined,
    bridgerJobPublisher: () => undefined,
    webhookEventsQueueConsumer: () => undefined,
    workerService: () => undefined,
    chainConfirmationsQueueConsumer: () => undefined,
    walletSweeperService: () => undefined,
    walletSweeperQueueConsumer: () => undefined,
    sweepChainConfirmationsQueueConsumer: () => undefined,
    bridgeWorker: () => undefined,
    bridgerQueueConsumer: () => undefined,
    dashboardListener: () => undefined,
    queueManager: () => undefined,
    featuresService: () => undefined,
    cookie: () => undefined,
    // query: () => undefined,
    log: () => undefined,
    responseValue: () => undefined,
    payoutConfirmationsQueueConsumer: () => undefined,
    payoutEventPublisher: () => undefined,
    payoutEventproducer: () => undefined,
    payoutQueueConsumer: () => undefined,
    viemChainPublicClients: () => undefined,
    blockScannerJobPublisher: () => undefined,
    blockScannerWorker: () => undefined,
    blockScannerQueueConsumer: () => undefined,
    realtimeNativePaymentWatcherJobPublisher: () => undefined,
    realtimeNativePaymentsWatcherWorker: () => undefined,
    realtimeNativePaymentWatcherQueueConsumer: () => undefined,
    shortTermNativePaymentWatcherJobPublisher: () => undefined,
    shortTermNativePaymentsWatcherWorker: () => undefined,
    shortTermNativePaymentWatcherQueueConsumer: () => undefined,
    longTermNativePaymentWatcherJobPublisher: () => undefined,
    longTermNativePaymentsWatcherWorker: () => undefined,
    longTermNativePaymentWatcherQueueConsumer: () => undefined,
    webhookEventPublisher: () => undefined,
    sweepChainConfirmationsEventPublisher: () => undefined,
    payoutChainConfirmationsEventPublisher: () => undefined,
    payoutChainConfirmationsWorkerService: () => undefined,
    sweepChainConfirmationsWorkerService: () => undefined,
    chainConfirmationsWorkerService: () => undefined,
    bridgeAggregatorJobPublisher: () => undefined,
    bridgeAggregatorWorker: () => undefined,
    bridgeAggregatorQueueConsumer: () => undefined,
    propagationCheckerQueueConsumer: () => undefined,
    propagationCheckerService: () => undefined,
    propagationCheckerEventPublisher: () => undefined,
  },
  level: nodeEnvIsDev ? "debug" : "info",
  ...(isPinoPrettyAvailable() &&
    nodeEnvIsDev && {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: false,
        },
      },
    }),
});
export const loggerPlugin = wrap(logger, {});
/**
 * trace - 10
 * debug - 20
 * info - 30
 * warn - 40
 * error - 50
 * fatal - 60
 */
