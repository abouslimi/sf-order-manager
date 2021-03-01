/**
 * Created by abouslimi on 2/27/21.
 */

public with sharing class PricebookRepository {
    /**
     * @description
     * Get PriceBook Id of an order
     * @param orderId
     *
     * @return Id
     */
    public static Id getPricebookIdByOrderId(Id orderId) {
        List<Order> orders = [SELECT Pricebook2Id FROM Order WHERE Id = :orderId];
        if (orders.isEmpty()) { return null; }
        return orders[0].Pricebook2Id;
    }

    /**
     * @description
     * Get Entries of Order's PriceBook
     * @param orderId
     * @param intOffset
     *
     * @return List of Price entries
     */
    public static List<PricebookEntry> getPricebookEntriesByOrderId(Id orderId, Integer intOffset) {
        Id priceBookId = PricebookRepository.getPricebookIdByOrderId(orderId);
        if (priceBookId == null) return new List<PricebookEntry>();
        return [
                SELECT Name, UnitPrice, Product2Id, (SELECT Id FROM OrderItems WHERE OrderId = :orderId)
                FROM PricebookEntry
                WHERE Pricebook2Id = :priceBookId AND IsActive = TRUE
                ORDER BY Name
                LIMIT 200
                OFFSET :intOffset
        ];
    }
}