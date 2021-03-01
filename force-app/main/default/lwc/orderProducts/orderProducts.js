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
import ORDER_PRICEBOOK_ID_FIELD from '@salesforce/schema/Order.Pricebook2Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import pubsub from 'c/pubsub';
import flatten from 'c/flatten';

const ORDER_FIELDS = [ORDER_STATUS_FIELD, ORDER_PRICEBOOK_ID_FIELD];

const ORDER_PRODUCT_COLUMNS = [
    { label: 'Name', fieldName: 'Product2.Name', type: 'text' },
    { label: 'Unit Price', fieldName: 'UnitPrice', type: 'currency' },
    { label: 'Quantity', fieldName: 'Quantity', type: 'number' },
    { label: 'Total Price', fieldName: 'TotalPrice', type: 'currency' }
];

export default class OrderProducts extends LightningElement {
    @api recordId;
    orderItems = [];
    refreshOrderProducts;
    orderProductColumns = ORDER_PRODUCT_COLUMNS;
    enableOrderItemsTableLoading = true;
    loadMoreOrderItemsStatus;

    @wire(getRecord, { recordId: '$recordId', fields: ORDER_FIELDS })
    order;

    @wire(getOrderProducts, { orderId: '$recordId', intOffset: 0 })
    orderProducts(result) {
        this.refreshOrderProducts = result;
        const { data, error } = result;
        if (data) {
            this.orderItems = data;
        } else if (error) {
            console.error(error);
        }
    };

    get getOrderProductsData() {
        if (this.orderItems) {
            return this.orderItems.map(item => {
                return flatten(item);
            });
        } else {
            return [];
        }
    }

    get isOrderActivated() {
        return getFieldValue(this.order.data, ORDER_STATUS_FIELD) === "Activated";
    }

    get isOrderItemsTableLoading() {
        return this.loadMoreOrderItemsStatus === 'Loading';
    }

    connectedCallback() {
        this.register();
    }

    loadMoreOrderItems(event) {
        this.loadMoreOrderItemsStatus = 'Loading';
        getOrderProducts({ orderId: this.recordId, intOffset: this.orderItems.length })
            .then((data) => {
                if (data) {
                    if (data.length === 0) {
                        this.enableOrderItemsTableLoading = false;
                        this.loadMoreOrderItemsStatus = 'No more order items to load';
                    } else {
                        const currentData = this.orderItems;
                        const newData = currentData.concat(data);
                        this.orderItems = newData;
                        this.loadMoreOrderItemsStatus = '';
                    }
                }
            });
    }

    activateOrder() {
        activateOrder({ orderId: this.recordId })
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
        for (const orderItem of this.orderItems) {
            if (orderItem.Product2Id === product.Product2Id) {
                return this.handleOrderItemAddition(product, orderItem);
            }
        }
        return this.handleOrderItemAddition(product);
    }

    handleOrderItemAddition(product, orderItemRecord = {}) {
        if (orderItemRecord.Id) {
            incrementOrderItemQuantity({ orderItemId: orderItemRecord.Id })
                .then(() => {
                    this.displayToast('Order item updated');
                    return refreshApex(this.refreshOrderProducts).then(() => {
                        updateRecord({ fields: { Id: this.recordId } });
                    });
                }).catch(error => {
                    console.error(error);
                    this.displayToast('ERROR', error.body.message, 'error');
                });

        } else {
            createOrderItem({
                orderId: this.recordId,
                pricebookEntryId: getFieldValue(this.order.data, ORDER_PRICEBOOK_ID_FIELD),
                productId: product.Id,
                unitPrice: product.UnitPrice,
                quantity: 1
            })
                .then(() => {
                    this.displayToast('Product added');
                    return refreshApex(this.refreshOrderProducts).then(() => {
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
