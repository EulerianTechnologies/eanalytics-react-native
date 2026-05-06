import EALog from '../models/eaLog';
import EAnalytics from '../eAnalytics';
import EaGeneric from '../models/eaGeneric';
import { EATpClick, EATpView } from '../models/eaMerchandising';

class HttpHelper {
    static async postData(value: string) {
        EALog.debug("-> posting data : " + value);
        let sRTDomain = EAnalytics.getSrtDomain();
        let success = false;

        if (sRTDomain) {
          success = await fetch(sRTDomain + (Math.floor(Date.now() / 1000)), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: value,
            })
              .then((response) => {
                EALog.debug("-> post response: " + JSON.stringify(response));
                
                if (!response.ok) {
                  throw new Error('Errore nella richiesta.');
                }
                return response.json();
              })
              .catch((error) => {
                EALog.error(error);
                return false;
              });

          }
            return success;
    }

    static async getData(value: EaGeneric) {
        let sRTDomain = EAnalytics.getSrtDomain();
        let url = "";
        if (value instanceof EATpView) {
            sRTDomain = EAnalytics.getSrtDomainView();
            var tpView = value as EATpView;
            url = tpView.toQueryString();
        } else if (value instanceof EATpClick) {
            sRTDomain = EAnalytics.getSrtDomainClick();
            var tpClick = value as EATpClick;
            url = tpClick.toQueryString();
        }
        let success = false;
      

        if (sRTDomain) {
          const fullUrl = sRTDomain + url;
          EALog.debug("-> posting data in GET : " + fullUrl);
          success = await fetch(fullUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            })
              .then((response) => {
                EALog.debug("-> post response: " + JSON.stringify(response));
                
                if (!response.ok) {
                  throw new Error('Errore nella richiesta.');
                }
                return true;
              })
              .catch((error) => {
                EALog.error(error);
                return false;
              });

          }
            return success;
    }
}

export default HttpHelper;