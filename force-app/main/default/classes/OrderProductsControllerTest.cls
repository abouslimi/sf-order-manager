/**
 * Created by abouslimi on 3/1/21.
 */

@IsTest
private class OrderProductsControllerTest {
    @TestSetup
    static void testSetup() {
        OrderTestMock.createOrderMockData();
    }

    @IsTest
    static void testGetOrderProducts() {
        List<Order> orders = [
                SELECT Id
                FROM Order
                WHERE Account.AccountNumber = :OrderTestMock.TEST_ACCOUNT_NUMBER
        ];
        if (orders.isEmpty()) return;
        Order order = orders[0];

        Test.startTest();
        List<OrderItem> orderItems = OrderProductsController.getOrderProducts(order.Id, 0);
        Test.stopTest();

        System.assertNotEquals(
                OrderTestMock.TEST_GENERATED_PRODUCTS_COUNT + 1,
                orderItems.size(),
                'Order items is greater than total products'
        );
    }

    @IsTest
    static void testActivateOrder() {
        Test.setMock(HttpCalloutMock.class, new ActivateOrderInExternalSystemTestMock());
        List<Order> orders = [
                SELECT Id
                FROM Order
                WHERE Account.AccountNumber = :OrderTestMock.TEST_ACCOUNT_NUMBER
        ];
        if (orders.isEmpty()) return;
        Order order = orders[0];

        Test.startTest();
        Boolean isOrderActivated = OrderProductsController.activateOrder(order.Id);
        Test.stopTest();

        System.assertEquals(
                true,
                isOrderActivated
        );
    }

    @IsTest
    static void testCreateOrderItemAndIncrementQuantity() {
        List<Order> orders = [
                SELECT Id
                FROM Order
                WHERE Account.AccountNumber = :OrderTestMock.TEST_ACCOUNT_NUMBER
        ];
        if (orders.isEmpty()) return;
        Order order = orders[0];

        Product2 product = new Product2(
                Name = 'Product Test' ,
                ProductCode = 'Product Code',
                IsActive = true
        );
        insert product;
        PricebookEntry pricebookEntry = new PricebookEntry(
                Pricebook2Id = Test.getStandardPricebookId(),
                Product2Id = product.Id,
                UnitPrice = Math.random() * 1000,
                IsActive = true
        );
        insert pricebookEntry;

        Test.startTest();
        OrderItem orderItem = OrderProductsController.createOrderItem(
                order.Id,
                pricebookEntry.Id,
                pricebookEntry.Product2Id,
                pricebookEntry.UnitPrice,
                1
        );
        orderItem = OrderProductsController.incrementOrderItemQuantity(
                orderItem.Id
        );
        Test.stopTest();

        System.assertEquals(
                2,
                orderItem.Quantity
        );
    }
}