import EALog from '../models/eaLog';
import EAnalytics from '../eAnalytics';

class HttpHelper {
    static async postData(value: string) {
        EALog.debug("-> posting data : " + value);
        let sRTDomain = EAnalytics.getSrtDomain();
        let success = false;

        if (sRTDomain) {
          success = await fetch(sRTDomain + (Math.floor(Date.now() / 1000)), {
              method: 'POST',
              headers: {
                //'Content-Encoding': 'gzip',
                'Content-Type': 'application/json',
              },
              //body: gzippedData,
              body: value,
            })
              .then((response) => {
                // Gestisci la risposta qui
                EALog.debug("-> post response: " + JSON.stringify(response));
                
                if (!response.ok) {
                  throw new Error('Errore nella richiesta.');
                }
                return response.json(); // Se la risposta è JSON
                //return response.ok;
              })
              .catch((error) => {
                // Gestisci gli errori qui
                EALog.error(error);
                return false;
              });

          }
            return success;
    }
}

export default HttpHelper;