/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';
import EAnalytics from './src/eAnalytics';
import EAProduct from './src/models/classes/product';
import Params from './src/models/classes/params';
import EAProperties from './src/models/eaProperties';
import Action from './src/models/classes/action';
import SiteCentricProperty from './src/models/classes/siteCentricProperty';
import SiteCentricCFlag from './src/models/classes/siteCentricCFlag';
import EAOrder from './src/models/eaOrder';
import CurrencyISO from './src/utils/currencyISO';
import Product from './src/models/classes/product';
import EAProducts from './src/models/eaProducts';
import EASearch from './src/models/eaSearch';
import EAEstimate from './src/models/eaEstimate';

const latitude = 48.871835;
const longitude = 2.382430;

const pates = new Product.Builder("ref-rrr")
  .setParams(new Params.Builder()
    .addParam("marque", "pasta4ever")
    .addParam("categorie", "frais")
    .addParam("stock", 4)
    .build())
  .setName("Pates fraiches")
  .build();
const lardons = new Product.Builder("ref-lll")
  .setParams(new Params.Builder()
    .addParam("marque", "Miam Lardons")
    .addParam("categorie", "viande")
    .addParam("stock", 98)
    .build())
  .setName("Lardons Premium")
  .build();

const bonnet = new Product.Builder("ref-bonnet-rouge")
  .setName("spiderbonnet")
  .setParams(new Params.Builder()
    .addParam("origin", "Belgique")
    .addParam("tissu", "rouge")
    .addParam("fait", "machine")
    .build())
  .build();
const moufle = new Product.Builder("ref-moufle-noire")
  .setName("aeromoufle")
  .setParams(new Params.Builder()
    .addParam("origin", "France")
    .addParam("tissu", "noir")
    .addParam("fait", "main")
    .build())
  .build();
const product2 = new Product.Builder("test-reference2")
  .setName("test-name2")
  .setParams(new Params.Builder()
    .addParam("param1", "value")
    .addParam("param2", 3)
    .addParam("param3", "value-3")
    .addParam("param4", "value-4")
    .build())
  .build();
;
const product1 = new Product.Builder("test-reference1")
  .setName("test-name1")
  .setParams(new Params.Builder()
    .addParam("marque", "mars1")
    .addParam("categorie", "comestique1")
    .addParam("stock", 1)
    .addParam("taille", "43-1")
    .build())
  .build();

const App = () => {

  const onClickProperties = () => {    

    let properties = new EAProperties.Builder("the_path")
      .setNewCustomer(true)
      .setEmail("test-email")
      .setPageGroup("test-group")
      .setLocation(latitude, longitude)
      .setProfile("test-profile")
      .setUID("test-uid")
      .set("whatever", "...")
      .set("whatever1", "...")
      .set("whatever2", "...")
      .setAction(new Action.Builder()
        .setReference("test-ref-\"fefds$432`^")
        .setIn("in-test")
        .addOut("tata", "tutu", "tete")
        .build())
      .setProperty(new SiteCentricProperty.Builder()
        .set("cle1", ["poisson", "viande"])
        .set("cle2", "choucroute")
        .build())
      .setCFlag(new SiteCentricCFlag.Builder()
        .set("categorie_1", "rolandgarros", "wimbledon")
        .set("categorie_2", "tennis")
        .set("categorie_3", "usopen")
        .build())
      .build();

    EAnalytics.track(properties);
  };

  const onClickProducts = () => {
    var products = new EAProducts.Builder("test-path")
      .setEmail("prenom.nom@mail.com")
      .setLocation(latitude, longitude)
      .addProduct(product1)
      .addProduct(product2)
      .build();

    EAnalytics.track(products);
  };

  const onClickSearch = () => {
    var search = new EASearch.Builder("search-path")
      .setName("banane")
      .setParams(new Params.Builder()
        .addParam("provenance", "martinique")
        .addParam("couleur", "jaune")
        .build())
      .setResults(432)
      .build();

    EAnalytics.track(search);
  };

  const onClickCart = () => {
    // Implementa la logica per l'evento onClickCart
  };

  const onClickEstimate = () => {
    const monDevis = new EAEstimate.Builder("test-path")
                .setRef("test-ref")
                .setAmount(432)
                .setCurrency(CurrencyISO.EUR)
                .setType("test-type")
                .addProduct(pates, 32.111, 1)
                .addProduct(lardons, 3.99, 21)
                .build();

        EAnalytics.track(monDevis);
  };

  const onClickSale = () => {
    var maVente = new EAOrder.Builder("test-path")
      .setRef("test-ref")
      .setAmount(432)
      .setCurrency(CurrencyISO.EUR)
      .setType("test-type")
      .setPayment("test-payment")
      .setEstimateRef("test-estimate-ref")
      .addProduct(pates, 32.32, 1)
      .addProduct(lardons, 3.01, 21)
      .build();

    EAnalytics.track(maVente);
  };

  useEffect(() => {
    EAnalytics.init("dem.eulerian.net", true);
  }, []);

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={Colors.lighter}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic">
        <Header />
        <View style={styles.container}>
          <Button
            title="PROPERTIES"
            onPress={onClickProperties}
          />
          <Button
            title="PRODUCTS"
            onPress={onClickProducts}
          />
          <Button
            title="SEARCH"
            onPress={onClickSearch}
          />
          <Button
            title="CART"
            onPress={onClickCart}
          />
          <Button
            title="ESTIMATE"
            onPress={onClickEstimate}
          />
          <Button
            title="SALE"
            onPress={onClickSale}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
