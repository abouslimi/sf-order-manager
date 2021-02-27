/**
 * Created by abouslimi on 2/27/21.
 */

public with sharing class OrderRepository {
    /**
     * @description Get items of an order
     * @param orderId
     *
     * @return List of order items
     */
    public static List<OrderItem> getOrderItemsByOrderId(Id orderId) {
        return [
                SELECT Id, Product2Id, Product2.Name, UnitPrice, Quantity, TotalPrice
                FROM OrderItem
                WHERE OrderId = :orderId
                ORDER BY CreatedDate DESC
        ];
    }
}