import { LightningElement, api, wire } from 'lwc';
import getOrderProducts from '@salesforce/apex/OrderProductsController.getOrderProducts';
import { refreshApex } from '@salesforce/apex';
import {
    getRecord,
    getFieldValue,
    createRecord,
    updateRecord
} from 'lightning/uiRecordApi';
import ORDER_ID_FIELD from '@salesforce/schema/Order.Id';
import ORDER_STATUS_FIELD from '@salesforce/schema/Order.Status';
import ORDER_ITEM_ID_FIELD from '@salesforce/schema/OrderItem.Id';
import ORDER_ITEM_ORDER_ID_FIELD from '@salesforce/schema/OrderItem.OrderId';
import ORDER_ITEM_PRODUCT_ID_FIELD from '@salesforce/schema/OrderItem.Product2Id';
import ORDER_ITEM_UNIT_PRICE_FIELD from '@salesforce/schema/OrderItem.UnitPrice';
import ORDER_ITEM_QUANTITY_FIELD from '@salesforce/schema/OrderItem.Quantity';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import pubsub from 'c/pubsub';
import flatten from 'c/flatten';

const ORDER_FIELDS = [ORDER_STATUS_FIELD];

const ORDER_PRODUCT_COLUMNS = [
    { label: 'Name', fieldName: 'Product2.Name', type: 'text' },
    { label: 'Unit Price', fieldName: 'UnitPrice', type: 'currency' },
    { label: 'Quantity', fieldName: 'Quantity', type: 'number' },
    { label: 'Total Price', fieldName: 'TotalPrice', type: 'currency' }
];

export default class OrderProducts extends LightningElement {
    @api recordId;
    orderProductColumns = ORDER_PRODUCT_COLUMNS;

    @wire(getRecord, { recordId: '$recordId', fields: ORDER_FIELDS })
    order;

    @wire(getOrderProducts, { orderId: '$recordId' })
    orderProducts;

    get getOrderProductsData() {
        if (this.orderProducts && Array.isArray(this.orderProducts.data)) {
            return this.orderProducts.data.map(p => {
                return flatten(p);
            });
        } else {
            return [];
        }
    }

    get isOrderActivated() {
        return getFieldValue(this.order.data, ORDER_STATUS_FIELD) === "Activated";
    }

    connectedCallback() {
        this.register();
    }

    activateOrder() {
        const fields = {};
        fields[ORDER_ID_FIELD.fieldApiName] = this.recordId;
        fields[ORDER_STATUS_FIELD.fieldApiName] = 'Activated';
        updateRecord({ fields })
            .then(() => {
                this.displayToast('Order activated');
            }).catch(error => {
                console.error(error);
                this.displayToast('ERROR', error.body.message, 'error');
            });
    }

    register() {
        pubsub.register('ADD_ORDER_ITEM', this.handleAddOrderItemEvent.bind(this));
    }

    handleAddOrderItemEvent(event) {
        const product = JSON.parse(event.product);
        for (const orderProduct of this.orderProducts.data) {
            if (orderProduct.Product2Id === product.Product2Id) {
                return this.addOrderItem(product, orderProduct);
            }
        }
        return this.addOrderItem(product);
    }

    addOrderItem(product, oldRecord = {}) {
        let recordAction;
        const recordPayload = {};
        const fields = {};
        let successMessage;
        if (oldRecord.Id) {
            recordAction = updateRecord;
            fields[ORDER_ITEM_ID_FIELD.fieldApiName] = oldRecord.Id;
            fields[ORDER_ITEM_QUANTITY_FIELD.fieldApiName] = oldRecord.Quantity + 1;
            successMessage = 'Order item updated';
        } else {
            recordAction = createRecord;
            recordPayload.apiName = 'OrderItem';
            fields[ORDER_ITEM_ORDER_ID_FIELD.fieldApiName] = this.recordId;
            fields[ORDER_ITEM_PRODUCT_ID_FIELD.fieldApiName] = product.Id;
            fields[ORDER_ITEM_UNIT_PRICE_FIELD.fieldApiName] = product.UnitPrice;
            fields[ORDER_ITEM_QUANTITY_FIELD.fieldApiName] = 1;
            successMessage = 'Product added';
        }
        recordPayload.fields = fields;
        recordAction(recordPayload)
            .then(() => {
                this.displayToast(successMessage);
                return refreshApex(this.orderProducts).then(() => {
                });
            }).catch(error => {
                console.error(error);
                this.displayToast('ERROR', error.body.message, 'error');
            });
    }

    displayToast(title, message, variant = 'success') {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
            })
        );
    }
}
