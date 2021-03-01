import { LightningElement, api, wire } from 'lwc';
import {
    getRecord,
    getFieldValue
} from 'lightning/uiRecordApi';
import ORDER_STATUS_FIELD from '@salesforce/schema/Order.Status';
import getPricebookEntries from '@salesforce/apex/AvailableProductsController.getPricebookEntriesByOrderId';
import { refreshApex } from '@salesforce/apex';
import pubsub from 'c/pubsub';

const ORDER_FIELDS = [ORDER_STATUS_FIELD];

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
    pricebookEntryColumns = PRICEBOOK_ENTRY_COLUMNS;
    @wire(getRecord, { recordId: '$recordId', fields: ORDER_FIELDS })
    order;

    @wire(getPricebookEntries, { orderId: '$recordId' })
    pricebookEntries;

    get getPricebookEntryData() {
        if (this.pricebookEntries && Array.isArray(this.pricebookEntries.data)) {
            const orderStatus = getFieldValue(this.order.data, ORDER_STATUS_FIELD);
            return this.pricebookEntries.data.map(e => {
                return {
                    ...e.pricebookEntry,
                    DisableAddButton: orderStatus === 'Activated',
                };
            });
        } else {
            return [];
        }
    }

    handleRowAction(event) {
        const product = event.detail.row;
        let payload = {
            "product": JSON.stringify(product)
        }
        pubsub.fire('ADD_ORDER_ITEM', payload);
        return refreshApex(this.pricebookEntries).then(() => {
        });
    }
}