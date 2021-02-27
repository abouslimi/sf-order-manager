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
}