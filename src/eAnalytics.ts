import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
import EALog from "./models/eaLog";
import EaGeneric from "./models/eaGeneric";
import Helper from "./utils/helper";
import PersistentIdentity from "./utils/persistentIdentity";
import ReactNativeIdfaAaid, { AdvertisingInfoResponse } from '@sparkfabrik/react-native-idfa-aaid';
import { Platform } from 'react-native';
import StoredPropertiesTracker from "./utils/storedPropertiesTracker";
import { PlayInstallReferrer } from "react-native-play-install-referrer";
import PropertiesTracker from "./utils/propertiesTracker";


var sRTDomain: string | null = null, sAdInfoId: string | null = null, sAdInfoIsLAT = false, initialized = false;

const setAdvertisingInfo = async (info: { id: any; isAdTrackingLimited: any; }) => {
  await PersistentIdentity.setValue('id', info.id);
  await PersistentIdentity.setValue('isAdTrackingLimited', JSON.stringify(info.isAdTrackingLimited));
};

const emitter = new EventEmitter();

emitter.addListener("message_retry", (delay) => {
  setTimeout(() => {
    EALog.info("Retry strategy", false);
    EAnalytics.track(null);
  }, delay);
});

class EAnalytics {


  static async init(host: string, log: boolean) {
    EALog.setLogEnabled(log);
    EALog.assertCondition(!initialized && sRTDomain == null, "Init must be called only once.");
    EALog.assertCondition(!host.includes(".eulerian.com"), "Host cannot contain '.eulerian.com'.");

    EALog.assertCondition(Helper.isHostValid(host), "Init failed : " + host + " is not a valid host name. " +
      "For instance, test.example.net is a valid.");

    initialized = true;
    sRTDomain = "https://" + host + "/collectorjson/-/";
    sAdInfoId = PersistentIdentity.getAdvertisingId()!.toString();
    sAdInfoIsLAT = Boolean(PersistentIdentity.getAdvertisingIsLat());
    EALog.info("SDK initialized with " + host, true);


    ReactNativeIdfaAaid.getAdvertisingInfo()
      .then((res: AdvertisingInfoResponse) => {
        setAdvertisingInfo(res)
      })
      .catch((err: any) => {
        console.log(err);
      });

    this.track(null);

    if (Platform.OS == "android") {
      var shouldFetchInstallReferrer = await PersistentIdentity.shouldFetchInstallReferrer()
      if (shouldFetchInstallReferrer) {
        PlayInstallReferrer.getInstallReferrerInfo((installReferrerInfo, error) => {
          if (!error) {
            if (installReferrerInfo) {
              PersistentIdentity.saveInstallReferrer(installReferrerInfo.installReferrer);
              console.log("Install referrer = " + installReferrerInfo.installReferrer);
              console.log("Referrer click timestamp seconds = " + installReferrerInfo.referrerClickTimestampSeconds);
              console.log("Install begin timestamp seconds = " + installReferrerInfo.installBeginTimestampSeconds);
              console.log("Referrer click timestamp server seconds = " + installReferrerInfo.referrerClickTimestampServerSeconds);
              console.log("Install begin timestamp server seconds = " + installReferrerInfo.installBeginTimestampServerSeconds);
              console.log("Install version = " + installReferrerInfo.installVersion);
              console.log("Google Play instant = " + installReferrerInfo.googlePlayInstant);
            } else {
              console.log("Failed to get install referrer info! Is null.");
            }
          } else {
            console.log("Failed to get install referrer info!");
            console.log("Response code: " + error.responseCode);
            console.log("Message: " + error.message);
          }
        });
      }
    }

  }

  static track(properties: EaGeneric | null) {
    EALog.assertCondition(sRTDomain != null, "The SDK has not been initialized. You must call EAnalytics" +
      ".init(Context, String) once.");
    if (properties == null) {
      StoredPropertiesTracker.run();
    } else {
      PropertiesTracker.run(properties.getJson());
    }
  }

  static getSrtDomain() {
    return sRTDomain;
  }

  static getEventEmitter() {
    return emitter;
  }

  static getAdInfoIsLAT() {
    return sAdInfoIsLAT;
  }

  static getAdInfoId() {
    return sAdInfoId;
  }
}

export default EAnalytics;