/**
 * Created by abouslimi on 2/27/21.
 * @description Controller class of LWC Component (OrderProducts)
 */

public with sharing class OrderProductsController {
    /**
     * @description Get items of an order
     * @param orderId
     * @param intOffset
     *
     * @return List of order items
     */
    @AuraEnabled(Cacheable=true)
    public static List<OrderItem> getOrderProducts(Id orderId, Integer intOffset) {
        return OrderController.getOrderItemsByOrderId(orderId, intOffset);
    }

    @AuraEnabled(Cacheable=false)
    public static Boolean activateOrder(Id orderId) {
        return OrderController.activateOrder(orderId);
    }

    @AuraEnabled(Cacheable=false)
    public static OrderItem createOrderItem(Id orderId, Id pricebookEntryId, Id productId, Decimal unitPrice, Decimal quantity) {
        return OrderController.createOrderItem(orderId, pricebookEntryId, productId, unitPrice, quantity);
    }

    @AuraEnabled(Cacheable=false)
    public static OrderItem incrementOrderItemQuantity(Id orderItemId) {
        return OrderController.incrementOrderItemQuantity(orderItemId);
    }
}