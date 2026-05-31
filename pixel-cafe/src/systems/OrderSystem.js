import {
  bakeryItems,
  cupSizes,
  drinkTypes,
  milkTypes,
  syrups,
} from '../data/menuItems.js';
import {
  customerColors,
  customerGreetings,
  customerNames,
  customerTextureKeys,
} from '../data/customers.js';

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export class OrderSystem {
  createBlankPreparedOrder() {
    return {
      drinkType: null,
      cupSize: null,
      milkType: null,
      syrup: null,
      bakeryItem: null,
    };
  }

  createCustomerOrder() {
    return {
      drinkType: randomFrom(drinkTypes),
      cupSize: randomFrom(cupSizes),
      milkType: randomFrom(milkTypes),
      syrup: randomFrom(syrups),
      bakeryItem: randomFrom(bakeryItems),
    };
  }

  createCustomer() {
    const animalTypes = ['duck', 'frog', 'cat', 'dog'];
    const animalType = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    
    return {
      name: randomFrom(customerNames),
      greeting: randomFrom(customerGreetings),
      color: randomFrom(customerColors),
      animalType: animalType,
      textureKey: `${animalType}-neutral`,
      neutralKey: `${animalType}-neutral`,
      happyKey: `${animalType}-happy`,
    };
  }
}
