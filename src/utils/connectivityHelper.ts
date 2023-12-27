import NetInfo from "@react-native-community/netinfo";


class ConnectivityHelper {
    static async isConnected() {
        var isConnected = await NetInfo.fetch().then(state => {
            return Boolean(state.isConnected);
          });

        return isConnected;
    }
}

export default ConnectivityHelper;