import { logger } from "react-native-logs";

var log = logger.createLogger();
var LOG_ENABLED = false;

class EALog {

    static getInstance() {
        if (log! == null)
            log = logger.createLogger();
        return log!;
    }

    static setLogEnabled(logEnabled: boolean) {
        LOG_ENABLED = logEnabled;
    }

    static debug(message: string) {
        log.debug(message);
    }

    static info(message: string, mandatory: boolean) {
        if (LOG_ENABLED || mandatory) 
            log.info((mandatory ? "Eulerian Analytics : " : "") + message);
    }

    static warn(message: string) {
        log.warn(message);
    }

    static error(message: string) {
        log.error(message);
    }

    static assertCondition(condition: boolean, message: string) {
        if (condition) {
            return;
        } else {
            throw new Error(message);
        }
    }
}

export default EALog;