import "firebase-functions/logger/compat";
import "./utility/firebase";

import alerts from "./alerts";
import callables from "./callable";
import endpoints from "./endpoint";
import tasks from "./tasks";

export = { ...alerts, ...callables, ...endpoints, ...tasks };
