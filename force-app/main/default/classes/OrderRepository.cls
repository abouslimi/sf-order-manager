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

    public static HttpResponse activateOrderInExternalSystem(Id orderId) {
        List<Order> orders = [
                SELECT  OrderNumber,
                        Type,
                        Status,
                        Account.AccountNumber,
                (SELECT Id, Product2.Name, Product2.ProductCode, UnitPrice, Quantity FROM OrderItems)
                FROM Order
                WHERE Id =:orderId
        ];
        if (orders.isEmpty()) return null;
        Order order = orders[0];
        JSONGenerator gen = JSON.createGenerator(true);
        gen.writeStartObject();
        gen.writeStringField('accountNumber', order.Account != null && order.Account.AccountNumber != null? order.Account.AccountNumber : '');
        gen.writeStringField('orderNumber', order.OrderNumber);
        gen.writeStringField('type', order.Type != null? order.Type : '');
        gen.writeStringField('status', order.Status);
        gen.writeFieldName('orderProducts');
        gen.writeStartArray();
        for(OrderItem orderItem : order.OrderItems){
            gen.writeStartObject();
            gen.writeStringField('name', orderItem.Product2.Name);
            gen.writeStringField('code', orderItem.Product2.ProductCode);
            gen.writeNumberField('unitPrice', orderItem.UnitPrice);
            gen.writeNumberField('quantity', orderItem.Quantity);
            gen.writeEndObject();
        }
        gen.writeEndArray();
        gen.writeEndObject();
        String content = gen.getAsString();
        System.debug(content);
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://sf-order-manager.requestcatcher.com/test');
        req.setTimeout(2 * 60 * 1000);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(content);
        req.setMethod('POST');
        req.setCompressed(false);
        HttpResponse res = new Http().send(req);
        System.debug(res);
        return res;
    }

    public static Decimal getOrderItemQuantity(Id orderItemId) {
        List<OrderItem> orderItems = [SELECT Quantity FROM OrderItem WHERE Id =: orderItemId];
        if (orderItems.isEmpty()) return null;
        return  orderItems[0].Quantity;
    }
}