import { Platform } from "react-native";
import EAnalytics from "../eAnalytics";
import DeviceInfo from 'react-native-device-info';
import { Double } from "react-native/Libraries/Types/CodegenTypes";
import SiteCentricProperty from "./classes/siteCentricProperty";
import SiteCentricCFlag from "./classes/siteCentricCFlag";
import Action from "./classes/action";
import Helper from "../utils/helper";

const KEY_INSTALL_REFERRER = "ea-android-referrer";
const KEY_EOS = "eos";
const KEY_EHW = "ehw";
const KEY_EHW_IDENTIFIER = "ehw-identifier";
const KEY_ADINFO_IS_LAT = "ea-android-islat";
const KEY_EUIDL = "euidl";
const KEY_URL = "url";
const KEY_APPNAME = "ea-appname";
const KEY_ADINFO_ID = "ea-android-adid";
const KEY_EPOCH = "ereplay-time";
const KEY_APP_VERSION_NAME = "ea-appversion";
const KEY_APP_VERSION_CODE = "ea-appversionbuild";
const KEY_IS_TV = "ea-apptv";
const KEY_MAC = "ea-android-mac";
const KEY_SDK_VERSION = "ea-android-sdk-version";
const KEY_PAGE_CFLAG = "cflag";

const KEY_IDFV = "ea-ios-idfv";
const KEY_IDFA = "ea-ios-idfa";
const KEY_ADTRACKING_ENABLED = "ea-ios-islat";

//- page keys
const KEY_PAGE_LATITUDE = "ea-lat";
const KEY_PAGE_LONGITUDE = "ea-lon";
const KEY_PAGE_PATH = "path";
const KEY_PAGE_EMAIL = "email";
const KEY_PAGE_UID = "uid";
const KEY_PAGE_PROFILE = "profile";
const KEY_PAGE_GROUP = "pagegroup";
const KEY_PAGE_ACTION = "action";
const KEY_PAGE_PROPERTY = "property";
const KEY_PAGE_NEW_CUSTOMER = "newcustomer";

let androidInstallReferrer: string | null = null;

class EaGeneric {
  mInternals: any;
  mPages: any;
  mProperties: any;
  constructor(builder: any) {
    this.mInternals = builder.internals;
    this.mPages = builder.pages;
    this.mProperties = builder.properties;
  }

  getJson() {
    return Helper.mergeProperties(this.mInternals, this.mPages, this.mProperties);
  }

  static Builder = class {
    properties: Record<string, any>;
    internals: Record<string, any>;
    pages: Record<string, any>;
    constructor(path: string) {
      this.properties = {};
      this.internals = {};
      this.pages = {};
      this.initInternalParams();
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      this.pages.path = path;
    }

    initInternalParams() {
      //this.internals["edebug"] = "on";

      this.internals[KEY_EOS] = Platform.OS === "android" ? "Android" : "" + DeviceInfo.getSystemVersion();

      if (Platform.OS === "android") {
        let self = this;
        DeviceInfo.getManufacturer().then((manufacturer) => {
          self.internals[KEY_EHW] = manufacturer;
        });
        DeviceInfo.getAndroidId().then((androidId) => {
          self.internals[KEY_EUIDL] = androidId;
        });
        DeviceInfo.getMacAddress().then((mac) => {
          self.internals[KEY_MAC] = mac;
        });
        //this.internals[KEY_EHW] = DeviceInfo.getManufacturer().then().getManufacturerSync() + " " + DeviceInfo.getModel();
        //this.internals[KEY_EUIDL] = DeviceInfo.getAndroidIdSync();
        //this.internals[KEY_MAC] = DeviceInfo.getMacAddressSync();
        //params[KEY_SDK_VERSION] = ""; //TODO?
        if (androidInstallReferrer) {
          self.internals[KEY_INSTALL_REFERRER] = androidInstallReferrer;
        }
      } else {

        this.internals[KEY_EHW] = DeviceInfo.getModel();
        this.internals[KEY_EHW_IDENTIFIER] = DeviceInfo.getDeviceId();

        DeviceInfo.getUniqueId().then((uniqueId) => {
          this.internals[KEY_IDFV] = uniqueId;
        });
      }
      this.internals[Platform.OS === "android" ? KEY_ADINFO_ID : KEY_IDFA] = EAnalytics.getAdInfoId();
      this.internals[Platform.OS === "android" ? KEY_ADINFO_IS_LAT : KEY_ADTRACKING_ENABLED] = EAnalytics.getAdInfoIsLAT();
      
      /*DeviceInfo.getInstallerPackageName().then((installerPackageName) => {
        let appName = installerPackageName;
        this.internals[KEY_APPNAME] = appName;
        this.internals[KEY_URL] = "http://" + appName;
      });*/
      let appName = "am1.eulerian.net/andrea/test";
      this.internals[KEY_APPNAME] = appName;
      this.internals[KEY_URL] = "http://" + appName;
      this.internals[KEY_EPOCH] = Math.floor(Date.now() / 1000);

      this.internals[KEY_APP_VERSION_CODE] = DeviceInfo.getBuildNumber();
      this.internals[KEY_APP_VERSION_NAME] = DeviceInfo.getVersion();

      return this.internals;
    }

    set(key: string, value: any) {
      this.properties[key] = value;
      return this;
    }

    static setAndroidInstallReferrer(value: string) {
      androidInstallReferrer = value;
    }

    setLocation(latitude: Double, longitude: Double) {
      this.pages.latitude = latitude;
      this.pages.longitude = longitude;
      return this;
    }

    setNewCustomer(newCustomer: boolean) {
      if (newCustomer) {
        this.pages.newcustomer = '1';
      }
      return this;
    }

    setEmail(email: string) {
      if (email) {
        this.pages.email = email;
      }
      return this;
    }

    setPageGroup(group: string) {
      if (group) {
        this.pages.pagegroup = group;
      }
      return this;
    }

    setProfile(profile: string) {
      if (profile) {
        this.pages.profile = profile;
      }
      return this;
    }

    setUID(uid: string) {
      if (uid) {
        this.pages.uid = uid;
      }
      return this;
    }

    setAction(action: Action) {
      if (action) {
        this.pages.action = action.getJson();
      }
      return this;
    }

    setProperty(property: SiteCentricProperty) {
      if (property) {
        this.pages.property = property.getJson();
      }
      return this;
    }

    setCFlag(cflag: SiteCentricCFlag) {
      if (cflag) {
        this.pages.cflag = cflag.getJson();
      }
      return this;
    }

    build() {
      return new EaGeneric(this);
    }
  }
}


export default EaGeneric;