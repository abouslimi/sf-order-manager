/**
 * Created by abouslimi on 2/27/21.
 */

public with sharing class OrderController {
    /**
     * @description Get items of an order
     * @param orderId
     * @param intOffset
     *
     * @return List of order items
     */
    public static List<OrderItem> getOrderItemsByOrderId(Id orderId, Integer intOffset) {
        return OrderRepository.getOrderItemsByOrderId(orderId, intOffset);
    }

    public static Boolean activateOrder(Id orderId) {
        try {
            HttpResponse res = OrderRepository.activateOrderInExternalSystem(orderId);
            if (res != null && res.getStatusCode() == 200) {
                try {
                    Order order = new Order(Id=orderId, Status='Activated');
                    update order;
                    return true;
                } catch (DmlException e) {
                    System.debug(e);
                }
            }
        } catch (Exception e) {
            System.debug('Exception: ' + e);
        }
        return false;
    }

    public static OrderItem createOrderItem(Id orderId, Id pricebookEntryId, Id productId, Decimal unitPrice, Decimal quantity) {
        try {
            OrderItem orderItem = new OrderItem(
                    OrderId = orderId,
                    PricebookEntryId = pricebookEntryId,
                    Product2Id = productId,
                    UnitPrice = unitPrice,
                    Quantity = quantity
            );
            insert orderItem;
            return orderItem;
        } catch (System.DmlException e) {
            System.debug('The following exception has occurred: ' + e.getMessage());
            return null;
        }
    }

    public static OrderItem incrementOrderItemQuantity(Id orderItemId) {
        try {
            OrderItem orderItem = new OrderItem(
                    Id=orderItemId,
                    Quantity=OrderRepository.getOrderItemQuantity(orderItemId) + 1
            );
            update orderItem;
            return orderItem;
        } catch (System.DmlException e) {
            System.debug('The following exception has occurred: ' + e.getMessage());
            return null;
        }
    }
}