/**
 * Created by abouslimi on 2/27/21.
 * @description Controller class of LWC Component (OrderProducts)
 */

public with sharing class OrderProductsController {
    /**
     * @description Get items of an order
     * @param orderId
     *
     * @return List of order items
     */
    @AuraEnabled(Cacheable=true)
    public static List<OrderItem> getOrderProducts(Id orderId) {
        return OrderController.getOrderItemsByOrderId(orderId);
    }

    @AuraEnabled(Cacheable=false)
    public static Boolean activateOrder(Id orderId) {
        return OrderController.activateOrder(orderId);
    }
}