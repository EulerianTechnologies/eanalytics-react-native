import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALL_REFERRER_HAS_ALREADY_BEEN_SENT_ONCE = "referrer_sent_v1_8_0";
const KEY_REFERRER = "referrer";
const KEY_ADVERTISING_ID = "id";
const KEY_ADVERTISING_IS_LAT = "isLAT";

class PersistentIdentity {
  static async getValue(key: string) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Errore nel recupero dei dati:', error);
      return null;
    }
  }

  static async setValue(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
      console.info('Salvato il dato:', key, ' con valore:', value);
    } catch (error) {
      console.error('Errore nel salvataggio dei dati:', error);
    }
  }

  static async shouldFetchInstallReferrer() {
    const value = this.getValue(INSTALL_REFERRER_HAS_ALREADY_BEEN_SENT_ONCE);
    return value != null && Boolean(value);
  }


  static async isInstallReferrerSent() {
    const value = this.getValue(INSTALL_REFERRER_HAS_ALREADY_BEEN_SENT_ONCE);
    if (value != null)
      return Boolean(value);
    else return false;
  }

  static async getInstallReferrer() {
    const value = await this.getValue(KEY_REFERRER);
    return value;
  }

  static async getAdvertisingId() {
    const value = await this.getValue(KEY_ADVERTISING_ID);
    return value;
  }

  static async getAdvertisingIsLat() {
    const value = await this.getValue(KEY_ADVERTISING_IS_LAT);
    if (value != null)
      return Boolean(value);
    else return false;
  }


  static async saveInstallReferrer(value: string) {
    this.setValue(KEY_REFERRER, value);
  }

  static async shouldSendInstallReferrer() {
    const isInstallReferrerSent = await this.isInstallReferrerSent();
    const isInstallReferrerAvailable = await this.getInstallReferrer();
    return isInstallReferrerAvailable && (isInstallReferrerSent == null || !Boolean(isInstallReferrerSent));
  }

  static async setInstallReferrerSent() {
    this.setValue(INSTALL_REFERRER_HAS_ALREADY_BEEN_SENT_ONCE, "true");
  }

}

export default PersistentIdentity;