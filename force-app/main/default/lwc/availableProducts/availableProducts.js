import { LightningElement, api, wire } from 'lwc';
import {
    getRecord,
    getFieldValue
} from 'lightning/uiRecordApi';
import ORDER_STATUS_FIELD from '@salesforce/schema/Order.Status';
import ORDER_PRICEBOOK_ID_FIELD from '@salesforce/schema/Order.Pricebook2Id';
import getPricebookEntries from '@salesforce/apex/AvailableProductsController.getPricebookEntriesByOrderId';
import pubsub from 'c/pubsub';

const ORDER_FIELDS = [ORDER_STATUS_FIELD, ORDER_PRICEBOOK_ID_FIELD];

const PRICEBOOK_ENTRY_COLUMNS = [
    {
        label: 'Name',
        fieldName: 'Name'
    },
    {
        label: 'List Price',
        fieldName: 'UnitPrice',
        type: 'currency'
    },
    {
        type: 'button-icon',
        initialWidth: 80,
        typeAttributes: {
            label: 'Add',
            title: 'Add',
            alternativeText: 'Add',
            iconName: 'utility:add',
            disabled: { fieldName: 'DisableAddButton' },
        }
    }
];

export default class AvailableProducts extends LightningElement {
    @api recordId;
    @wire(getRecord, { recordId: '$recordId', fields: ORDER_FIELDS })
    order;

    @wire(getPricebookEntries, { orderId: '$recordId', intOffset: 0 })
    pricebookEntries(result) {
        const { error, data } = result;
        if (data) {
            this.availableProducts = data;
        } else if (error) {
            console.error(error);
        }
    };

    availableProducts = [];
    getAvailableProductsColumns = PRICEBOOK_ENTRY_COLUMNS;
    enableAvailableProductsTableLoading = true;
    loadMoreAvailableProductsStatus;

    get getAvailableProducts() {
        if (this.order && this.order.data) {
            const orderStatus = getFieldValue(this.order.data, ORDER_STATUS_FIELD);
            return this.availableProducts.map(e => {
                return {
                    ...e.pricebookEntry,
                    DisableAddButton: orderStatus === 'Activated',
                };
            });
        } else {
            return [];
        }
    }

    get getOrderPricebookId() {
        return getFieldValue(this.order.data, ORDER_PRICEBOOK_ID_FIELD);
    }

    get isAvailableProductsTableLoading() {
        return this.loadMoreAvailableProductsStatus === 'Loading';
    }

    loadMoreAvailableProducts(event) {
        this.loadMoreAvailableProductsStatus = 'Loading';
        getPricebookEntries({ orderId: this.recordId, intOffset: this.availableProducts.length })
            .then((data) => {
                if (data) {
                    if (data.length === 0) {
                        this.enableAvailableProductsTableLoading = false;
                        this.loadMoreAvailableProductsStatus = 'No more available products to load';
                    } else {
                        const currentData = this.availableProducts;
                        const newData = currentData.concat(data);
                        this.availableProducts = newData;
                        this.loadMoreAvailableProductsStatus = '';
                    }
                }
            });
    }

    handleRowAction(event) {
        const product = event.detail.row;
        let payload = {
            "product": JSON.stringify(product)
        }
        pubsub.fire('ADD_ORDER_ITEM', payload);
    }
}