import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
import ConnectivityHelper from "./connectivityHelper";
import EALog from "../models/eaLog";
import EAnalytics from "../eAnalytics";
import { MAX_UNZIPPED_BYTES_PER_SEND, NO_INTERNET_RETRY_DELAY_MILLIS, POST_FAILED_RETRY_DELAY_MILLIS } from "./config";
import FileHelper from "./fileHelper";
import HttpHelper from "./httpHelper";
import EaGeneric from "../models/eaGeneric";
import { EATpClick, EATpView, KEY_DYNTPVIEW } from "../models/eaMerchandising";



class StoredPropertiesTracker {
    static async run(){
        EALog.debug("Tracking stored properties");

        if (!(await ConnectivityHelper.isConnected())) {
            EALog.info("-> no network access. Properties is being stored and will be sent later.", true);
            EAnalytics.getEventEmitter().emit("message_retry", NO_INTERNET_RETRY_DELAY_MILLIS)
            return;
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

        // deleteLines() always removes from the head of the file, so the lines have to be
        // confirmed in order: the pending generic batch is flushed before anything else is
        // deleted, otherwise the wrong (still unsent) lines would be dropped.
        const flushBatch = async () => {
          if (jsonArray.length == 0) {
            return true;
          }
          const success = await HttpHelper.postData(JSON.stringify(jsonArray));
          if (!success) {
            return false;
          }
          await FileHelper.deleteLines(jsonArray.length);
          jsonArray = []; // re-init in case the is still pending data.
          EALog.debug('-> properties tracked !');
          return true;
        };

        while(counter < storedProperties.length) {
            const line = storedProperties[counter];
            try {
                var eaValue = this.restoreEaProperties(line);
                if (eaValue instanceof EATpView || eaValue instanceof EATpClick) {
                  if (!(await flushBatch())) {
                    // something went wrong, will try on track() next call. This avoid infinite loop.
                    EALog.debug('-> la sincronizzazione è fallita. Riproverà in seguito.');
                    return -1;
                  }

                  const success = await HttpHelper.getData(eaValue);
                  if (!success) {
                    // something went wrong, will try on track() next call. This avoid infinite loop.
                    EALog.debug('-> la sincronizzazione è fallita. Riproverà in seguito.');
                    return -1;
                  }
                  await FileHelper.deleteLines(1);
                  EALog.debug('-> properties tracked !');
                } else {
                  const lineJson = JSON.parse(line);
                  jsonArray.push(lineJson);

                  const isLastLine = counter === storedProperties.length - 1; // Ultimo elemento
                  if (
                    isLastLine ||
                    JSON.stringify(jsonArray).length + storedProperties[counter + 1].length > MAX_UNZIPPED_BYTES_PER_SEND
                  ) {
                    // no more data OR json array is becoming too big -> send it
                    if (!(await flushBatch())) {
                      // something went wrong, will try on track() next call. This avoid infinite loop.
                      EALog.debug('-> la sincronizzazione è fallita. Riproverà in seguito.');
                      return -1;
                    }
                  }
                }
              } catch (e) {
                EALog.error(`Errore nel codificare in JSON le proprietà: ${line}. Eccezione: ${e}`);
                // the line cannot be restored: flush what precedes it and drop it, otherwise it
                // would block the queue forever and shift every following deletion.
                if (!(await flushBatch())) {
                  return -1;
                }
                await FileHelper.deleteLines(1);
              }
              counter++;
        }
        return counter;
    }

    static restoreEaProperties(storedProperties:string) {
      const data = JSON.parse(storedProperties);
  
    if (data.type != null && data.type === "EATpView") {
      return EATpView.fromRawData(data);
    } else if (data.type != null && data.type === "EATpClick") {
      return EATpClick.fromRawData(data);
    }

    return new EaGeneric(data);
    }
}

export default StoredPropertiesTracker;