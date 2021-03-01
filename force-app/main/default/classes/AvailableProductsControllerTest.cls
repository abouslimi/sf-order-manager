/**
 * Created by abouslimi on 3/1/21.
 */

@IsTest
private class AvailableProductsControllerTest {

    @TestSetup
    static void testSetup() {
        OrderTestMock.createOrderMockData();
    }

    @IsTest
    static void getPricebookEntriesByOrderId() {
        List<Order> orders = [
                SELECT Id
                FROM Order
                WHERE Account.AccountNumber = :OrderTestMock.TEST_ACCOUNT_NUMBER
        ];
        if (orders.isEmpty()) return;
        Order order = orders[0];

        Test.startTest();
        Object pricebookEntryWrappersObject1 = AvailableProductsController.getPricebookEntriesByOrderId(order.Id, 0);
        PricebookEntryWrapper[] pricebookEntryWrappers = (PricebookEntryWrapper[]) JSON.deserialize(
                JSON.serialize(pricebookEntryWrappersObject1),
                PricebookEntryWrapper[].class
        );
        Object pricebookEntryWrappersObject2 = AvailableProductsController.getPricebookEntriesByOrderId(order.Id, pricebookEntryWrappers.size());
        pricebookEntryWrappers.addAll(
                (PricebookEntryWrapper[]) JSON.deserialize(
                    JSON.serialize(pricebookEntryWrappersObject2),
                    PricebookEntryWrapper[].class
                )
        );
        Test.stopTest();

        System.assertEquals(
                OrderTestMock.TEST_GENERATED_PRODUCTS_COUNT,
                pricebookEntryWrappers.size(),
                'Expected ' + OrderTestMock.TEST_GENERATED_PRODUCTS_COUNT + ', got ' + pricebookEntryWrappers.size() + ' available products in pricebook'
        );
    }
}