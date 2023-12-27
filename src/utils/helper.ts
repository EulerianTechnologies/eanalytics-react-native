import { Permission, PermissionsAndroid } from 'react-native';


var reg = new RegExp("^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*" +
    "([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9])$");

class Helper {
    static isHostValid(domain: string) {
        return reg.test(domain);
    }

    static async isPermissionGranted(permission: Permission) {
        return await PermissionsAndroid.check(permission);
    }

    static mergeProperties(...jsonObjects: Record<string, any>[]) {
        const merged: Record<string, any> = {};
    
        jsonObjects.forEach((json) => {
          Object.keys(json).forEach((key) => {
            merged[key] = json[key];
          });
        });
      
        return merged;
      }
}

export default Helper;