import { LightningElement, api, wire } from 'lwc';
import getOrderProducts from '@salesforce/apex/OrderProductsController.getOrderProducts';
import activateOrder from '@salesforce/apex/OrderProductsController.activateOrder';
import createOrderItem from '@salesforce/apex/OrderProductsController.createOrderItem';
import incrementOrderItemQuantity from '@salesforce/apex/OrderProductsController.incrementOrderItemQuantity';
import { refreshApex } from '@salesforce/apex';
import {
    getRecord,
    getFieldValue,
    updateRecord
} from 'lightning/uiRecordApi';
import ORDER_STATUS_FIELD from '@salesforce/schema/Order.Status';
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
        activateOrder({orderId: this.recordId})
        .then((isOrderActivated) => {
            if (isOrderActivated) {
                updateRecord({ fields: { Id: this.recordId } });
                this.displayToast('Order activated');
            } else {
                this.displayToast('Order not activated', null, 'warning');
            }
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
                return this.handleOrderItem(product, orderProduct);
            }
        }
        return this.handleOrderItem(product);
    }

    handleOrderItem(product, oldRecord = {}) {
        if (oldRecord.Id) {
            incrementOrderItemQuantity({ orderItemId: oldRecord.Id})
            .then(() => {
                this.displayToast('Order item updated');
                return refreshApex(this.orderProducts).then(() => {
                    updateRecord({ fields: { Id: this.recordId } });
                });
            }).catch(error => {
                console.error(error);
                this.displayToast('ERROR', error.body.message, 'error');
            });

        } else {
            createOrderItem({ 
                orderId: this.recordId,
                productId: product.Id,
                unitPrice: product.UnitPrice,
                quantity: 1
            })
            .then(() => {
                this.displayToast('Product added');
                return refreshApex(this.orderProducts).then(() => {
                    updateRecord({ fields: { Id: this.recordId } });
                });
            }).catch(error => {
                console.error(error);
                this.displayToast('ERROR', error.body.message, 'error');
            });
        }
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
