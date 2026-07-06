import { Kysely, Transaction } from "kysely";
import type { KyselyConfig } from "kysely";
import type { DB } from "@coordinator/prisma/kysely/types";
import type { StockDataDBSchemas } from "@coordinator/prisma/kysely/stock_data/types";

export namespace QuantDb {
  export class DatabaseAdapter extends Kysely<DB & StockDataDBSchemas.DB> {
    constructor(kyselyConf: KyselyConfig) {
      super(kyselyConf);
    }
  }

  export type DatabaseTransaction = Transaction<DB & StockDataDBSchemas.DB>;

  export type DatabaseConnection = DatabaseTransaction | DatabaseAdapter;
}

// export namespace LnQueueDb {
//   export class DatabaseAdapter extends Kysely<QueueDBSchemas.DB> {
//     constructor(kyselyConf: KyselyConfig) {
//       super(kyselyConf);
//     }
//   }

//   export type DatabaseTransaction = Transaction<QueueDBSchemas.DB>;

//   export type DatabaseConnection = DatabaseTransaction | DatabaseAdapter;
// }
