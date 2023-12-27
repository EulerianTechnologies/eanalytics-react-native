import { Platform } from "react-native";
import { NO_INTERNET_RETRY_DELAY_MILLIS, POST_FAILED_RETRY_DELAY_MILLIS } from "./config";
import ConnectivityHelper from "./connectivityHelper";
import EALog from "../models/eaLog";
import FileHelper from "./fileHelper";
import HttpHelper from "./httpHelper";
import PersistentIdentity from "./persistentIdentity";
import StoredPropertiesTracker from "./storedPropertiesTracker";
import EAnalytics from "../eAnalytics";
import EAProperties from "../models/eaProperties";

class PropertiesTracker {
    static async run(properties:any) {
        if (Platform.OS === "android") {
            if (await PersistentIdentity.shouldSendInstallReferrer()) {
                var installReferrer = await PersistentIdentity.getInstallReferrer();
                EALog.debug("Tracking properties for the first time, add install referrer to it");
                if (installReferrer) {
                    EAProperties.Builder.setAndroidInstallReferrer(installReferrer);
                    PersistentIdentity.setInstallReferrerSent();
                }
            }
        }

        var propertiesToString = JSON.stringify(properties);

        EALog.debug("Tracking properties");

        if (await !ConnectivityHelper.isConnected()) {
            EALog.info("-> no network access. Properties is being stored and will be sent later.", true);
            FileHelper.appendLine(propertiesToString);
            EAnalytics.getEventEmitter().emit("message_retry", NO_INTERNET_RETRY_DELAY_MILLIS);
            return;
        }

        const storedProperties = await FileHelper.getLines();
        if (storedProperties.length == 0) {
            EALog.debug("DEVO FARE LA CHIAMATA");
            var success = HttpHelper.postData("[" + propertiesToString + "]");
            if (!success) {
                EALog.debug("-> synchronization failed. Will retry if no other pending track is found.");
                FileHelper.appendLine(propertiesToString);
                EAnalytics.getEventEmitter().emit("message_retry", POST_FAILED_RETRY_DELAY_MILLIS);
            } else {
                EALog.info("-> properties tracked !", true);
            }
            return;
        }

        EALog.debug("-> " + storedProperties.length + " stored properties found, current properties added to history to " +
                "be sent with stored ones.");
        FileHelper.appendLine(propertiesToString);//we treat the current properties as a stored properties (history)

        StoredPropertiesTracker.run();
    }
}

export default PropertiesTracker;