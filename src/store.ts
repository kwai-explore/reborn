import { storeModelInstance, GraphqlClients } from './types';
import { BaseModel } from './model';
import ApolloClient from 'apollo-client';

interface StoreConstructorOptions {
    defaultClient: ApolloClient<any>
    clients?: {
        [key: string]: ApolloClient<any>
    }
}

export default class Store {
    private modelMap = new Map<BaseModel, storeModelInstance<BaseModel>>();
    graphqlClients: GraphqlClients;

    constructor(options: StoreConstructorOptions) {
        this.graphqlClients = {
            defaultClient: options.defaultClient,
            clients: options.clients || {}
        };
    }

    getModelInstance<T extends BaseModel>(constructor: T) {
        return this.modelMap.get(constructor) as storeModelInstance<T>;
    }

    registerModel<T extends BaseModel>(constructor: T) {
        if (this.modelMap.has(constructor)) {
            return this.modelMap.get(constructor) as storeModelInstance<T>;
        }
        const storeModelInstance: storeModelInstance<T> = {
            constructor,
            instance: null,
            count: 0,
        };
        this.modelMap.set(constructor, storeModelInstance);
        return storeModelInstance;
    }

    exportStates() {
        const clientsExtracts: any = {};
        for (const key in this.graphqlClients.clients) {
            clientsExtracts[key] = this.graphqlClients.clients[key].cache.extract();
        }
        return {
            defaultClient: this.graphqlClients.defaultClient.cache.extract(),
            clients: {
                ...clientsExtracts
            },
        };
    }
}