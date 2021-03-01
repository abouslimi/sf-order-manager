/**
 * Created by abouslimi on 2/27/21.
 */

public with sharing class OrderController {
    /**
     * @description Get items of an order
     * @param orderId
     *
     * @return List of order items
     */
    public static List<OrderItem> getOrderItemsByOrderId(Id orderId) {
        return OrderRepository.getOrderItemsByOrderId(orderId);
    }

    public static Boolean activateOrder(Id orderId) {
        try {
            HttpResponse res = OrderRepository.activateOrderInExternalSystem(orderId);
            if (res.getStatusCode() != 200) {
                System.debug('Callout failed: ' + res);
                return false;
            } else {
                Order order = new Order(Id=orderId, Status='Activated');
                update order;
                return true;
            }
        } catch (Exception e) {
            System.debug('Exception: ' + e);
            return false;
        }
    }
}