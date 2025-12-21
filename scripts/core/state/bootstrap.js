// PATH: scripts/core/state/bootstrap.js

import { Store } from "./store.js";
import { StatePersist } from "./persist.js";

export function bootstrapState() {
  const persisted = StatePersist.load();
  Store.setState(persisted);

  Store.subscribe((state) => {
    StatePersist.save(state);
  });
}
