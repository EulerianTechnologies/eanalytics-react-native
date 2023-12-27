import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
import ConnectivityHelper from "./connectivityHelper";
import EALog from "../models/eaLog";
import EAnalytics from "../eAnalytics";
import { MAX_UNZIPPED_BYTES_PER_SEND, NO_INTERNET_RETRY_DELAY_MILLIS, POST_FAILED_RETRY_DELAY_MILLIS } from "./config";
import FileHelper from "./fileHelper";
import HttpHelper from "./httpHelper";



class StoredPropertiesTracker {
    static async run(){
        EALog.debug("Tracking stored properties");

        if (await !ConnectivityHelper.isConnected()) {
            EALog.info("-> no network access. Properties is being stored and will be sent later.", true);
            EAnalytics.getEventEmitter().emit("message_retry", NO_INTERNET_RETRY_DELAY_MILLIS)
        }

        const storedProperties = await FileHelper.getLines();
        if (storedProperties.length == 0) {
            EALog.debug("-> no properties stored.");
            return;
        }

        EALog.debug("-> " + storedProperties.length + " stored properties found. Added for synchronization.");
        var result = await this.postStoredProperties(storedProperties);
        if (result == -1) {
            EAnalytics.getEventEmitter().emit("message_retry", POST_FAILED_RETRY_DELAY_MILLIS);
        } else {
            EALog.debug("-> all properties tracked successfully. Stored properties is now empty.");
        }
    }

    static async postStoredProperties(storedProperties:string[]) {
        let counter = 0;
        let jsonArray: any[] = [];
        while(counter < storedProperties.length) {
            const line = storedProperties[counter];
            try {
                const lineJson = JSON.parse(line);
                jsonArray.push(lineJson);
          
                if (
                  counter === storedProperties.length - 1 || // Ultimo elemento
                  JSON.stringify(jsonArray).length + storedProperties[counter + 1].length > MAX_UNZIPPED_BYTES_PER_SEND
                ) {
                  // no more data OR json array is becoming too big -> send it
                  const success = await HttpHelper.postData(JSON.stringify(jsonArray));
                  if (success) {
                    await FileHelper.deleteLines(jsonArray.length);
                    jsonArray = []; // re-init in case the is still pending data.
                    EALog.debug('-> properties tracked !');
                  } else {
                    // something went wrong, will try on track() next call. This avoid infinite loop.
                    EALog.debug('-> la sincronizzazione è fallita. Riproverà in seguito.');
                    return -1;
                  }
                }
              } catch (e) {
                EALog.error(`Errore nel codificare in JSON le proprietà: ${line}. Eccezione: ${e}`);
              }
              counter++;
        }
        return counter;
    }
}

export default StoredPropertiesTracker;